import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20));
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, images: true }
            }
          }
        }
      }, skip, take: limit
    }), prisma.order.count()]);
    return NextResponse.json({ items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders', detail: error?.message }, { status: 500 });
  }
}
