import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session && (session.user as { role?: string }).role === "ADMIN";
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { stockAlertThreshold } = await request.json();
    const threshold = Number(stockAlertThreshold);
    if (!Number.isInteger(threshold) || threshold < 0) {
      return NextResponse.json({ error: "Ngưỡng cảnh báo phải là số nguyên không âm" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { stockAlertThreshold: threshold },
      select: { id: true, stockAlertThreshold: true },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating inventory threshold:", error);
    return NextResponse.json({ error: "Không thể cập nhật ngưỡng cảnh báo" }, { status: 500 });
  }
}
