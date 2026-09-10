import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";
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
  const lowStockSearch = search
    ? Prisma.sql`AND ("name" ILIKE ${`%${search}%`} OR "sku" ILIKE ${`%${search}%`})`
    : Prisma.empty;

  try {
    const [totalProducts, lowStockCountResult, matchingLowStockCountResult, receipts, receiptTotal] = await Promise.all([
      prisma.product.count({ where }),
      prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS count
        FROM "Product"
        WHERE "stock" <= "stockAlertThreshold"
      `),
      prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS count
        FROM "Product"
        WHERE "stock" <= "stockAlertThreshold" ${lowStockSearch}
      `),
      prisma.stockReceipt.findMany({
        skip: (receiptPage - 1) * limit, take: limit,
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: { select: { name: true, sku: true } } } } },
      }),
      prisma.stockReceipt.count(),
    ]);

    const lowStockCount = Number(lowStockCountResult[0]?.count || 0);
    const matchingLowStockCount = Number(matchingLowStockCountResult[0]?.count || 0);
    const products = lowStockOnly
      ? await (async () => {
          const pageIds = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
            SELECT "id"
            FROM "Product"
            WHERE "stock" <= "stockAlertThreshold" ${lowStockSearch}
            ORDER BY "stock" ASC, "name" ASC
            LIMIT ${limit} OFFSET ${(page - 1) * limit}
          `);
          return prisma.product.findMany({
            where: { id: { in: pageIds.map(({ id }) => id) } },
            select: { id: true, name: true, sku: true, stock: true, stockAlertThreshold: true, category: { select: { name: true } } },
            orderBy: [{ stock: "asc" }, { name: "asc" }],
          });
        })()
      : await prisma.product.findMany({
          where,
          select: { id: true, name: true, sku: true, stock: true, stockAlertThreshold: true, category: { select: { name: true } } },
          orderBy: [{ stock: "asc" }, { name: "asc" }],
          skip: (page - 1) * limit,
          take: limit,
        });
    const matchingProductCount = lowStockOnly ? matchingLowStockCount : totalProducts;

    return NextResponse.json({ products, stats: { totalProducts, lowStockCount }, receipts, page, totalPages: Math.max(1, Math.ceil(matchingProductCount / limit)), receiptPage, receiptTotalPages: Math.max(1, Math.ceil(receiptTotal / limit)) });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ error: "Không thể tải dữ liệu kho" }, { status: 500 });
  }
}
