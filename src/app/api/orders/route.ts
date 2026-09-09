import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, getUserIdFromSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserIdFromSession(session);

    const guestSetting = await prisma.setting.findUnique({ where: { key: 'allowGuestCheckout' } });
    const allowGuestCheckout = guestSetting?.value ? JSON.parse(guestSetting.value) : true;
    if (!userId && !allowGuestCheckout) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để đặt hàng' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      customerName, 
      customerPhone, 
      customerEmail, 
      shippingAddress, 
      note, 
      paymentMethod,
      items, 
      totalAmount 
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain items' }, { status: 400 });
    }

    // Generate random order number ORD-XXXXXX
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Use transaction to ensure stock consistency
    const order = await prisma.$transaction(async (tx) => {
      // 1. Validate stock
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }
      }

      // 2. Deduct stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // 3. Create Order
      return await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName,
          customerPhone,
          customerEmail,
          shippingAddress,
          note,
          paymentMethod,
          totalAmount,
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          orderItems: true
        }
      });
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 400 });
  }
}
