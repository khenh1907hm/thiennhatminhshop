import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Lấy tổng số lượng
    const totalUsers = await prisma.user.count({
      where: { role: 'USER' }
    });
    
    const totalOrders = await prisma.order.count();
    
    // Tính tổng doanh thu
    const orders = await prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      select: { totalAmount: true }
    });
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    // Lấy danh sách 5 đơn hàng mới nhất
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
