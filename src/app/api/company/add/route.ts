import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { cId, userName, password } = await req.json()

  
  if (!cId || !userName || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        cId,
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this cId' }, { status: 409 })
    }

    let userRole = await prisma.role.findUnique({
  where: { roleName: 'USER' },
})

if (!userRole) {
  userRole = await prisma.role.create({
    data: { roleName: 'USER' },
  })
}

    

    const newUser = await prisma.user.create({
  data: {
    cId: cId,
    userName: userName,
    password,
    role: {
    
      connect: { id: userRole.id },
    },
  },
})
    // Create company linked to the newly created user
    const newCompany = await prisma.company.create({
      data: {
        userId: newUser.id,
      }
    })

    return NextResponse.json({ user: newUser, company: newCompany }, { status: 201 })

  } catch (error) {
    console.error('Error creating user & company:', error)
    return NextResponse.json({ error: 'Failed to create user and company' }, { status: 500 })
  }
}
