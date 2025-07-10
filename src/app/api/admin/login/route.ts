import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { username, password } = await req.json()

  try {
    const admin = await prisma.admin.findUnique({
      where: {
        Username: username,
      },
    })

    if (!admin || admin.Password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    return NextResponse.json({ admin }, { status: 200 })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}