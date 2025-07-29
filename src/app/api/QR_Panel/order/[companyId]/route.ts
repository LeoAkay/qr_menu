// src/app/api/QR_Panel/order/[companyId]/route.ts
import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, context: { params: Promise<{ companyId: string }> }) {
  const params = await context.params;
  const { companyId } = params;
  const body = await req.json();
  const { tableNumber, orderRequest, cart, totalAmount } = body;

  if (!tableNumber || !cart || !totalAmount) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Create order
    const order = await prisma.order.create({
      data: {
        tableNumber,
        totalAmount,
        isActive: true,
        companyId,
        ...(orderRequest ? { note: orderRequest } : {}),
        orderItems: {
          create: cart.map((item: any) => ({
            subCategoryId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            subCategory: {
              select: { name: true }
            }
          }
        },
      },
    });

    console.log('Created order with full data:', JSON.stringify(order, null, 2));

    // Emit new order event using global io instance
    if (global.io) {
      console.log(`Emitting new order to company ${companyId}:`, order.id);
      global.io.to(companyId).emit('new-order', order);
    } else {
      console.warn('WebSocket server not available - order created but not emitted');
    }

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error('[ORDER_POST]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: { params?: { companyId?: string } } = {}) {
  const params = context?.params ? await context.params : {};
  const companyId = params.companyId;
  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }
  try {
    const orders = await prisma.order.findMany({
      where: { companyId },
      include: {
        orderItems: {
          include: {
            subCategory: {
              select: { name: true }
            }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('[ORDER_GET]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params?: { companyId?: string } } = {}) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }
    await prisma.order.update({
      where: { id: orderId },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ORDER_PATCH]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
