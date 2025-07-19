import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// Update menu type and generate QR URL
export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value
    const role = request.cookies.get('role')?.value

    if (!userId || role !== 'User') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { menuType } = await request.json()

    if (!menuType || !['pdf', 'manual'].includes(menuType)) {
      return NextResponse.json({ error: 'Valid menu type (pdf/manual) is required' }, { status: 400 })
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!user || !user.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Generate QR URL with network IP for external access
    const getBaseUrl = () => {
      if (process.env.NODE_ENV === 'production') {
        return `https://${process.env.VERCEL_URL || 'localhost:3000'}`
      }
      
      // For development, try to get the actual network IP from request headers
      const host = request.headers.get('host')
      if (host && !host.includes('localhost')) {
        return `http://${host}`
      }
      
      // Fallback to localhost for direct access
      return `http://localhost:3000`
    }
      
    const qrUrl = `${getBaseUrl()}/QR_Portal/menu/${user.company.id}?type=${menuType}`

    // Update company with new menu type and QR URL
    await prisma.company.update({
      where: { id: user.company.id },
      data: {
        menuType,
        C_QR_URL: qrUrl
      }
    })

    return NextResponse.json({
      success: true,
      message: `Menu type updated to ${menuType}`,
      qrUrl,
      menuType
    })
  } catch (error) {
    console.error('Update menu type error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 