// /api/AdminPanel/company/getUserId/route.ts
import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { cId } = await req.json()

  if (!cId) {
    return NextResponse.json({ error: 'Missing cId' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { cId: cId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ userId: user.id })
  } catch (error) {
    console.error('Error fetching userId from cId:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
