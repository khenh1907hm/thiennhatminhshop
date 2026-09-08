import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    // Chuyển mảng thành dạng object { key: value }
    const settingsObject = settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    return NextResponse.json(settingsObject);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Giả sử body là một mảng object: [{ key: 'shippingFee', value: '30000', description: 'Phí ship cơ bản' }, ...]
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Body must be an array of settings' }, { status: 400 });
    }

    // Upsert từng setting
    const results = await Promise.all(
      body.map((setting) => {
        return prisma.setting.upsert({
          where: { key: setting.key },
          update: {
            value: String(setting.value),
            description: setting.description || undefined
          },
          create: {
            key: setting.key,
            value: String(setting.value),
            description: setting.description || null
          }
        });
      })
    );

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
