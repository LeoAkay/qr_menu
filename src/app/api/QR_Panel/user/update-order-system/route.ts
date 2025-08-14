import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { orderSystem } = await request.json()
    
    // Get user from session
    const userRes = await fetch(`${request.nextUrl.origin}/api/QR_Panel/user/profile`, {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    })
    
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userData = await userRes.json()
    
    if (!userData.user?.company?.id) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    
    // Update company order system setting
    const updatedCompany = await prisma.company.update({
      where: { id: userData.user.company.id },
      data: { orderSystem }
    })
    
    return NextResponse.json({ 
      success: true, 
      orderSystem: updatedCompany.orderSystem 
    })
    
  } catch (error) {
    console.error('Update order system error:', error)
    return NextResponse.json(
      { error: 'Failed to update order system setting' }, 
      { status: 500 }
    )
  }
}
