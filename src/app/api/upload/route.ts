import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const allowedExtensions = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif']);

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
    }

    const extension = path.extname(file.name).toLowerCase();
    if (!allowedMimeTypes.has(file.type) || !allowedExtensions.has(extension)) {
      return NextResponse.json({ success: false, error: 'Chỉ hỗ trợ file PDF hoặc ảnh JPG, PNG, WEBP, GIF' }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'Dung lượng file phải từ 1 byte đến 10MB' }, { status: 400 });
    }

    const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${originalName}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`uploads/${uniqueName}`, file, {
        access: 'public',
        addRandomSuffix: false,
      });
      return NextResponse.json({ success: true, url: blob.url });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    const filepath = path.join(uploadDir, uniqueName);
    await writeFile(filepath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
