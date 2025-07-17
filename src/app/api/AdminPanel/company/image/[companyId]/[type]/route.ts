import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { companyId: string; type: string } }
) {
  try {
    const { companyId, type } = params

    if (!companyId || !type) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    if (type !== 'logo' && type !== 'welcoming') {
      return NextResponse.json({ error: "Invalid image type" }, { status: 400 })
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        C_Logo_Image: type === 'logo',
        Welcoming_Page: type === 'welcoming'
      }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const imageData = type === 'logo' ? company.C_Logo_Image : company.Welcoming_Page

    if (!imageData) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Return the image as a response
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': 'image/jpeg', // Default to JPEG, browser will handle other formats
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      }
    })

  } catch (error) {
    console.error("Image retrieve error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 