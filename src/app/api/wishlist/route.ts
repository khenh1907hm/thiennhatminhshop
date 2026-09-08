import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, getUserIdFromSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserIdFromSession(session);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Chuẩn hóa format product cho frontend
    const normalizedList = wishlist.map(item => {
      const numPrice = Number(item.product.price) || 0;
      const formattedPrice = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(numPrice);
      return {
        ...item,
        product: {
          ...item.product,
          image: (item.product as any).image || item.product.images?.[0] || "",
          numericPrice: numPrice,
          price: formattedPrice
        }
      };
    });

    return NextResponse.json(normalizedList);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserIdFromSession(session);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, items, action } = body;

    // Bulk sync (gộp từ localStorage khi đăng nhập)
    if (items && Array.isArray(items)) {
      for (const id of items) {
        if (!id) continue;
        const prod = await prisma.product.findUnique({
          where: { id },
          select: { id: true }
        });
        if (!prod) continue;

        const existing = await prisma.wishlist.findUnique({
          where: { userId_productId: { userId, productId: id } }
        });
        if (!existing) {
          await prisma.wishlist.create({ data: { userId, productId: id } });
        }
      }
      return NextResponse.json({ success: true, message: 'Wishlist merged' });
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Kiểm tra sản phẩm có tồn tại trong DB không
    const prod = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true }
    });
    if (!prod) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (action === 'remove') {
      if (existingItem) {
        await prisma.wishlist.delete({ where: { id: existingItem.id } });
      }
      return NextResponse.json({ message: 'Removed from wishlist', isAdded: false });
    }

    if (action === 'toggle') {
      if (existingItem) {
        await prisma.wishlist.delete({ where: { id: existingItem.id } });
        return NextResponse.json({ message: 'Removed from wishlist', isAdded: false });
      } else {
        const newItem = await prisma.wishlist.create({
          data: { userId, productId }
        });
        return NextResponse.json({ message: 'Added to wishlist', isAdded: true, item: newItem }, { status: 201 });
      }
    }

    // Default: Add idempotently
    if (!existingItem) {
      const newItem = await prisma.wishlist.create({
        data: { userId, productId }
      });
      return NextResponse.json({ message: 'Added to wishlist', isAdded: true, item: newItem }, { status: 201 });
    }

    return NextResponse.json({ message: 'Already in wishlist', isAdded: true, item: existingItem });
  } catch (error) {
    console.error('Error modifying wishlist:', error);
    return NextResponse.json({ error: 'Failed to modify wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserIdFromSession(session);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId,
        productId
      }
    });

    return NextResponse.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error deleting from wishlist:', error);
    return NextResponse.json({ error: 'Failed to delete from wishlist' }, { status: 500 });
  }
}
