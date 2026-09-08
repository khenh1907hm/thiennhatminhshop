import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where =
      status && status !== "ALL"
        ? { status: status as "RECEIVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" }
        : {};

    const quotes = await prisma.quoteRequest.findMany({
      where,
      include: {
        items: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}
