import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params

    // Get the subcategory with image
    const item = await prisma.subCategory.findUnique({
      where: { id: itemId },
      select: { menuImageUrl: true }
    })

    if (!item || !item.menuImageUrl) {
      return new NextResponse('Image not found', { status: 404 })
    }

    // Return the image
    return NextResponse.redirect(item.menuImageUrl)

  } catch (error) {
    console.error('Get image error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 