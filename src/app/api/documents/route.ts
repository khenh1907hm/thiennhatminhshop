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

export async function GET() {
  try {
    const docSetting = await prisma.setting.findUnique({
      where: { key: 'admin_technical_documents' }
    });
    const catSetting = await prisma.setting.findUnique({
      where: { key: 'admin_document_categories' }
    });

    const documents = docSetting?.value ? JSON.parse(docSetting.value) : [];
    const categories = catSetting?.value ? JSON.parse(catSetting.value) : DEFAULT_CATEGORIES;

    return NextResponse.json({ documents, categories });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Lỗi tải tài liệu' }, { status: 500 });
  }
}
