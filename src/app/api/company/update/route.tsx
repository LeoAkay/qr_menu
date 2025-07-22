import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { C_id, Username, Password } = await req.json()

  if (!C_id) {
    return NextResponse.json({ error: 'Company ID (C_id) is required' }, { status: 400 })
  }

  try {
    if (C_id === 0) {
    return NextResponse.json({ error: 'Invalid Company ID (cId cannot be 0)' }, { status: 400 })
  }
    const company = await prisma.user.update({
      where: {
        cId: C_id,
      },
      data: {
        userName: Username,
        password: Password,
      },
    })

    return NextResponse.json(company)
  } catch (error: any) {
    console.error('Error updating company:', error)
    if (error.code === 'P2025') {
      // P2025 is Prisma's error code for "An operation failed because it depends on one or more records that were required but not found."
      return NextResponse.json({ error: `Company with ID ${C_id} not found.` }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
  }
}