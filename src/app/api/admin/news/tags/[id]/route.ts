import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') return null;
  return session;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const data: { name?: string; slug?: string } = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.slug !== undefined) data.slug = String(body.slug).trim();

    if (!data.name && !data.slug) {
      return NextResponse.json({ error: 'Không có dữ liệu cập nhật' }, { status: 400 });
    }

    const tag = await prisma.tag.update({ where: { id }, data });
    return NextResponse.json(tag);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug đã tồn tại' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Lỗi cập nhật tag' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await prisma.tag.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Lỗi xóa tag' }, { status: 500 });
  }
}
