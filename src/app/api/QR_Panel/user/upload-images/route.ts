import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  console.log("Image upload started")
  
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
    const logoFile = formData.get('logo') as File | null
    const welcomingFile = formData.get('welcomingPage') as File | null
    
    console.log("Files received - Logo:", logoFile?.name, "Welcoming:", welcomingFile?.name)

    // Validate image files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    
    if (logoFile && !allowedTypes.includes(logoFile.type)) {
      return NextResponse.json({ error: "Logo must be an image file (JPEG, PNG, WebP)" }, { status: 400 })
    }
    
    if (welcomingFile && !allowedTypes.includes(welcomingFile.type)) {
      return NextResponse.json({ error: "Welcoming page must be an image file (JPEG, PNG, WebP)" }, { status: 400 })
    }

    // Check file sizes (limit to 5MB each)
    if (logoFile && logoFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Logo file too large. Maximum size is 5MB" }, { status: 400 })
    }
    
    if (welcomingFile && welcomingFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Welcoming page file too large. Maximum size is 5MB" }, { status: 400 })
    }

    // Find or create user's company
    console.log("Looking for company for user:", userId)
    let company = await prisma.company.findFirst({
      where: { userId: userId }
    })

    if (!company) {
      console.log("Creating new company for user")
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

    // Prepare update data
    const updateData: any = {}

    // Convert logo to buffer if provided
    if (logoFile) {
      const logoBytes = await logoFile.arrayBuffer()
      const logoBuffer = Buffer.from(logoBytes)
      updateData.C_Logo_Image = logoBuffer
      console.log("Logo processed, size:", logoBuffer.length)
    }

    // Convert welcoming page to buffer if provided
    if (welcomingFile) {
      const welcomingBytes = await welcomingFile.arrayBuffer()
      const welcomingBuffer = Buffer.from(welcomingBytes)
      updateData.Welcoming_Page = welcomingBuffer
      console.log("Welcoming page processed, size:", welcomingBuffer.length)
    }

    // Update company with image data
    if (Object.keys(updateData).length > 0) {
      console.log("Updating company with image data")
      await prisma.company.update({
        where: { id: company.id },
        data: updateData
      })
      console.log("Company updated successfully")
    }

    return NextResponse.json({
      success: true,
      message: "Images uploaded successfully",
      uploaded: {
        logo: !!logoFile,
        welcomingPage: !!welcomingFile
      }
    })

  } catch (error) {
    console.error("Image upload error:", error)
    
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