import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.DB_URL!, process.env.ROLE_KEY!)

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

    if (!company.pdfMenuUrl) {
      console.log("No PDF found for company")
      return NextResponse.json({ error: "No PDF found to delete" }, { status: 404 })
    }

    // If there's a Supabase URL, delete from Supabase storage
    if (company.pdfMenuUrl) {
      try {
        // Extract filename from URL
        const url = new URL(company.pdfMenuUrl)
        const fileName = url.pathname.split('/').pop()
        
        if (fileName && fileName.startsWith('menu-')) {
          console.log("Deleting PDF from Supabase storage:", fileName)
          
          const { error } = await supabase.storage
            .from('qrmenu')
            .remove([`pdf/${fileName}`])

          if (error) {
            console.error('Supabase delete error:', error)
            // Continue with database update even if Supabase delete fails
          } else {
            console.log("PDF deleted successfully from Supabase storage")
          }
        }
      } catch (urlError) {
        console.error('Error parsing PDF URL:', urlError)
        // Continue with database update even if URL parsing fails
      }
    }

    // Update company to remove PDF data from database
    console.log("Removing PDF data from company")
    await prisma.company.update({
      where: { id: company.id },
      data: {
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