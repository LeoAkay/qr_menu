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

    // Generate QR URL with current request host for dynamic access
    const getBaseUrl = () => {
      // Always use the current request's host for dynamic URL generation
      const host = request.headers.get('host')
      const protocol = request.headers.get('x-forwarded-proto') || 
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