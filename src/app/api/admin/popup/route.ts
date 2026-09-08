import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { defaultPopupStore, normalizePopupStore, type SitePopupStore } from '@/lib/popup';

export const dynamic = 'force-dynamic';

const POPUP_KEY = 'site_popup';

async function readStore(): Promise<SitePopupStore> {
  const row = await prisma.setting.findUnique({ where: { key: POPUP_KEY } });
  if (!row?.value) return { ...defaultPopupStore };
  try {
    return normalizePopupStore(JSON.parse(row.value));
  } catch {
    return { ...defaultPopupStore };
  }
}

export async function GET() {
  try {
    const store = await readStore();
    return NextResponse.json(store);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to load popup config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const next = normalizePopupStore({
      ...body,
      maxShowsPerPopup: 3,
      updatedAt: new Date().toISOString(),
    });

    await prisma.setting.upsert({
      where: { key: POPUP_KEY },
      update: {
        value: JSON.stringify(next),
        description: 'Danh sách popup trang chủ',
      },
      create: {
        key: POPUP_KEY,
        value: JSON.stringify(next),
        description: 'Danh sách popup trang chủ',
      },
    });

    return NextResponse.json(next);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save popup' }, { status: 500 });
  }
}
