import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, getUserIdFromSession } from '@/lib/auth';

// Update số lượng sản phẩm trong giỏ
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserIdFromSession(session);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, delta } = await request.json();

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId
        }
      }
    });

    if (existingItem) {
      const newQuantity = Math.max(1, existingItem.quantity + delta);
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}
