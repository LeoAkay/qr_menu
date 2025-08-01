import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.DB_URL!,
     process.env.ROLE_KEY!)
// Add new menu item (subcategory)
export async function POST(request: NextRequest) {
let imageUrl: string | null = null
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
    const price = formData.get('price') as string
    const mainCategoryId = formData.get('mainCategoryId') as string
    const menuImage = formData.get('menuImage') as File | null

    if (!name || !mainCategoryId) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 })
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
if (menuImage && menuImage.size > 0) {
  const arrayBuffer = await menuImage.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Upload image to Supabase Storage
  const fileName = `items/${Date.now()}-${menuImage.name}`
  try {
  const { data, error } = await supabase.storage
    .from('qrmenu')
    .upload(fileName, buffer, {
      contentType: menuImage.type || 'image/jpeg' // fallback
    })

  if (error) {
    console.error('Supabase upload error:', error)
    return NextResponse.json({ error: error.message || 'Image upload failed' }, { status: 500 })
  }

  const { data: publicUrlData } = supabase
    .storage
    .from('qrmenu')
    .getPublicUrl(fileName)

  imageUrl = publicUrlData?.publicUrl || null
} catch (uploadError) {
  console.error('Unexpected Supabase error:', uploadError)
  return NextResponse.json({ error: 'Unexpected error uploading image' }, { status: 500 })
}
}


    // Create new menu item
    const newItem = await prisma.subCategory.create({
  data: {
    name,
    price: price ? parseFloat(price) : null,
    orderNo,
    mainCategoryId,
    menuImageUrl: imageUrl
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
    const userId = request.cookies.get('userId')?.value
   
    const { itemId } = Object.fromEntries(new URL(request.url).searchParams)
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })
    if (!user?.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const item = await prisma.subCategory.findFirst({
      where: {
        id: itemId,
        mainCategory: { companyId: user.company.id }
      },
      select: { menuImageUrl: true }
    })
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Attempt to delete image from Supabase if exists
    if (item.menuImageUrl) {
      const pathSegments = item.menuImageUrl.split('/').slice(-2)
      const filePath = pathSegments.join('/')
      const { error: deleteErr } = await supabase.storage
        .from('qrmenu')
        .remove([filePath])
      if (deleteErr) console.error('Error deleting image file:', deleteErr)
    }

    // Delete from database
    await prisma.subCategory.delete({ where: { id: itemId } })

    return NextResponse.json({ success: true, message: 'Item and image deleted' })
  } catch (error) {
    console.error('Delete item error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
// Update menu item
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const userId = searchParams.get('userId');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch user and their company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user?.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Validate item exists for this company
    const item = await prisma.subCategory.findFirst({
      where: {
        id: itemId,
        mainCategory: {
          companyId: user.company.id
        }
      }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const menuImage = formData.get('menuImage') as File | null;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const updateData: any = { name };

    if (price) {
      updateData.price = parseFloat(price);
    }

    // Upload new image to Supabase
    if (menuImage && menuImage.size > 0) {
      const supabase = createClient(process.env.DB_URL!, process.env.ROLE_KEY!);

      // Delete old image if it exists
      if (item.menuImageUrl) {
        const oldPath = item.menuImageUrl.split('/').slice(-2).join('/');
        const { error: deleteError } = await supabase.storage.from('qrmenu').remove([oldPath]);
        if (deleteError) {
          console.warn('Failed to delete old image:', deleteError.message);
        }
      }

      const arrayBuffer = await menuImage.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileName = `items/${Date.now()}-${menuImage.name}`;
      const { error: uploadError } = await supabase.storage
        .from('qrmenu')
        .upload(fileName, buffer, {
          contentType: menuImage.type,
          upsert: true
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage.from('qrmenu').getPublicUrl(fileName);
      const imageUrl = publicUrlData?.publicUrl;

      if (imageUrl) {
        updateData.menuImageUrl = imageUrl;
      }
    }

    // Update item
    const updatedItem = await prisma.subCategory.update({
      where: { id: itemId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Update item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
