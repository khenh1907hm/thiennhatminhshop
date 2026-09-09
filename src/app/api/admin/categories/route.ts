import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams; const paged = params.get('paged') === 'true'; const page = Math.max(1, Number(params.get('page')) || 1); const limit = Math.min(50, Math.max(1, Number(params.get('limit')) || 20));
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      ...(paged ? { skip: (page - 1) * limit, take: limit } : {}),
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    // Attach parentName for display
    const map: Record<string, string> = {};
    categories.forEach((c) => { map[c.id] = c.name; });
    const enriched = categories.map((c) => ({
      ...c,
      parentName: c.parentId ? (map[c.parentId] ?? null) : null,
    }));
    if (!paged) return NextResponse.json(enriched);
    const total = await prisma.category.count(); return NextResponse.json({ items: enriched, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST /api/admin/categories received body:', body);
    const { name, slug, description, parentId } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const createData: any = {
      name,
      slug,
      description: description || null,
    };
    if (parentId && parentId !== '') {
      createData.parentId = parentId;
    }
    console.log('Creating category with payload:', createData);
    const category = await prisma.category.create({
      data: createData,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    // If Prisma throws a known error code, include it in response for debugging
    const errorMessage = error?.message || 'Failed to create category';
    if (error.code) {
      console.error('Prisma error code:', error.code);
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
