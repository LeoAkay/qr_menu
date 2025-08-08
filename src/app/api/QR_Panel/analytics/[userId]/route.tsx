// app/api/analytics/[userId]/route.ts
import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;
  const cookieStore = await cookies();
  
  // Get the authenticated user ID from cookies
  const authenticatedUserId = cookieStore.get('userId')?.value;
  const userRole = cookieStore.get('role')?.value;

  // Check if user is authenticated
  if (!authenticatedUserId || userRole !== 'User') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify that the authenticated user is trying to access their own analytics
  if (authenticatedUserId !== userId) {
    return NextResponse.json({ error: 'Forbidden - You can only access your own analytics' }, { status: 403 });
  }

  try {
    // Get the authenticated user to find their company ID
    const user = await prisma.user.findUnique({
      where: { id: authenticatedUserId },
      include: {
        company: true
      }
    });

    if (!user || !user.company) {
      return NextResponse.json({ error: 'User or company not found' }, { status: 404 });
    }

    // Get orders only for this user's company
    const orders = await prisma.order.findMany({
      where: { companyId: user.company.id },
      include: {
        orderItems: {
          include: {
            subCategory: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
