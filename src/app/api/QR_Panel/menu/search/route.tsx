// app/api/QR_Panel/menu/search/route.ts

import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const companies = await prisma.company.findMany({
      where: {
        C_Name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        C_Name: true,
        C_QR_URL: true,
      },
      take: 10,
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
