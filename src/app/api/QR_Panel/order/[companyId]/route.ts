// src/app/api/QR_Panel/order/[companyId]/route.ts
import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest, context: { params: { companyId: string } }) {
  const params = await context.params
  const companyId = params.companyId
  try {
   
    const body = await req.json();
    const { tableNumber, orderRequest, cart, totalAmount } = body;

    if (!tableNumber || !cart || !totalAmount) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

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
    });

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error('[ORDER_POST]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
