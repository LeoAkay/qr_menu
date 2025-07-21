import { prisma } from '@/app/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// POST request to get categories and subcategories by company ID
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json()
    console.log('Received id:', id)


if (!id) {
  return NextResponse.json({ error: 'Company ID missing' }, { status: 400 })
}

// Convert number to string here before querying Prisma
const company = await prisma.company.findUnique({
  where: { userId: id },
  include: {
    Main_Categories: {
      include: {
        subCategories: {
          select: {
            id: true,
            name: true,
            orderNo: true,
            price: true,
            menuImage: true,
          }
        }
      },
      orderBy: { categoryNo: 'asc' }
    }
  }
})

console.log('Company fetched:', company)

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      categories: company.Main_Categories
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
