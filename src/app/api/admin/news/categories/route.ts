import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.postCategory.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching post categories:', error);
    return NextResponse.json({ error: 'Lỗi tải danh mục' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, slug, description } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: 'Tên và slug là bắt buộc' }, { status: 400 });
    }

    const category = await prisma.postCategory.create({
      data: { name, slug, description }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating post category:', error);
    return NextResponse.json({ error: 'Lỗi tạo danh mục' }, { status: 500 });
  }
}
