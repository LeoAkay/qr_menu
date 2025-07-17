import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from 'next/headers'

export async function DELETE(req: Request) {
  console.log("Image delete started")
  
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const role = cookieStore.get('role')?.value

    if (!userId || role !== 'User') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const imageType = searchParams.get('type')

    if (!imageType || (imageType !== 'logo' && imageType !== 'welcoming')) {
      return NextResponse.json({ error: "Invalid image type" }, { status: 400 })
    }

    // Find user's company
    const company = await prisma.company.findFirst({
      where: { userId: userId }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Update company to remove image data
    const updateData: any = {}
    if (imageType === 'logo') {
      updateData.C_Logo_Image = null
    } else if (imageType === 'welcoming') {
      updateData.Welcoming_Page = null
    }

    await prisma.company.update({
      where: { id: company.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: `${imageType === 'logo' ? 'Logo' : 'Hoş geldin resmi'} başarıyla silindi`
    })

  } catch (error) {
    console.error("Image delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 