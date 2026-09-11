import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, getUserIdFromSession } from '@/lib/auth';

// Lấy giỏ hàng của user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserIdFromSession(session);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: { include: { product: true } }
        }
      });
    }

    // Transform data chuẩn hóa cho frontend CartItem
    const items = cart.items.map(item => {
      const numPrice = Number(item.product.price) || 0;
      const formattedPrice = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(numPrice);
      return {
        product: {
          ...item.product,
          image: (item.product as any).image || item.product.images?.[0] || "",
          numericPrice: numPrice,
          price: formattedPrice
        },
        quantity: item.quantity
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// Thêm sản phẩm vào giỏ hàng hoặc gộp giỏ hàng (bulk)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserIdFromSession(session);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity, items } = body;

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Bulk sync (gộp từ localStorage)
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 1000) {
          return NextResponse.json({ error: 'Số lượng sản phẩm phải là số nguyên dương' }, { status: 400 });
        }
        const productExists = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true }
        });
        if (!productExists) continue;

        const existingItem = await prisma.cartItem.findUnique({
          where: { cartId_productId: { cartId: cart.id, productId: item.productId } }
        });
        if (existingItem) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + item.quantity }
          });
        } else {
          await prisma.cartItem.create({
            data: { cartId: cart.id, productId: item.productId, quantity: item.quantity }
          });
        }
      }
      return NextResponse.json({ success: true, message: 'Cart merged' });
    }

    // Single item add
    if (typeof productId === 'string' && productId && Number.isInteger(quantity) && quantity > 0 && quantity <= 1000) {
      const productExists = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true }
      });
      if (!productExists) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const existingItem = await prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId: productId } }
      });
      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity }
        });
      } else {
        await prisma.cartItem.create({
          data: { cartId: cart.id, productId: productId, quantity: quantity }
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Số lượng sản phẩm phải là số nguyên dương' }, { status: 400 });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

// Xoá sản phẩm hoặc clear giỏ hàng
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserIdFromSession(session);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return NextResponse.json({ success: true });

    if (productId) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId: productId
        }
      });
    } else {
      // Clear toàn bộ
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json({ error: 'Failed to delete cart item' }, { status: 500 });
  }
}
