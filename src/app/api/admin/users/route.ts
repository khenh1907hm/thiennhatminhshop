import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20));
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        image: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      }, skip, take: limit
    }), prisma.user.count()]);
    return NextResponse.json({ items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users', detail: error?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, phone, address } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email là bắt buộc' }, { status: 400 });
    }

    // Kiểm tra email trùng
    const existing = await prisma.user.findUnique({
      where: { email }
    });
    if (existing) {
      return NextResponse.json({ error: 'Email này đã tồn tại trong hệ thống' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        name: name || email.split('@')[0],
        email,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        phone: phone || null,
        address: address || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Không thể tạo người dùng', detail: error?.message }, { status: 500 });
  }
}
