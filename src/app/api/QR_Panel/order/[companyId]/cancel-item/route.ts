// src/app/api/QR_Panel/order/[companyId]/cancel-item/route.ts
import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const cookieStore = await cookies();
  const authenticatedUserId = cookieStore.get('userId')?.value;
  const userRole = cookieStore.get('role')?.value;
  const { companyId } = params;

  if (!authenticatedUserId || userRole !== 'User') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, cancelItemIds, cancelCounts } = await req.json();

    if (!orderId || !Array.isArray(cancelItemIds) || typeof cancelCounts !== 'object') {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    // Check if user belongs to the same company
    const user = await prisma.user.findUnique({
      where: { id: authenticatedUserId },
      include: { company: true },
    });

    if (!user || !user.company || user.company.id !== companyId) {
      return NextResponse.json({ error: 'Forbidden - You can only modify your own company\'s orders' }, { status: 403 });
    }

    // Fetch the order and items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order || order.companyId !== companyId) {
      return NextResponse.json({ error: 'Order not found or belongs to another company' }, { status: 404 });
    }

    // Validate and process cancellations
    for (const itemId of cancelItemIds) {
      const count = Number(cancelCounts[itemId]) || 0;
      if (count <= 0) continue;

      const item = order.orderItems.find(i => i.id === itemId);
      if (!item) {
        return NextResponse.json({ error: `Order item ${itemId} not found` }, { status: 404 });
      }

      const unpaid = item.quantity - item.paidQuantity;
      if (count > unpaid) {
        return NextResponse.json({ error: `Cannot cancel more than unpaid quantity for item ${itemId}` }, { status: 400 });
      }

      if (count === item.quantity) {
        // Full cancellation — delete item
        await prisma.orderItem.delete({ where: { id: itemId } });
      } else {
        // Partial cancellation — reduce quantity
        await prisma.orderItem.update({
          where: { id: itemId },
          data: { quantity: item.quantity - count },
        });
      }
    }

    // Check if order has any items left
    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { subCategory: { select: { name: true } } } },
      },
    });

    if (updatedOrder && updatedOrder.orderItems.length === 0) {
      // Delete order completely if empty
      await prisma.order.delete({
        where: { id: orderId },
      });

      // Notify clients to remove it
      if (global.io) {
        global.io.to(companyId).emit('order-deleted', { orderId });
      }

      return NextResponse.json({ success: true, deleted: true });
    }

    // Otherwise, return updated order state
    if (global.io) {
      global.io.to(companyId).emit('order-updated', updatedOrder);
    }

    return NextResponse.json({ success: true, updatedOrder });
  } catch (error) {
    console.error('[CANCEL_ITEM]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
