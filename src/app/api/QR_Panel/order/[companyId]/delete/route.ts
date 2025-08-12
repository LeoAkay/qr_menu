import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function DELETE(
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
  const body = await req.json();
  console.log('DELETE request body:', body);
  const { orderId } = body;

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  // Find user and check company
  const user = await prisma.user.findUnique({
    where: { id: authenticatedUserId },
    include: { company: true },
  });
  if (!user || !user.company || user.company.id !== companyId) {
    console.log('User or company mismatch:', user?.company?.id, companyId);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Find order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!order || order.companyId !== companyId) {
    console.log('Order mismatch or not found:', order?.companyId, companyId);
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Attempt delete
await prisma.orderItem.deleteMany({
  where: { orderId: orderId },
});

await prisma.order.delete({
  where: { id: orderId },
});

  
  if (global.io) {
    global.io.to(companyId).emit('order-deleted', { orderId });
  }

  return NextResponse.json({ success: true, deleted: true });
} catch (error) {
  console.error('[DELETE_ORDER ERROR]', error);
  return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
}

}
