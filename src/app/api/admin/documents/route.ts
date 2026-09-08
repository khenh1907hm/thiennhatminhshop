import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_CATEGORIES = [
  "Catalogue & Brochure",
  "Datasheet / Bảng thông số",
  "Hướng dẫn sử dụng (Manual)",
  "Sơ đồ đấu nối & Bản vẽ",
  "Chứng chỉ chất lượng (CO/CQ)",
  "Phần mềm & Firmware"
];

// Helper to get technical documents from DB Setting
async function getDocsData() {
  try {
    const docSetting = await prisma.setting.findUnique({
      where: { key: 'admin_technical_documents' }
    });
    const catSetting = await prisma.setting.findUnique({
      where: { key: 'admin_document_categories' }
    });

    const documents = docSetting?.value ? JSON.parse(docSetting.value) : [];
    const categories = catSetting?.value ? JSON.parse(catSetting.value) : DEFAULT_CATEGORIES;

    return { documents, categories };
  } catch (error) {
    console.error('Error reading documents from settings:', error);
    return { documents: [], categories: DEFAULT_CATEGORIES };
  }
}

// Helper to save technical documents to DB Setting
async function saveDocsData(documents: any[], categories?: string[]) {
  await prisma.setting.upsert({
    where: { key: 'admin_technical_documents' },
    update: { value: JSON.stringify(documents) },
    create: {
      key: 'admin_technical_documents',
      value: JSON.stringify(documents),
      description: 'Lưu trữ danh sách tài liệu kỹ thuật'
    }
  });

  if (categories) {
    await prisma.setting.upsert({
      where: { key: 'admin_document_categories' },
      update: { value: JSON.stringify(categories) },
      create: {
        key: 'admin_document_categories',
        value: JSON.stringify(categories),
        description: 'Danh mục tài liệu kỹ thuật'
      }
    });
  }
}

// GET: Lấy danh sách tài liệu và danh mục
export async function GET() {
  try {
    const { documents, categories } = await getDocsData();
    
    // Đồng thời lấy danh sách rút gọn các sản phẩm để phục vụ việc liên kết
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        brand: true,
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      documents,
      categories,
      products
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/documents:', error);
    return NextResponse.json({ error: 'Lỗi tải danh sách tài liệu' }, { status: 500 });
  }
}

// POST: Tạo tài liệu kỹ thuật mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, fileUrl, fileSize, description, productIds } = body;

    if (!title || !fileUrl) {
      return NextResponse.json({ error: 'Tên tài liệu và file PDF là bắt buộc' }, { status: 400 });
    }

    const { documents, categories } = await getDocsData();

    const newDoc = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      category: category || "Datasheet / Bảng thông số",
      fileUrl,
      fileSize: fileSize || "PDF",
      description: description || "",
      productIds: Array.isArray(productIds) ? productIds : (productIds ? [productIds] : []),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedDocs = [newDoc, ...documents];
    await saveDocsData(updatedDocs);

    // Đồng bộ vào các sản phẩm được chọn
    if (newDoc.productIds.length > 0) {
      for (const prodId of newDoc.productIds) {
        try {
          const prod = await prisma.product.findUnique({
            where: { id: prodId },
            select: { documents: true }
          });
          const currentDocs: any[] = Array.isArray(prod?.documents) ? (prod!.documents as any[]) : [];
          // Tránh duplicate
          if (!currentDocs.some((d) => d.url === newDoc.fileUrl)) {
            const nextDocs = [
              ...currentDocs,
              {
                id: newDoc.id,
                name: newDoc.title,
                url: newDoc.fileUrl,
                category: newDoc.category,
                fileSize: newDoc.fileSize
              }
            ];
            await prisma.product.update({
              where: { id: prodId },
              data: { documents: nextDocs }
            });
          }
        } catch (syncErr) {
          console.error(`Lỗi đồng bộ tài liệu sang sản phẩm ${prodId}:`, syncErr);
        }
      }
    }

    return NextResponse.json({ success: true, document: newDoc }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Lỗi khi tạo tài liệu' }, { status: 500 });
  }
}

// PUT: Cập nhật tài liệu hoặc danh mục
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, id, title, category, fileUrl, fileSize, description, productIds, categories } = body;

    // Cập nhật danh mục
    if (action === 'update_categories' && Array.isArray(categories)) {
      const { documents } = await getDocsData();
      await saveDocsData(documents, categories);
      return NextResponse.json({ success: true, categories });
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing document id' }, { status: 400 });
    }

    const { documents } = await getDocsData();
    const index = documents.findIndex((d: any) => d.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Tài liệu không tồn tại' }, { status: 404 });
    }

    const updatedDoc = {
      ...documents[index],
      title: title ?? documents[index].title,
      category: category ?? documents[index].category,
      fileUrl: fileUrl ?? documents[index].fileUrl,
      fileSize: fileSize ?? documents[index].fileSize,
      description: description ?? documents[index].description,
      productIds: Array.isArray(productIds) ? productIds : documents[index].productIds,
      updatedAt: new Date().toISOString()
    };

    documents[index] = updatedDoc;
    await saveDocsData(documents);

    return NextResponse.json({ success: true, document: updatedDoc });
  } catch (error: any) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật tài liệu' }, { status: 500 });
  }
}

// DELETE: Xóa tài liệu
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing document id' }, { status: 400 });
    }

    const { documents } = await getDocsData();
    const filtered = documents.filter((d: any) => d.id !== id);
    await saveDocsData(filtered);

    return NextResponse.json({ success: true, message: 'Đã xóa tài liệu' });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Lỗi khi xóa tài liệu' }, { status: 500 });
  }
}
