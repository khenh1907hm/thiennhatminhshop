import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session && (session.user as { role?: string }).role === "ADMIN";
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() || "";
  const lowStockOnly = searchParams.get("lowStock") === "true";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const receiptPage = Math.max(1, Number(searchParams.get("receiptPage")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
  const where = {
    ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { sku: { contains: search, mode: "insensitive" as const } }] } : {}),
  };

  try {
    const [allProducts, totalProducts, stockLevels, receipts, receiptTotal] = await Promise.all([
      prisma.product.findMany({
        where,
        select: { id: true, name: true, sku: true, stock: true, stockAlertThreshold: true, category: { select: { name: true } } },
        orderBy: [{ stock: "asc" }, { name: "asc" }],
      }),
      prisma.product.count(),
      prisma.product.findMany({ select: { stock: true, stockAlertThreshold: true } }),
      prisma.stockReceipt.findMany({
        skip: (receiptPage - 1) * limit, take: limit,
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: { select: { name: true, sku: true } } } } },
      }),
      prisma.stockReceipt.count(),
    ]);

    const lowStockCount = stockLevels.filter((product) => product.stock <= product.stockAlertThreshold).length;
    const matchingProducts = lowStockOnly
      ? allProducts.filter((product) => product.stock <= product.stockAlertThreshold)
      : allProducts;
    const products = matchingProducts.slice((page - 1) * limit, page * limit);

    return NextResponse.json({ products, stats: { totalProducts, lowStockCount }, receipts, page, totalPages: Math.max(1, Math.ceil(matchingProducts.length / limit)), receiptPage, receiptTotalPages: Math.max(1, Math.ceil(receiptTotal / limit)) });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ error: "Không thể tải dữ liệu kho" }, { status: 500 });
  }
}
