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

    // Update QR URL with display mode parameter
    // Get the host from the request to use correct IP/domain
    const requestUrl = new URL(req.url, `http://${req.headers.get('host')}`)
    const baseUrl = `${requestUrl.protocol}//${req.headers.get('host')}`
    const newQrUrl = `${baseUrl}/menu/${company.id}?mode=${displayMode}`

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