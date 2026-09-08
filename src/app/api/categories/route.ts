import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch ALL categories flat first
    const all = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });

    // Build tree manually: group children under their parent
    const map: Record<string, any> = {};
    all.forEach((cat) => {
      map[cat.id] = { ...cat, children: [] };
    });

    const roots: any[] = [];
    all.forEach((cat) => {
      if (cat.parentId && map[cat.parentId]) {
        map[cat.parentId].children.push(map[cat.id]);
      } else {
        roots.push(map[cat.id]);
      }
    });

    return NextResponse.json(roots);
  } catch (error: any) {
    console.error('Error fetching categories:', error?.message ?? error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', detail: error?.message },
      { status: 500 }
    );
  }
}
