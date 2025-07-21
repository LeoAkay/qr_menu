import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from 'next/headers'

export async function DELETE(req: Request) {
  console.log("PDF delete started")
  
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const role = cookieStore.get('role')?.value

    console.log("User ID:", userId, "Role:", role)

    if (!userId || role !== 'User') {
      console.log("Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find user's company
    console.log("Looking for company for user:", userId)
    const company = await prisma.company.findFirst({
      where: { userId: userId }
    })

    if (!company) {
      console.log("Company not found for user")
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    if (!company.pdfMenuFile) {
      console.log("No PDF found for company")
      return NextResponse.json({ error: "No PDF found to delete" }, { status: 404 })
    }

    // Update company to remove PDF data from database
    console.log("Removing PDF data from company")
    await prisma.company.update({
      where: { id: company.id },
      data: {
        pdfMenuFile: null,
        pdfMenuUrl: null,
        menuType: null
      }
    })
    console.log("Company updated successfully - PDF data removed")

    return NextResponse.json({
      success: true,
      message: "PDF deleted successfully"
    })

  } catch (error) {
    console.error("PDF delete error:", error)
    
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