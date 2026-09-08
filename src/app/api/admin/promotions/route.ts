import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, description, discountType, discountValue, startDate, endDate, usageLimit, isActive } = body;

    if (!code || !discountType || discountValue === undefined || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        code,
        description,
        discountType,
        discountValue,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: usageLimit || null,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error: any) {
    console.error('Error creating promotion:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Promotion code must be unique' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}
