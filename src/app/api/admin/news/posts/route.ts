import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10) || 12));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        include: {
          category: true,
          tags: true,
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count(),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasMore: skip + items.length < total,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Lỗi tải bài viết' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find author by email from session
    const author = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });
    
    if (!author) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { title, slug, summary, content, coverImage, status, publishedAt, categoryId, tagIds, metaTitle, metaDesc, focusKeyword } = await request.json();

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Tiêu đề, slug và nội dung là bắt buộc' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        summary,
        content,
        coverImage,
        metaTitle,
        metaDesc,
        focusKeyword,
        status: status || 'DRAFT',
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        categoryId: categoryId || null,
        authorId: author.id,
        tags: tagIds && tagIds.length > 0 ? {
          connect: tagIds.map((id: string) => ({ id }))
        } : undefined
      },
      include: {
        category: true,
        tags: true,
        author: { select: { name: true } }
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Lỗi tạo bài viết' }, { status: 500 });
  }
}
