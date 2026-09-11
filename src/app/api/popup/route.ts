import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { defaultPopupStore, isPopupInSchedule, normalizePopupStore } from '@/lib/popup';

export const dynamic = 'force-dynamic';

const POPUP_KEY = 'site_popup';

async function readStore() {
  const row = await prisma.setting.findUnique({ where: { key: POPUP_KEY } });
  if (!row?.value) return { ...defaultPopupStore };
  try {
    return normalizePopupStore(JSON.parse(row.value));
  } catch {
    return { ...defaultPopupStore };
  }
}

/** Public: danh sách popup đang active theo thứ tự */
export async function GET() {
  try {
    const store = await readStore();
    const now = new Date();
    const items = store.items.filter(
      (item) => item.enabled && item.imageUrl && isPopupInSchedule(item, now)
    );

    return NextResponse.json({
      items,
      maxShowsPerPopup: store.maxShowsPerPopup || 3,
      updatedAt: store.updatedAt || null,
    });
  } catch (error) {
    console.error('Error fetching popup:', error);
    return NextResponse.json({ items: [], maxShowsPerPopup: 3 });
  }
}
