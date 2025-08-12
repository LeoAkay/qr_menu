import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const role = cookieStore.get('role')?.value

    if (!userId || role !== 'User') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { displayMode } = body

    if (!displayMode || (displayMode !== 'scroll' && displayMode !== 'flipbook')) {
      return NextResponse.json({ error: "Invalid display mode" }, { status: 400 })
    }

    // Find user's company by userId
    const company = await prisma.company.findFirst({
      where: { userId }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

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

    const menuTypeParam = company.menuType ? `type=${company.menuType}` : ''
    const modeParam = displayMode ? `mode=${displayMode}` : ''
    const params = [menuTypeParam, modeParam].filter(Boolean).join('&')
    const newQrUrl = `${getBaseUrl()}/QR_Portal/menu/${company.id}${params ? `?${params}` : ''}`

    // Update company's QR URL
    await prisma.company.update({
      where: { id: company.id },
      data: { C_QR_URL: newQrUrl }
    })

    return NextResponse.json({
      success: true,
      message: "QR URL updated successfully",
      qrUrl: newQrUrl
    })

  } catch (error) {
    console.error("QR URL update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Support both POST and PUT methods
export async function PUT(req: Request) {
  return POST(req)
}
