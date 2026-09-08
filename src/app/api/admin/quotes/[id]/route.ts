import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const STATUSES = ["RECEIVED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quote = await prisma.quoteRequest.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!quote) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(quote);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: { status?: (typeof STATUSES)[number]; note?: string | null } = {};

    if (body.status) {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      data.status = body.status;
    }
    if (body.note !== undefined) {
      data.note = body.note;
    }

    const quote = await prisma.quoteRequest.update({
      where: { id },
      data,
      include: { items: true },
    });

    return NextResponse.json(quote);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.quoteRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
