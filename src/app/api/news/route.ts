import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const tag = searchParams.get('tag');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10) || 12));
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'PUBLISHED',
      OR: [
        { publishedAt: null },
        { publishedAt: { lte: new Date() } },
      ],
    };

    if (categoryId) where.categoryId = categoryId;
    if (tag) where.tags = { some: { slug: tag } };

    const [posts, total, categories] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          category: true,
          tags: true,
          author: { select: { name: true } },
        },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
      prisma.postCategory.findMany({ orderBy: { name: 'asc' } }),
    ]);

    return NextResponse.json({
      posts,
      categories,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasMore: skip + posts.length < total,
    });
  } catch (error) {
    console.error('Error fetching public news:', error);
    return NextResponse.json({ error: 'Lỗi tải tin tức' }, { status: 500 });
  }
}
