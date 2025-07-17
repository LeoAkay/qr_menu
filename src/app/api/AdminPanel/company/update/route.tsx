import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { C_id, Username, Password, updatedBy, NewPass } = await req.json()

  if (!C_id) {
    return NextResponse.json({ error: 'Company ID (C_id) is required' }, { status: 400 })
  }

  if (C_id === 0) {
    return NextResponse.json({ error: 'Invalid Company ID (cId cannot be 0)' }, { status: 400 })
  }

  try {
    // Find user by cId first
    const userToUpdate = await prisma.user.findUnique({
      where: { cId: C_id },
    })

    if (!userToUpdate) {
      return NextResponse.json({ error: `User with C_id ${C_id} not found` }, { status: 404 })
    }

    if (userToUpdate.password !== Password) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { cId: C_id },
      data: {
        userName: Username,
        password: NewPass,
      },
    })

    // Update company updatedBy if admin id provided
    if (updatedBy) {
      await prisma.company.updateMany({
        where: { userId: updatedUser.id },
        data: { updatedBy: updatedBy },
      })
    }

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('Error updating user/company:', error)
    return NextResponse.json({ error: 'Failed to update user/company' }, { status: 500 })
  }
}