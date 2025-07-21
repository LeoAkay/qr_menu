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
      select: { menuImage: true }
    })

    if (!item || !item.menuImage) {
      return new NextResponse('Image not found', { status: 404 })
    }

    // Return the image
    return new NextResponse(item.menuImage, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    console.error('Get image error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 