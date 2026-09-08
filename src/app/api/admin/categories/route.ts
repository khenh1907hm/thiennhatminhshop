import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
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
    return NextResponse.json(enriched);
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
