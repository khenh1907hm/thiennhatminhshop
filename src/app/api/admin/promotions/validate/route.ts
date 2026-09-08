import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Validate an active promotion code for product forms */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = (searchParams.get('code') || '').trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: 'Thiếu mã khuyến mãi' }, { status: 400 });
    }

    const promotion = await prisma.promotion.findUnique({
      where: { code },
    });

    if (!promotion) {
      return NextResponse.json({ error: 'Mã khuyến mãi không tồn tại' }, { status: 404 });
    }

    const now = new Date();
    if (!promotion.isActive) {
      return NextResponse.json({ error: 'Mã khuyến mãi đang tắt' }, { status: 400 });
    }
    if (promotion.startDate > now) {
      return NextResponse.json({ error: 'Mã khuyến mãi chưa đến ngày áp dụng' }, { status: 400 });
    }
    if (promotion.endDate < now) {
      return NextResponse.json({ error: 'Mã khuyến mãi đã hết hạn' }, { status: 400 });
    }
    if (
      promotion.usageLimit != null &&
      promotion.usedCount >= promotion.usageLimit
    ) {
      return NextResponse.json({ error: 'Mã khuyến mãi đã hết lượt dùng' }, { status: 400 });
    }

    return NextResponse.json({
      id: promotion.id,
      code: promotion.code,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: Number(promotion.discountValue),
      startDate: promotion.startDate,
      endDate: promotion.endDate,
    });
  } catch (error) {
    console.error('Error validating promotion:', error);
    return NextResponse.json({ error: 'Lỗi kiểm tra mã khuyến mãi' }, { status: 500 });
  }
}
