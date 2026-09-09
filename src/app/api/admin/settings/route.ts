import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const defaults = { allowGuestCheckout: true, pricesIncludeTax: true, taxName: "VAT", taxRate: 10, storeName: "Thiên Nhật Minh Eco", hotline: "", orderEmail: "" };
const keys = Object.keys(defaults);
async function isAdmin() { const session = await getServerSession(authOptions); return (session?.user as { role?: string } | undefined)?.role === "ADMIN"; }
function parse(rows: Array<{ key: string; value: string }>) { const output = { ...defaults } as Record<string, unknown>; rows.forEach((row) => { if (keys.includes(row.key)) try { output[row.key] = JSON.parse(row.value); } catch {} }); return output; }

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json(parse(await prisma.setting.findMany({ where: { key: { in: keys } } }))); } catch { return NextResponse.json({ error: "Không thể tải cài đặt" }, { status: 500 }); }
}
export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const next = { ...defaults, ...(await request.json()) } as typeof defaults;
    next.taxRate = Number(next.taxRate);
    if (!Number.isFinite(next.taxRate) || next.taxRate < 0 || next.taxRate > 100) return NextResponse.json({ error: "Thuế phải từ 0 đến 100%" }, { status: 400 });
    await prisma.$transaction(keys.map((key) => prisma.setting.upsert({ where: { key }, update: { value: JSON.stringify(next[key as keyof typeof next]) }, create: { key, value: JSON.stringify(next[key as keyof typeof next]), description: "Cấu hình hệ thống" } })));
    return NextResponse.json(next);
  } catch { return NextResponse.json({ error: "Không thể lưu cài đặt" }, { status: 500 }); }
}
