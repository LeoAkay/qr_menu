import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  const { userName, password } = await req.json()

  try {
    const admin = await prisma.user.findFirst({
      where: {
        userName: userName,
        password: password,
        role: {
          roleName: "Admin",
        },
      },
      include: {
        role: true,
      },
    })

    if (!admin || admin.password !== password) {
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
}


    // Create a response and set the cookie on it
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      admin: {
        ...admin,
        password: undefined, // exclude password
      },
    })

    // Set the cookie here on the response object
    response.cookies.set("role", "Admin", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax", // optional but recommended
      secure: process.env.NODE_ENV === "production", // secure cookie in prod
    })

    return response
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
