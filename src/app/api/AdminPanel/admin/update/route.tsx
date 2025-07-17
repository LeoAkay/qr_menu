import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { C_id, Username, Password, Pass } = await req.json()

  if (!C_id) {
    return NextResponse.json({ error: 'Company ID (C_id) is required' }, { status: 400 })
  }

  try {
    // Find user by cId first
    const userToUpdate = await prisma.user.findUnique({
      where: { cId: C_id, 
        roleId: "1"
      },
    })

    if (!userToUpdate) {
      return NextResponse.json({ error: `User with C_id ${C_id} not found` }, { status: 404 })
    }

    // Check password before updating
    if (userToUpdate.password !== Pass) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { cId: C_id, roleId: "1" },
      data: {
        userName: Username,
        password: Password,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('Error updating Admin:', error)
    return NextResponse.json({ error: 'Failed to update Admin' }, { status: 500 })
  }
}