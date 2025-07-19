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

    // Find user's company
    const company = await prisma.company.findFirst({
      where: { userId: userId }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Generate QR URL with network IP for external access
    const getBaseUrl = () => {
      if (process.env.NODE_ENV === 'production') {
        return `https://${process.env.VERCEL_URL || 'localhost:3000'}`
      }
      
      // For development, try to get the actual network IP from request headers
      const host = req.headers.get('host')
      if (host && !host.includes('localhost')) {
        return `http://${host}`
      }
      
      // Fallback to localhost for direct access
      return `http://localhost:3000`
    }
    
    // Include both menu type and display mode in QR URL
    const menuTypeParam = company.menuType ? `type=${company.menuType}` : ''
    const modeParam = displayMode ? `mode=${displayMode}` : ''
    const params = [menuTypeParam, modeParam].filter(Boolean).join('&')
    const newQrUrl = `${getBaseUrl()}/QR_Portal/menu/${company.id}${params ? `?${params}` : ''}`

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