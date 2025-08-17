// src/app/api/QR_Panel/order/[companyId]/cancel-item/route.ts
import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const cookieStore = cookies();
  const authenticatedUserId = (await cookieStore).get('userId')?.value;
  const userRole = (await cookieStore).get('role')?.value;
  const { companyId } = params;

  if (!authenticatedUserId || userRole !== 'User') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, cancelItemIds, cancelCounts } = await req.json();

    if (!orderId || !Array.isArray(cancelItemIds) || typeof cancelCounts !== 'object') {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    // Verify user belongs to company
    const user = await prisma.user.findUnique({
      where: { id: authenticatedUserId },
      include: { company: true },
    });

    if (!user || !user.company || user.company.id !== companyId) {
      return NextResponse.json({ error: 'Forbidden - You can only modify your own company\'s orders' }, { status: 403 });
    }

    // Fetch order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order || order.companyId !== companyId) {
      return NextResponse.json({ error: 'Order not found or belongs to another company' }, { status: 404 });
    }

    // Process each cancellation
    for (const itemId of cancelItemIds) {
      const count = Number(cancelCounts[itemId]) || 0;
      if (count <= 0) continue;

      const item = order.orderItems.find(i => i.id === itemId);
      if (!item) {
        return NextResponse.json({ error: `Order item ${itemId} not found` }, { status: 404 });
      }

      const unpaidQuantity = item.quantity - item.paidQuantity;
      if (count > unpaidQuantity) {
        return NextResponse.json({ error: `Cannot cancel more than unpaid quantity for item ${itemId}` }, { status: 400 });
      }

      if (count === item.quantity) {
        // Full cancellation: delete item
        await prisma.orderItem.delete({ where: { id: itemId } });
      } else {
        // Partial cancellation: reduce quantity
        await prisma.orderItem.update({
          where: { id: itemId },
          data: { quantity: item.quantity - count },
        });
      }
    }

    // Recalculate totalAmount
    const updatedItems = await prisma.orderItem.findMany({ where: { orderId } });
    if (updatedItems.length === 0) {
      // Delete order if no items left
      await prisma.order.delete({ where: { id: orderId } });
      if (global.io) global.io.to(companyId).emit('order-deleted', { orderId });
      return NextResponse.json({ success: true, deleted: true });
    }

    const newTotal = updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { totalAmount: newTotal },
      include: { orderItems: true },
    });

    if (global.io) global.io.to(companyId).emit('order-updated', updatedOrder);

    return NextResponse.json({ success: true, updatedOrder });
  } catch (error) {
    console.error('[CANCEL_ITEM]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
