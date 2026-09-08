import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const whereClause: any = {};

    if (categoryId && categoryId !== 'ALL') {
      // Include products in this category or its children
      const children = await prisma.category.findMany({
        where: { parentId: categoryId },
        select: { id: true },
      });
      const ids = [categoryId, ...children.map((c) => c.id)];
      whereClause.categoryId = { in: ids };
    }

    if (brand && brand !== 'ALL') {
      whereClause.brand = { equals: brand, mode: 'insensitive' };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy =
      sort === 'price_asc'
        ? { price: 'asc' as const }
        : sort === 'price_desc'
          ? { price: 'desc' as const }
          : sort === 'name_asc'
            ? { name: 'asc' as const }
            : { createdAt: 'desc' as const };

    // Paginated mode for infinite scroll pickers
    if (pageParam || limitParam) {
      const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(limitParam || '12', 10) || 12));
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where: whereClause,
          include: { category: true },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.product.count({ where: whereClause }),
      ]);

      return NextResponse.json({
        items,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasMore: skip + items.length < total,
      });
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      orderBy,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
