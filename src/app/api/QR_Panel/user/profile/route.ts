import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const role = cookieStore.get('role')?.value

    if (!userId || role !== 'User') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        company: {
          include: {
            Main_Categories: {
              include: {
                subCategories: true
              }
            },
            Themes: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        password: undefined // exclude password
      }
    })

  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const role = cookieStore.get('role')?.value

    if (!userId || role !== 'User') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userName, companyName, themeData } = body

    // Update user name if provided
    if (userName) {
      await prisma.user.update({
        where: { id: userId },
        data: { userName }
      })
    }

    // Find or create company
    let company = await prisma.company.findFirst({
      where: { userId: userId }
    })

    if (!company) {
      company = await prisma.company.create({
        data: {
          userId: userId,
          C_Name: companyName || `${userName || 'User'}'s Restaurant`
        }
      })
    } else if (companyName) {
      // Update company name
      await prisma.company.update({
        where: { id: company.id },
        data: { C_Name: companyName }
      })
    }

    // Update theme if provided
    if (themeData && company) {
      const existingTheme = await prisma.theme.findFirst({
        where: { companyId: company.id }
      })

      if (existingTheme) {
        await prisma.theme.update({
          where: { id: existingTheme.id },
          data: {
            style: themeData.style || existingTheme.style,
            backgroundColor: themeData.backgroundColor || existingTheme.backgroundColor,
            logoAreaColor: themeData.logoAreaColor || existingTheme.logoAreaColor,
            textColor: themeData.textColor || existingTheme.textColor,
            facebookUrl: themeData.facebookUrl || existingTheme.facebookUrl,
            instagramUrl: themeData.instagramUrl || existingTheme.instagramUrl,
            xUrl: themeData.xUrl || existingTheme.xUrl
          }
        })
      } else {
        await prisma.theme.create({
          data: {
            companyId: company.id,
            style: themeData.style || 'modern',
            backgroundColor: themeData.backgroundColor || '#ffffff',
            logoAreaColor: themeData.logoAreaColor || '#f8f9fa',
            textColor: themeData.textColor || '#000000',
            facebookUrl: themeData.facebookUrl || null,
            instagramUrl: themeData.instagramUrl || null,
            xUrl: themeData.xUrl || null
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    })

  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 