import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

// Add new category
export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value
    const role = request.cookies.get('role')?.value

   
    
    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!user || !user.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Auto-generate categoryNo by counting existing categories
    const existingCategoriesCount = await prisma.mainCategory.count({
      where: { companyId: user.company.id }
    })
    const categoryNo = existingCategoriesCount === 0 ? 1 : existingCategoriesCount + 1;


    

    // Create new category
    const newCategory = await prisma.mainCategory.create({
      data: {
        name,
        categoryNo,
        companyId: user.company.id,
       
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
    const userId = request.cookies.get('userId')?.value
    const role = request.cookies.get('role')?.value

  

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    // Delete all subcategories first
    await prisma.subCategory.deleteMany({
      where: { mainCategoryId: categoryId }
    })

    // Delete the category
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
    const userId = request.cookies.get('userId')?.value
    const role = request.cookies.get('role')?.value

    if (!userId || role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

 

    // Update the category
    const updateData: any = { name }
 

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