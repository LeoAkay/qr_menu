import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

// Add new category
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const id = formData.get('id') as string | null
    const name = formData.get('name') as string | null
    const backgroundImage = formData.get('backgroundImage') as File | null

    if (!id || !name) {
      return NextResponse.json({ error: 'User ID and name are required' }, { status: 400 })
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id },
      include: { company: true }
    })

    if (!user || !user.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Auto-generate categoryNo
    const existingCategoriesCount = await prisma.mainCategory.count({
      where: { companyId: user.company.id }
    })
    const categoryNo = existingCategoriesCount + 1

    // Convert image to buffer if provided
    let imageBuffer: Buffer | undefined
    if (backgroundImage && backgroundImage.size > 0) {
      const arrayBuffer = await backgroundImage.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
    }

    const newCategory = await prisma.mainCategory.create({
      data: {
        name,
        categoryNo,
        companyId: user.company.id,
        backgroundImage: imageBuffer
      }
    })
    // Update company menuType to manual if not already set
    if (user.company.menuType !== 'manual') {
      await prisma.company.update({
        where: { id: user.company.id },
        data: { menuType: 'manual' }
      })
    }

    return NextResponse.json({
      success: true,
      category: newCategory,
      message: 'Category added successfully'
    })
  } catch (error) {
    console.error('Add category error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const cId = searchParams.get('cId') // ✅ NEW: Accept cId in query

    if (!categoryId || !cId) {
      return NextResponse.json({ error: 'Category ID and cId are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { cId: parseInt(cId) },
      include: { company: true }
    })

    if (!user || !user.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Verify category belongs to user's company
    const category = await prisma.mainCategory.findFirst({
      where: {
        id: categoryId,
        companyId: user.company.id
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Delete subcategories first
    await prisma.subCategory.deleteMany({
      where: { mainCategoryId: categoryId }
    })

    // Delete main category
    await prisma.mainCategory.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


// Update category
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const cId = searchParams.get('cId') // ✅ Use cId in query params

    if (!categoryId || !cId) {
      return NextResponse.json({ error: 'Category ID and cId are required' }, { status: 400 })
    }

    // Get user's company using cId
    const user = await prisma.user.findUnique({
      where: { cId: parseInt(cId) },
      include: { company: true }
    })

    if (!user || !user.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Verify category belongs to user's company
    const category = await prisma.mainCategory.findFirst({
      where: {
        id: categoryId,
        companyId: user.company.id
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const backgroundImage = formData.get('backgroundImage') as File | null

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Convert image to buffer
    let imageBuffer: Buffer | undefined
    if (backgroundImage && backgroundImage.size > 0) {
      const arrayBuffer = await backgroundImage.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
    }

    const updateData: any = { name }
    if (imageBuffer) updateData.backgroundImage = imageBuffer

    const updatedCategory = await prisma.mainCategory.update({
      where: { id: categoryId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      category: updatedCategory,
      message: 'Category updated successfully'
    })
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
