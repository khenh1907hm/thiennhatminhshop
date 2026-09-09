import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    const [orders, customerCount, products, recentOrders] = await Promise.all([
      prisma.order.findMany({ where: { createdAt: { gte: chartStart }, paymentStatus: "PAID" }, select: { totalAmount: true, createdAt: true } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.product.findMany({ select: { id: true, name: true, sku: true, stock: true, stockAlertThreshold: true } }),
      prisma.order.findMany({ take: 6, orderBy: { createdAt: "desc" }, select: { id: true, orderNumber: true, customerName: true, totalAmount: true, status: true, createdAt: true } }),
    ]);
    const chart = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - 4 + index, 1);
      return { name: `T${date.getMonth() + 1}`, revenue: orders.filter((order) => order.createdAt >= date && order.createdAt < next).reduce((sum, order) => sum + Number(order.totalAmount), 0) };
    });
    const monthlyRevenue = orders.filter((order) => order.createdAt >= monthStart).reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const newOrders = recentOrders.filter((order) => order.createdAt >= monthStart).length;
    const lowStockProducts = products.filter((product) => product.stock <= product.stockAlertThreshold).sort((a, b) => a.stock - b.stock).slice(0, 8);
    return NextResponse.json({ monthlyRevenue, newOrders, customerCount, lowStockProducts, recentOrders, chart });
  } catch (error) {
    console.error("Dashboard fetch failed:", error);
    return NextResponse.json({ error: "Không thể tải Dashboard" }, { status: 500 });
  }
}
