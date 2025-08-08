import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.DB_URL!, process.env.ROLE_KEY!)

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

    // Find or create user's company
    console.log("Looking for company for user:", userId)
    let company = await prisma.company.findFirst({
      where: { userId: userId },
      select: {
        id: true,
        pdfMenuUrl: true
      }
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
      
      // Delete old PDF from Supabase storage if exists
      if (company.pdfMenuUrl) {
        try {
          const oldUrl = new URL(company.pdfMenuUrl)
          const oldFileName = oldUrl.pathname.split('/').pop()
          
          if (oldFileName && oldFileName.startsWith('menu-')) {
            console.log("Deleting old PDF from Supabase storage:", oldFileName)
            
            const { error: deleteError } = await supabase.storage
              .from('qrmenu')
              .remove([`pdf/${oldFileName}`])

            if (deleteError) {
              console.error('Old PDF delete error:', deleteError)
              // Continue with upload even if old file deletion fails
            } else {
              console.log("Old PDF deleted successfully from Supabase storage")
            }
          }
        } catch (urlError) {
          console.error('Error parsing old PDF URL:', urlError)
          // Continue with upload even if URL parsing fails
        }
      }
    }

    // Convert file to buffer for Supabase upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload PDF to Supabase Storage
    const fileName = `pdf/menu-${company.id}-${Date.now()}.pdf`
    console.log("Uploading PDF to Supabase storage:", fileName)
    
    try {
      const { data, error } = await supabase.storage
        .from('qrmenu')
        .upload(fileName, buffer, {
          contentType: 'application/pdf',
          upsert: true // Replace if file with same name exists
        })

      if (error) {
        console.error('Supabase upload error:', error)
        return NextResponse.json({ error: error.message || 'PDF upload failed' }, { status: 500 })
      }

      console.log("PDF uploaded successfully to Supabase:", data)

      // Get public URL for the uploaded PDF
      const { data: publicUrlData } = supabase
        .storage
        .from('qrmenu')
        .getPublicUrl(fileName)

      const pdfUrl = publicUrlData?.publicUrl

      if (!pdfUrl) {
        console.error("Failed to get public URL for uploaded PDF")
        return NextResponse.json({ error: "Failed to get PDF URL" }, { status: 500 })
      }

      console.log("PDF public URL:", pdfUrl)

      // Function to get the base URL for QR code link generation
      const getBaseUrl = () => {
        // Always use the current request's host for dynamic URL generation
        const host = req.headers.get('host')
        const protocol = req.headers.get('x-forwarded-proto') || 
                        (host?.includes('localhost') ? 'http' : 'https')
        
        if (host) {
          return `${protocol}://${host}`
        }
        
        // Fallback options
        if (process.env.NODE_ENV === 'production') {
          return `https://${process.env.VERCEL_URL || 'localhost:3000'}`
        }
        
        return 'http://localhost:3000'
      }

      const qrUrl = `${getBaseUrl()}/QR_Portal/menu/${company.id}?mode=flipbook`

      // Update company with PDF URL in database
      console.log("Updating company with PDF URL in database")
      await prisma.company.update({
        where: { id: company.id },
        data: {
          pdfMenuUrl: pdfUrl, // Store Supabase URL
          menuType: "pdf",
          C_QR_URL: qrUrl
        }
      })
      console.log("Company updated successfully")

      return NextResponse.json({
        success: true,
        message: "PDF uploaded successfully to Supabase storage",
        menuUrl: `/QR_Portal/menu/${company.id}`,
        pdfUrl: pdfUrl
      })

    } catch (uploadError) {
      console.error('Unexpected Supabase error:', uploadError)
      return NextResponse.json({ error: 'Unexpected error uploading PDF' }, { status: 500 })
    }

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