// app/api/analytics/[userId]/route.ts
import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
 // Your Prisma instance

export async function GET(req: Request, { params }: { params: { companyId: string } }) {
  const { companyId } = params;

  try {
    const orders = await prisma.order.findMany({
      where: { companyId },
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
