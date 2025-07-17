import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    })

    // Clear cookies
    response.cookies.set("role", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0
    })

    response.cookies.set("userId", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0
    })

    return response

  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 