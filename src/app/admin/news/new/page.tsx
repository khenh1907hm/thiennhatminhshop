"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function AdminCreateNewsPage() {
  const router = useRouter();
  const { showNotification } = useNotification();

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
          <h1 className="text-2xl font-bold text-on-surface">Viết bài mới</h1>
          <p className="text-sm text-on-surface-variant">Tạo nội dung bài viết trên Blog/Tin tức</p>
        </div>
      </div>

      <NewsPostForm
        mode="create"
        initialValues={emptyValues}
        submitLabel="Lưu bài viết"
        onSubmit={async (payload) => {
          const res = await fetch("/api/admin/news/posts", {
            method: "POST",
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
            throw new Error(error.error || "Failed to create post");
          }
          showNotification("Tạo bài viết thành công", "success");
          router.push("/admin/news");
          router.refresh();
        }}
      />
    </div>
  );
}
