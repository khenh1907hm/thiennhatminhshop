import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
        author: { select: { id: true, name: true, email: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Lỗi tải bài viết" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const {
      title,
      slug,
      summary,
      content,
      coverImage,
      status,
      publishedAt,
      categoryId,
      tagIds,
      metaTitle,
      metaDesc,
      focusKeyword,
    } = await request.json();

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Tiêu đề, slug và nội dung là bắt buộc" },
        { status: 400 }
      );
    }

    const existing = await prisma.post.findUnique({
      where: { id },
      include: { tags: { select: { id: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });
    }

    const nextTagIds: string[] = Array.isArray(tagIds) ? tagIds : [];
    const currentTagIds = existing.tags.map((t) => t.id);
    const toDisconnect = currentTagIds
      .filter((tagId) => !nextTagIds.includes(tagId))
      .map((tagId) => ({ id: tagId }));
    const toConnect = nextTagIds
      .filter((tagId) => !currentTagIds.includes(tagId))
      .map((tagId) => ({ id: tagId }));

    let resolvedPublishedAt: Date | null = publishedAt ? new Date(publishedAt) : null;
    if (status === "PUBLISHED" && !resolvedPublishedAt) {
      resolvedPublishedAt = existing.publishedAt || new Date();
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        summary,
        content,
        coverImage: coverImage || null,
        metaTitle,
        metaDesc,
        focusKeyword,
        status: status || "DRAFT",
        publishedAt: resolvedPublishedAt,
        categoryId: categoryId || null,
        tags: {
          disconnect: toDisconnect,
          connect: toConnect,
        },
      },
      include: {
        category: true,
        tags: true,
        author: { select: { name: true } },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Lỗi cập nhật bài viết" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Lỗi xóa bài viết" }, { status: 500 });
  }
}
