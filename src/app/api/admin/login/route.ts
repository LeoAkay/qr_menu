// /api/admin/login (example)
import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { username, password } = await req.json()

  try {
    const admin = await prisma.user.findUnique({
      where: {
        cId: 0,
        userName: username,
      },
    })

    if (!admin || admin.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const res = NextResponse.json({ admin }, { status: 200 })

    // ✅ Setting cookie correctly
    res.cookies.set("role", "Admin", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    })

    return res

  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
