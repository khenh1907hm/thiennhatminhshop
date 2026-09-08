import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

type IncomingItem = {
  productId?: string | null;
  nameOrSku: string;
  quantity?: number;
};

async function resolveItem(raw: IncomingItem) {
  const nameOrSku = String(raw.nameOrSku || "").trim();
  const quantity = Math.max(1, Number(raw.quantity) || 1);
  if (!nameOrSku) return null;

  let productId = raw.productId || null;
  let productName: string | null = null;
  let productSku: string | null = null;

  if (productId) {
    const p = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, sku: true },
    });
    if (p) {
      productId = p.id;
      productName = p.name;
      productSku = p.sku;
    } else {
      productId = null;
    }
  }

  if (!productId) {
    const p = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: { equals: nameOrSku, mode: "insensitive" } },
          { name: { equals: nameOrSku, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, sku: true },
    });
    if (p) {
      productId = p.id;
      productName = p.name;
      productSku = p.sku;
    }
  }

  return {
    productId,
    nameOrSku,
    productName,
    productSku,
    quantity,
  };
}

function parseExcelBuffer(buffer: Buffer): IncomingItem[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return [];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  return rows
    .map((row) => {
      const keys = Object.keys(row);
      const findKey = (...candidates: string[]) =>
        keys.find((k) =>
          candidates.some((c) => k.toLowerCase().replace(/\s+/g, "").includes(c))
        );

      const skuKey =
        findKey("sku", "mã", "ma", "tên", "ten", "name", "sảnphẩm", "sanpham") ||
        keys[0];
      const qtyKey =
        findKey("quantity", "qty", "sốlượng", "soluong", "sl") || keys[1];

      const nameOrSku = String(skuKey ? row[skuKey] : "").trim();
      const quantity = Number(qtyKey ? row[qtyKey] : 1) || 1;
      return { nameOrSku, quantity };
    })
    .filter((i) => i.nameOrSku);
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let name = "";
    let email = "";
    let phone = "";
    let source = "";
    let note = "";
    let items: IncomingItem[] = [];
    let excelUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      name = String(form.get("name") || "").trim();
      email = String(form.get("email") || "").trim();
      phone = String(form.get("phone") || "").trim();
      source = String(form.get("source") || "").trim();
      note = String(form.get("note") || "").trim();

      const itemsRaw = form.get("items");
      if (typeof itemsRaw === "string" && itemsRaw) {
        try {
          items = JSON.parse(itemsRaw);
        } catch {
          items = [];
        }
      }

      const file = form.get("excel") as File | null;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fromExcel = parseExcelBuffer(buffer);
        items = [...items, ...fromExcel];

        const uploadDir = path.join(process.cwd(), "public", "uploads", "quotes");
        await mkdir(uploadDir, { recursive: true });
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
        await writeFile(path.join(uploadDir, filename), buffer);
        excelUrl = `/uploads/quotes/${filename}`;
      }
    } else {
      const body = await request.json();
      name = String(body.name || "").trim();
      email = String(body.email || "").trim();
      phone = String(body.phone || "").trim();
      source = String(body.source || "").trim();
      note = String(body.note || "").trim();
      items = Array.isArray(body.items) ? body.items : [];
      excelUrl = body.excelUrl || null;
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: "Vui lòng nhập họ tên và email" },
        { status: 400 }
      );
    }

    if (!items.length) {
      return NextResponse.json(
        { error: "Vui lòng chọn sản phẩm hoặc tải file Excel" },
        { status: 400 }
      );
    }

    const resolved = (
      await Promise.all(items.map((item) => resolveItem(item)))
    ).filter(Boolean) as Awaited<ReturnType<typeof resolveItem>>[];

    if (!resolved.length) {
      return NextResponse.json(
        { error: "Không có dòng sản phẩm hợp lệ" },
        { status: 400 }
      );
    }

    const quote = await prisma.quoteRequest.create({
      data: {
        name,
        email,
        phone: phone || null,
        source: source || null,
        note: note || null,
        excelUrl,
        items: {
          create: resolved.map((item) => ({
            productId: item!.productId,
            nameOrSku: item!.nameOrSku,
            productName: item!.productName,
            productSku: item!.productSku,
            quantity: item!.quantity,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: quote }, { status: 201 });
  } catch (error) {
    console.error("Error creating quote request:", error);
    return NextResponse.json(
      { error: "Không thể gửi yêu cầu báo giá" },
      { status: 500 }
    );
  }
}
