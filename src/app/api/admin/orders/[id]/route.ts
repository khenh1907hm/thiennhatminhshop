import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session && (session.user as { role?: string }).role === 'ADMIN';
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        orderItems: {
          include: {
            product: {
              select: { name: true, images: true, sku: true }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    if (status !== undefined && !ORDER_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json({ error: 'Trạng thái đơn hàng không hợp lệ' }, { status: 400 });
    }
    if (paymentStatus !== undefined && typeof paymentStatus !== 'string') {
      return NextResponse.json({ error: 'Trạng thái thanh toán không hợp lệ' }, { status: 400 });
    }

    const dataToUpdate: { status?: OrderStatus; paymentStatus?: string } = {};
    if (status) dataToUpdate.status = status as OrderStatus;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'No data to update' }, { status: 400 });
    }

    const order = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id },
        include: { orderItems: { select: { productId: true, quantity: true } } },
      });
      if (!current) throw new Error('Order not found');

      if (dataToUpdate.status && dataToUpdate.status !== current.status) {
        if (dataToUpdate.status === 'CANCELLED') {
          for (const item of current.orderItems) {
            await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
          }
        } else if (current.status === 'CANCELLED') {
          for (const item of current.orderItems) {
            const result = await tx.product.updateMany({
              where: { id: item.productId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (result.count !== 1) throw new Error('Không đủ tồn kho để mở lại đơn hàng');
          }
        }
      }

      return tx.order.update({ where: { id }, data: dataToUpdate });
    }, { isolationLevel: 'Serializable' });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Chỉ được xóa đơn hàng ở trạng thái Đã hủy' },
        { status: 400 }
      );
    }

    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
