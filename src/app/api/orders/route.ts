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
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain items' }, { status: 400 });
    }

    const normalizedItems = new Map<string, number>();
    for (const item of items) {
      if (typeof item?.productId !== 'string' || !item.productId) {
        return NextResponse.json({ error: 'Invalid product item' }, { status: 400 });
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 1000) {
        return NextResponse.json({ error: 'Số lượng sản phẩm không hợp lệ' }, { status: 400 });
      }
      normalizedItems.set(
        item.productId,
        (normalizedItems.get(item.productId) || 0) + item.quantity
      );
    }

    const paymentMethods = new Set(['cod', 'qr']);
    if (typeof paymentMethod !== 'string' || !paymentMethods.has(paymentMethod)) {
      return NextResponse.json({ error: 'Phương thức thanh toán không hợp lệ' }, { status: 400 });
    }

    // Generate random order number ORD-XXXXXX
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Use transaction to ensure stock consistency
    const order = await prisma.$transaction(async (tx) => {
      // 1. Validate stock
      const pricedItems: { productId: string; quantity: number; price: number }[] = [];
      let calculatedTotal = 0;

      for (const [productId, quantity] of normalizedItems) {
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) {
          throw new Error(`Product ${productId} not found`);
        }
        if (product.stock < quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }
        const price = Number(product.price);
        pricedItems.push({ productId, quantity, price });
        calculatedTotal += price * quantity;
      }

      // 2. Deduct stock
      for (const item of pricedItems) {
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
          totalAmount: calculatedTotal,
          orderItems: {
            create: pricedItems.map((item) => ({
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
