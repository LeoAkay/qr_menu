import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/app/lib/prisma"


export async function GET() {
  try {
    console.log("Auth check API called")
    
    const cookieStore = await cookies()
    const session = cookieStore.get("session")

    if (!session) {
      console.log("No session cookie found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("Session found:", session.value)

    // Verify the session exists in database with proper field names
    const user = await prisma.user.findUnique({
      where: { id: session.value },
      select: { 
        id: true, 
        userName: true,
        cId: true,
        role: {
          select: {
            roleName: true
          }
        },
        company: {
          select: {
            id: true,
            C_Name: true
          }
        }
      },
    })

    if (!user) {
      console.log("User not found for session:", session.value)
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    console.log("User authenticated:", user.userName)
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ 
      error: "Authentication check failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}