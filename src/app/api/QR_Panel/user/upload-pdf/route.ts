import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  console.log("PDF upload started")
  
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const role = cookieStore.get('role')?.value

    console.log("User ID:", userId, "Role:", role)

    if (!userId || role !== 'User') {
      console.log("Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('pdf') as File

    console.log("File received:", file?.name, "Type:", file?.type, "Size:", file?.size)

    if (!file || file.type !== 'application/pdf') {
      console.log("Invalid file type:", file?.type)
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log("File too large:", file.size)
      return NextResponse.json({ error: "File too large. Maximum size is 10MB" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Find or create user's company
    console.log("Looking for company for user:", userId)
    let company = await prisma.company.findFirst({
      where: { userId: userId }
    })

    if (!company) {
      console.log("Creating new company for user")
      // Create new company for user
      company = await prisma.company.create({
        data: {
          userId: userId,
          C_Name: `${await getUserName(userId)}'s Restaurant`
        }
      })
      console.log("Company created:", company.id)
    } else {
      console.log("Company found:", company.id)
    }

    // Update company with PDF data (save to database as BLOB)
    console.log("Updating company with PDF data in database")
    await prisma.company.update({
      where: { id: company.id },
      data: {
        pdfMenuFile: buffer,
        pdfMenuUrl: null, // Clear old file path
        menuType: "pdf",
        C_QR_URL: `http://${req.headers.get('host')}/menu/${company.id}?mode=flipbook`
      }
    })
    console.log("Company updated successfully")

    return NextResponse.json({
      success: true,
      message: "PDF uploaded successfully",
      menuUrl: `/menu/${company.id}`
    })

  } catch (error) {
    console.error("PDF upload error:", error)
    
    // More specific error handling
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

async function getUserName(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userName: true }
  })
  return user?.userName || 'User'
} 