import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;

    const where =
      status && status !== "ALL"
        ? { status: status as "RECEIVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" }
        : {};

    const [items, total] = await Promise.all([prisma.quoteRequest.findMany({
      where,
      include: {
        items: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" }, skip, take: limit,
    }), prisma.quoteRequest.count({ where })]);

    return NextResponse.json({ items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}
