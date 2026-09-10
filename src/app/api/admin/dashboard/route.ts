import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const chartStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const [orders, customerCount, lowStockProducts, recentOrders, quoteCount, recentQuotes] = await Promise.all([
      prisma.order.findMany({ where: { createdAt: { gte: chartStart }, paymentStatus: "PAID" }, select: { totalAmount: true, createdAt: true } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.$queryRaw<Array<{ id: string; name: string; sku: string; stock: number; stockAlertThreshold: number }>>(Prisma.sql`
        SELECT "id", "name", "sku", "stock", "stockAlertThreshold"
        FROM "Product"
        WHERE "stock" <= "stockAlertThreshold"
        ORDER BY "stock" ASC, "name" ASC
        LIMIT 8
      `),
      prisma.order.findMany({ take: 6, orderBy: { createdAt: "desc" }, select: { id: true, orderNumber: true, customerName: true, totalAmount: true, status: true, createdAt: true } }),
      prisma.quoteRequest.count({ where: { status: { in: ["RECEIVED", "IN_PROGRESS"] } } }),
      prisma.quoteRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, status: true, createdAt: true, _count: { select: { items: true } } },
      }),
    ]);
    const chart = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - 4 + index, 1);
      return { name: `T${date.getMonth() + 1}`, revenue: orders.filter((order) => order.createdAt >= date && order.createdAt < next).reduce((sum, order) => sum + Number(order.totalAmount), 0) };
    });
    const monthlyRevenue = orders.filter((order) => order.createdAt >= monthStart).reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const newOrders = recentOrders.filter((order) => order.createdAt >= monthStart).length;
    return NextResponse.json({ monthlyRevenue, newOrders, customerCount, lowStockProducts, recentOrders, quoteCount, recentQuotes, chart });
  } catch (error) {
    console.error("Dashboard fetch failed:", error);
    return NextResponse.json({ error: "Không thể tải Dashboard" }, { status: 500 });
  }
}
