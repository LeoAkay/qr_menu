import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        Main_Categories: {
          include: {
            subCategories: true
          },
          orderBy: {
            categoryNo: 'asc'
          }
        },
        Themes: true,
        user: {
          select: { userName: true }
        }
      }
    })

    if (!company) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      company: {
        ...company,
        // Convert Buffer to base64 if needed for logo
        C_Logo_Image: company.C_Logo_Image ? company.C_Logo_Image.toString() : null
      }
    })

  } catch (error) {
    console.error("Menu fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 