
import { prisma } from '@/app/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'


// Get all categories and subcategories for user's company
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value
    const role = request.cookies.get('role')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user's company with categories
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          include: {
            Main_Categories: {
              include: {
                subCategories: {
                  select: {
                    id: true,
                    name: true,
                    orderNo: true,
                    price: true,
                    menuImageUrl: true,
                    stock:true
                  }
                }
              },
              orderBy: { categoryNo: 'asc' }
            }
          }
        }
      }
    })

    if (!user || !user.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      categories: user.company.Main_Categories
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 