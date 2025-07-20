import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

// Add new menu item (subcategory)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const price = formData.get('price') as string
    const mainCategoryId = formData.get('mainCategoryId') as string
    const menuImage = formData.get('menuImage') as File | null
    const id = formData.get('id') as string // ✅ Get userId from form data

    if (!id || !name || !mainCategoryId) {
      return NextResponse.json({ error: 'User ID, name, and category are required' }, { status: 400 })
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id },
      include: { company: true }
    })

    if (!user || !user.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Verify category belongs to user's company
    const category = await prisma.mainCategory.findFirst({
      where: {
        id: mainCategoryId,
        companyId: user.company.id
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Auto-generate orderNo by counting existing items in category
    const existingItemsCount = await prisma.subCategory.count({
      where: { mainCategoryId }
    })
    const orderNo = existingItemsCount + 1

    // Convert image to buffer if provided
    let imageBuffer: Buffer | undefined
    if (menuImage && menuImage.size > 0) {
      const arrayBuffer = await menuImage.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
    }

    // Create new menu item
    const newItem = await prisma.subCategory.create({
      data: {
        name,
        price: price ? parseFloat(price) : null,
        orderNo,
        mainCategoryId,
        menuImage: imageBuffer
      }
    })

    return NextResponse.json({
      success: true,
      item: newItem,
      message: 'Menu item added successfully'
    })
  } catch (error) {
    console.error('Add menu item error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete menu item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')
    const userId = searchParams.get('userId') // ✅ use from URL

    if (!userId || !itemId) {
      return NextResponse.json({ error: 'User ID and Item ID are required' }, { status: 400 })
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!user || !user.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Verify item belongs to user's company through its category
    const item = await prisma.subCategory.findFirst({
      where: {
        id: itemId,
        mainCategory: {
          companyId: user.company.id
        }
      }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Delete the item
    await prisma.subCategory.delete({
      where: { id: itemId }
    })

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    })
  } catch (error) {
    console.error('Delete item error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update menu item
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')
    const userId = searchParams.get('userId') // ✅ Fix here

    if (!userId || !itemId) {
      return NextResponse.json({ error: 'User ID and Item ID are required' }, { status: 400 })
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!user || !user.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Verify item belongs to user's company through its category
    const item = await prisma.subCategory.findFirst({
      where: {
        id: itemId,
        mainCategory: {
          companyId: user.company.id
        }
      }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const price = formData.get('price') as string
    const menuImage = formData.get('menuImage') as File | null

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    let imageBuffer: Buffer | undefined
    if (menuImage && menuImage.size > 0) {
      const arrayBuffer = await menuImage.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
    }

    const updateData: any = { name }
    if (price) updateData.price = parseFloat(price)
    if (imageBuffer) updateData.menuImage = imageBuffer

    const updatedItem = await prisma.subCategory.update({
      where: { id: itemId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: 'Item updated successfully'
    })
  } catch (error) {
    console.error('Update item error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
