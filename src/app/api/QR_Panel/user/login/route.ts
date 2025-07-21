import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { userName, password } = await req.json()

  try {
    // Find the user by username and role
    const user = await prisma.user.findFirst({
      where: {
        userName: userName,
        role: {
          roleName: "User",
        },
      },
      include: {
        role: true,
        company: true,
      },
    })

    // Check if user exists and verify password
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check password - assuming it might be plain text for now
    const isPasswordValid = user.password === password;
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create a response and set the cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        ...user,
        password: undefined, // exclude password
      },
    })

    // Set the cookie for user session
    response.cookies.set("role", "User", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax", 
      secure: process.env.NODE_ENV === "production",
    })

    response.cookies.set("userId", user.id, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax", 
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (err) {
    console.error("User login error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 