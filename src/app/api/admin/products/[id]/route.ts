import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseNonNegativeMoney, parseNonNegativeInteger } from '@/lib/validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      name, slug, sku, brand, description, price, originalPrice, 
      discount, stock, images, isFeatured, specs, documents, categoryId 
    } = body;
    const numericPrice = typeof price === 'number' ? price : Number(price);
    const numericStock = typeof stock === 'number' ? stock : Number(stock);
    const numericOriginalPrice = originalPrice === undefined || originalPrice === null || originalPrice === '' ? null : parseNonNegativeMoney(originalPrice);
    if (parseNonNegativeMoney(numericPrice) === null || parseNonNegativeInteger(numericStock) === null || (originalPrice !== undefined && originalPrice !== null && originalPrice !== '' && numericOriginalPrice === null)) {
      return NextResponse.json({ error: 'Giá và tồn kho phải là số không âm hợp lệ' }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        sku,
        brand,
        description,
        price: numericPrice,
        originalPrice: numericOriginalPrice,
        discount: discount || null,
        stock: numericStock,
        images: images || [],
        isFeatured: isFeatured || false,
        specs: specs || null,
        documents: documents || null,
        categoryId,
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug or SKU must be unique' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if there are order items using this product
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id }
    });

    if (orderItemsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete product because it is in ${orderItemsCount} orders.` },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
