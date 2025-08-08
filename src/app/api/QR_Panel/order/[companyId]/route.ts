// src/app/api/QR_Panel/order/[companyId]/route.ts
import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest, context: { params: Promise<{ companyId: string }> }) {
  const params = await context.params;
  const { companyId } = params;
  const body = await req.json();
  const { tableNumber, orderRequest, cart, totalAmount } = body;

  if (!tableNumber || !cart || !totalAmount) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    console.log('Processing order - Table:', tableNumber, 'Company:', companyId, 'Type:', typeof tableNumber);
    
    // Check if there's already an active order for this table
    console.log('Searching for existing order with criteria:', {
      tableNumber: tableNumber,
      companyId: companyId,
      isActive: true
    });
    
    const existingOrder = await prisma.order.findFirst({
      where: {
        tableNumber: tableNumber,
        companyId,
        isActive: true,
      },
      include: {
        orderItems: {
          include: {
            subCategory: {
              select: { name: true }
            }
          }
        },
      },
    });

    console.log('Existing active order found:', existingOrder ? `ID: ${existingOrder.id}, Items: ${existingOrder.orderItems.length}` : 'None');
    
    // Debug: Check all orders for this table
    const allOrdersForTable = await prisma.order.findMany({
      where: {
        tableNumber: tableNumber,
        companyId,
      },
      select: {
        id: true,
        tableNumber: true,
        isActive: true,
        createdAt: true,
        totalAmount: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log('All orders for table', tableNumber, ':', allOrdersForTable);
    
    // Debug: Check all active orders for this company
    const allActiveOrders = await prisma.order.findMany({
      where: {
        companyId,
        isActive: true,
      },
      select: {
        id: true,
        tableNumber: true,
        isActive: true,
        createdAt: true,
        totalAmount: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log('All active orders for company:', allActiveOrders);

    let order;
    let isNewOrder = false;

    if (existingOrder) {
      console.log('Adding items to existing order:', existingOrder.id);
      
      // Add items to existing order
      const newOrderItems = cart.map((item: any) => ({
        subCategoryId: item.id,
        quantity: item.quantity,
        price: item.price,
        orderId: existingOrder.id,
      }));

      // Create new order items
      await prisma.orderItem.createMany({
        data: newOrderItems,
      });

      // Calculate new total amount
      const existingTotal = existingOrder.orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const newItemsTotal = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const updatedTotal = existingTotal + newItemsTotal;

      console.log('Updated total - Existing:', existingTotal, 'New:', newItemsTotal, 'Total:', updatedTotal);

      // Update the existing order with new total and note
      order = await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          totalAmount: updatedTotal,
          note: orderRequest ? 
            (existingOrder.note ? `${existingOrder.note}; ${orderRequest}` : orderRequest) : 
            existingOrder.note,
        },
        include: {
          orderItems: {
            include: {
              subCategory: {
                select: { name: true }
              }
            }
          },
        },
      });

      console.log('Successfully updated existing order:', order.id);
    } else {
      console.log('Creating new order for table:', tableNumber);
      // Create new order
      order = await prisma.order.create({
        data: {
          tableNumber,
          totalAmount,
          isActive: true,
          companyId,
          ...(orderRequest ? { note: orderRequest } : {}),
          orderItems: {
            create: cart.map((item: any) => ({
              subCategoryId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              subCategory: {
                select: { name: true }
              }
            }
          },
        },
      });

      isNewOrder = true;
      console.log('Successfully created new order:', order.id, 'Table:', order.tableNumber);
    }

    console.log('Order data:', JSON.stringify(order, null, 2));

    // Emit order event using global io instance
    if (global.io) {
      if (isNewOrder) {
        global.io.to(companyId).emit('new-order', order);
      } else {
        global.io.to(companyId).emit('order-updated', order);
      }
    } else {
      console.warn('WebSocket server not available - order created/updated but not emitted');
    }

    return NextResponse.json({ 
      orderId: order.id, 
      isNewOrder,
      message: isNewOrder ? 'Order created successfully' : 'Order updated successfully'
    }, { status: isNewOrder ? 201 : 200 });
  } catch (error) {
    console.error('[ORDER_POST]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: { params?: { companyId?: string } } = {}) {
  const params = context?.params ? await context.params : {};
  const companyId = params.companyId;
  const cookieStore = await cookies();
  
  // Get the authenticated user ID from cookies
  const authenticatedUserId = cookieStore.get('userId')?.value;
  const userRole = cookieStore.get('role')?.value;

  // Check if user is authenticated
  if (!authenticatedUserId || userRole !== 'User') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  try {
    // Verify that the authenticated user belongs to the requested company
    const user = await prisma.user.findUnique({
      where: { id: authenticatedUserId },
      include: { company: true }
    });

    if (!user || !user.company || user.company.id !== companyId) {
      return NextResponse.json({ error: 'Forbidden - You can only access your own company\'s orders' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: { companyId },
      include: {
        orderItems: {
          include: {
            subCategory: {
              select: { name: true }
            }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('[ORDER_GET]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  
  // Get the authenticated user ID from cookies
  const authenticatedUserId = cookieStore.get('userId')?.value;
  const userRole = cookieStore.get('role')?.value;

  // Check if user is authenticated
  if (!authenticatedUserId || userRole !== 'User') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, payCounts, markInactive } = await req.json();

    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }

    // Verify that the authenticated user can access this order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { company: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get the user to verify they belong to the same company
    const user = await prisma.user.findUnique({
      where: { id: authenticatedUserId },
      include: { company: true }
    });

    if (!user || !user.company || user.company.id !== order.companyId) {
      return NextResponse.json({ error: 'Forbidden - You can only modify your own company\'s orders' }, { status: 403 });
    }

    if (payCounts && typeof payCounts === 'object') {
      const updatePromises = Object.entries(payCounts).map(async ([itemId, count]) => {
        const incrementBy = Number(count);
        if (incrementBy <= 0) return;

        // Increment paidQuantity
        await prisma.orderItem.update({
          where: { id: itemId },
          data: {
            paidQuantity: { increment: incrementBy },
          },
        });

        // Re-fetch and check if fully paid
        const latest = await prisma.orderItem.findUnique({ where: { id: itemId } });
        if (latest && latest.paidQuantity >= latest.quantity) {
          await prisma.orderItem.update({
            where: { id: itemId },
            data: { isPaid: true },
          });
        }
      });

      await Promise.all(updatePromises);
    }

    // Check if all items are fully paid
    const items = await prisma.orderItem.findMany({ where: { orderId } });
    const allPaid = items.every(item => item.paidQuantity >= item.quantity);

    if (markInactive || allPaid) {
      await prisma.order.update({
        where: { id: orderId },
        data: { isActive: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH_ORDER_PAYMENT]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
