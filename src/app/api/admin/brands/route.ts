import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams; const paged = params.get('paged') === 'true'; const page = Math.max(1, Number(params.get('page')) || 1); const limit = Math.min(50, Math.max(1, Number(params.get('limit')) || 20));
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      ...(paged ? { skip: (page - 1) * limit, take: limit } : {}),
    });

    const productCounts = await prisma.product.groupBy({
      by: ["brand"],
      _count: { _all: true },
      where: { brand: { not: null } },
    });

    const countMap = new Map(
      productCounts
        .filter((p) => p.brand)
        .map((p) => [p.brand!.toLowerCase(), p._count._all])
    );

    const enriched = brands.map((b) => ({
      ...b,
      productCount: countMap.get(b.name.toLowerCase()) || 0,
    }));

    if (!paged) return NextResponse.json(enriched);
    const total = await prisma.brand.count(); return NextResponse.json({ items: enriched, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, image } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error: any) {
    console.error("Error creating brand:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Slug must be unique" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to create brand" },
      { status: 500 }
    );
  }
}
