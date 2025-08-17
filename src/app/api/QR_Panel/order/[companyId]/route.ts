// src/app/api/QR_Panel/order/[companyId]/route.ts
import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest, context: { params: Promise<{ companyId: string }> }) {
  const params = await context.params;
  const { companyId } = await params;
  const body = await req.json();
  const { tableNumber, orderRequest, cart, totalAmount } = body;

  if (!tableNumber || !cart || !totalAmount) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Check existing active order
    const existingOrder = await prisma.order.findFirst({
      where: { tableNumber, companyId, isActive: true },
      include: { orderItems: { include: { subCategory: { select: { name: true } } } } },
    });

    let order;
    let isNewOrder = false;

    if (existingOrder) {
      // Add new items to existing order
      const newOrderItems = cart.map((item: any) => ({
        subCategoryId: item.id,
        quantity: item.quantity,
        price: item.price,
        orderId: existingOrder.id,
      }));
      await prisma.orderItem.createMany({ data: newOrderItems });

      // Fetch updated order
      order = await prisma.order.findUnique({
        where: { id: existingOrder.id },
        include: { orderItems: { include: { subCategory: { select: { name: true } } } } },
      });

      // Compute remaining amount dynamically
      const remainingAmount = order!.orderItems.reduce(
        (sum, item) => sum + item.price * (item.quantity - item.paidQuantity),
        0
      );

      // Update note if needed
      if (orderRequest) {
        await prisma.order.update({
          where: { id: existingOrder.id },
          data: { note: order!.note ? `${order!.note}; ${orderRequest}` : orderRequest },
        });
      }

      // Emit updated order
      global.io?.to(companyId).emit('order-updated', { ...order, remainingAmount });

      return NextResponse.json({ orderId: existingOrder.id, isNewOrder: false, remainingAmount, message: 'Order updated successfully' });
    } else {
      // Create new order
      order = await prisma.order.create({
        data: {
          tableNumber,
          totalAmount,
          isActive: true,
          companyId,
          ...(orderRequest ? { note: orderRequest } : {}),
          orderItems: { create: cart.map((item: any) => ({ subCategoryId: item.id, quantity: item.quantity, price: item.price })) },
        },
        include: { orderItems: { include: { subCategory: { select: { name: true } } } } },
      });

      isNewOrder = true;

      const remainingAmount = order.orderItems.reduce(
        (sum, item) => sum + item.price * (item.quantity - item.paidQuantity),
        0
      );

      global.io?.to(companyId).emit('new-order', { ...order, remainingAmount });

      return NextResponse.json({ orderId: order.id, isNewOrder, remainingAmount, message: 'Order created successfully' }, { status: 201 });
    }
  } catch (error) {
    console.error('[ORDER_POST]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: { params?: { companyId?: string } } = {}) {
  const params = context?.params ? await context.params : {};
  const companyId = params.companyId;
  const cookieStore = await cookies();

  const authenticatedUserId = cookieStore.get('userId')?.value;
  const userRole = cookieStore.get('role')?.value;

  if (!authenticatedUserId || userRole !== 'User') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: authenticatedUserId }, include: { company: true } });
    if (!user || !user.company || user.company.id !== companyId) {
      return NextResponse.json({ error: 'Forbidden - You can only access your own company\'s orders' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: { companyId },
      include: { orderItems: { include: { subCategory: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    // Compute remainingAmount for each order dynamically
    const ordersWithRemaining = orders.map(o => ({
      ...o,
      remainingAmount: o.orderItems.reduce((sum, item) => sum + item.price * (item.quantity - item.paidQuantity), 0)
    }));

    return NextResponse.json({ orders: ordersWithRemaining }, { status: 200 });
  } catch (error) {
    console.error('[ORDER_GET]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  const authenticatedUserId = cookieStore.get('userId')?.value;
  const userRole = cookieStore.get('role')?.value;

  if (!authenticatedUserId || userRole !== 'User') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, payCounts, markInactive } = await req.json();
    if (!orderId) return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { company: true } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: authenticatedUserId }, include: { company: true } });
    if (!user || !user.company || user.company.id !== order.companyId) {
      return NextResponse.json({ error: 'Forbidden - You can only modify your own company\'s orders' }, { status: 403 });
    }

    if (payCounts && typeof payCounts === 'object') {
      await Promise.all(Object.entries(payCounts).map(async ([itemId, count]) => {
        const incrementBy = Number(count);
        if (incrementBy <= 0) return;

        await prisma.orderItem.update({ where: { id: itemId }, data: { paidQuantity: { increment: incrementBy } } });

        const latest = await prisma.orderItem.findUnique({ where: { id: itemId } });
        if (latest && latest.paidQuantity >= latest.quantity) {
          await prisma.orderItem.update({ where: { id: itemId }, data: { isPaid: true } });
        }
      }));
    }

    const items = await prisma.orderItem.findMany({ where: { orderId } });
    const remainingAmount = items.reduce((sum, item) => sum + item.price * (item.quantity - item.paidQuantity), 0);

    if (markInactive || items.every(item => item.paidQuantity >= item.quantity)) {
      await prisma.order.update({ where: { id: orderId }, data: { isActive: false } });
    }

    return NextResponse.json({ success: true, remainingAmount });
  } catch (error) {
    console.error('[PATCH_ORDER_PAYMENT]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
