import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// Fix existing QR URLs to use network IP instead of localhost
export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value
    const role = request.cookies.get('role')?.value

    if (!userId || role !== 'User') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!user || !user.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Generate new QR URL with current request host
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

    // Create new QR URL with current menu type
    const menuType = user.company.menuType || 'manual'
    const newQrUrl = `${getBaseUrl()}/QR_Portal/menu/${user.company.id}?type=${menuType}`

    // Update the company's QR URL
    await prisma.company.update({
      where: { id: user.company.id },
      data: { C_QR_URL: newQrUrl }
    })

    return NextResponse.json({
      success: true,
      message: 'QR URL updated successfully',
      oldUrl: user.company.C_QR_URL,
      newUrl: newQrUrl,
      networkIP: request.headers.get('host')
    })
  } catch (error) {
    console.error('Fix QR URLs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 