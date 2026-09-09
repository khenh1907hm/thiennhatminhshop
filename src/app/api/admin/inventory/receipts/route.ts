import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session && (session.user as { role?: string }).role === "ADMIN";
}

type ReceiptLine = { productId: string; quantity: number };

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const quantities = new Map<string, number>();
    for (const item of rawItems as ReceiptLine[]) {
      const quantity = Number(item.quantity);
      if (!item.productId || !Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json({ error: "Mỗi dòng nhập phải có sản phẩm và số lượng nguyên dương" }, { status: 400 });
      }
      quantities.set(item.productId, (quantities.get(item.productId) || 0) + quantity);
    }
    if (quantities.size === 0) {
      return NextResponse.json({ error: "Phiếu nhập phải có ít nhất một sản phẩm" }, { status: 400 });
    }

    const receiptNumber = `PN-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
    const receipt = await prisma.$transaction(async (tx) => {
      const items = [];
      for (const [productId, quantity] of quantities) {
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { id: true, name: true, sku: true, stock: true },
        });
        if (!product) throw new Error("Sản phẩm trong phiếu nhập không tồn tại");

        const stockAfter = product.stock + quantity;
        await tx.product.update({ where: { id: productId }, data: { stock: stockAfter } });
        items.push({ productId, quantity, stockBefore: product.stock, stockAfter });
      }

      return tx.stockReceipt.create({
        data: {
          receiptNumber,
          note: typeof body.note === "string" && body.note.trim() ? body.note.trim() : null,
          items: { create: items },
        },
        include: { items: { include: { product: { select: { name: true, sku: true } } } } },
      });
    }, { isolationLevel: "Serializable" });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    console.error("Error creating stock receipt:", error);
    const message = error instanceof Error ? error.message : "Không thể tạo phiếu nhập kho";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
