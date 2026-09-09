import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const defaults = { allowGuestCheckout: true, pricesIncludeTax: true, taxName: "VAT", taxRate: 10 };
export async function GET() {
  const rows = await prisma.setting.findMany({ where: { key: { in: Object.keys(defaults) } } });
  const settings = { ...defaults } as Record<string, unknown>;
  rows.forEach((row) => { try { settings[row.key] = JSON.parse(row.value); } catch {} });
  return NextResponse.json(settings);
}
