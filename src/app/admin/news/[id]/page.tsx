"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";
import NewsPostForm, { NewsPostFormValues } from "@/components/admin/NewsPostForm";

const emptyValues: NewsPostFormValues = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  coverImage: "",
  categoryId: "",
  status: "DRAFT",
  publishedAt: "",
  metaTitle: "",
  metaDesc: "",
  focusKeyword: "",
};

export default function AdminEditNewsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<NewsPostFormValues>(emptyValues);
  const [initialTagIds, setInitialTagIds] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/news/posts/${id}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Không tải được bài viết");
        }
        const post = await res.json();
        setInitialValues({
          title: post.title || "",
          slug: post.slug || "",
          summary: post.summary || "",
          content: post.content || "",
          coverImage: post.coverImage || "",
          categoryId: post.categoryId || "",
          status: post.status || "DRAFT",
          publishedAt: post.publishedAt || "",
          metaTitle: post.metaTitle || "",
          metaDesc: post.metaDesc || "",
          focusKeyword: post.focusKeyword || "",
        });
        setInitialTagIds((post.tags || []).map((t: { id: string }) => t.id));
      } catch (err: any) {
        console.error(err);
        showNotification(err.message || "Lỗi tải bài viết", "error");
        router.push("/admin/news");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router, showNotification]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/news"
          className="w-10 h-10 bg-surface rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors border border-outline-variant shadow-sm"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Sửa bài viết</h1>
          <p className="text-sm text-on-surface-variant">Cập nhật nội dung, ảnh đại diện và tags</p>
        </div>
      </div>

      <NewsPostForm
        mode="edit"
        initialValues={initialValues}
        initialTagIds={initialTagIds}
        submitLabel="Lưu thay đổi"
        onSubmit={async (payload) => {
          const res = await fetch(`/api/admin/news/posts/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...payload,
              categoryId: payload.categoryId || null,
              coverImage: payload.coverImage || null,
              publishedAt: payload.publishedAt || null,
            }),
          });
          if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || "Failed to update post");
          }
          showNotification("Cập nhật bài viết thành công", "success");
          router.push("/admin/news");
          router.refresh();
        }}
        onDelete={async () => {
          const res = await fetch(`/api/admin/news/posts/${id}`, { method: "DELETE" });
          if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || "Failed to delete post");
          }
          showNotification("Đã xóa bài viết", "success");
          router.push("/admin/news");
          router.refresh();
        }}
      />
    </div>
  );
}
