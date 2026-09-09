"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useNotification } from "@/context/NotificationContext";

const ReactQuill = dynamic(
  () => import("react-quill-new").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-64 bg-slate-100 animate-pulse rounded-xl" /> }
);
import "react-quill-new/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    // No justify — avoids stretched word spacing on the public article page
    [{ align: ["", "center", "right"] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

export type NewsPostFormValues = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  categoryId: string;
  status: string;
  publishedAt: string;
  metaTitle: string;
  metaDesc: string;
  focusKeyword: string;
};

type NewsPostFormProps = {
  mode: "create" | "edit";
  initialValues: NewsPostFormValues;
  initialTagIds?: string[];
  submitLabel: string;
  onSubmit: (payload: NewsPostFormValues & { tagIds: string[] }) => Promise<void>;
  onDelete?: () => Promise<void>;
};

const EMPTY_TAG_IDS: string[] = [];

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewsPostForm({
  mode,
  initialValues,
  initialTagIds = EMPTY_TAG_IDS,
  submitLabel,
  onSubmit,
  onDelete,
}: NewsPostFormProps) {
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTagIds);
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [formData, setFormData] = useState<NewsPostFormValues>({
    ...initialValues,
    publishedAt: toDatetimeLocal(initialValues.publishedAt),
  });

  useEffect(() => {
    setFormData({
      ...initialValues,
      publishedAt: toDatetimeLocal(initialValues.publishedAt),
    });
    setSelectedTagIds(initialTagIds);
  }, [initialValues, initialTagIds]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/news/categories").then((res) => res.json()),
      fetch("/api/admin/news/tags").then((res) => res.json()),
    ])
      .then(([catData, tagData]) => {
        setCategories(Array.isArray(catData) ? catData : []);
        setTags(Array.isArray(tagData) ? tagData : []);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "title" && mode === "create") {
      setFormData({
        ...formData,
        title: value,
        slug: value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-"),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      setFormData((prev) => ({ ...prev, coverImage: data.url }));
      showNotification("Đã tải ảnh đại diện", "success");
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || "Lỗi tải ảnh", "error");
    } finally {
      setUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let publishedAt = formData.publishedAt;
      if (formData.status === "PUBLISHED" && !publishedAt) {
        publishedAt = new Date().toISOString();
      } else if (publishedAt) {
        publishedAt = new Date(publishedAt).toISOString();
      }

      await onSubmit({
        ...formData,
        publishedAt: publishedAt || "",
        tagIds: selectedTagIds,
      });
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || "Lỗi lưu bài viết", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface rounded-3xl p-6 md:p-8 border border-outline-variant shadow-sm space-y-8"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-bold text-on-surface">
              Tiêu đề bài viết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Nhập tiêu đề..."
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">
              Slug (Đường dẫn) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              required
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">Danh mục</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            >
              <option value="">Chọn danh mục...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cover image */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-on-surface">Ảnh đại diện bài viết</label>
          <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low/40 p-4">
            {formData.coverImage ? (
              <div className="space-y-3">
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-outline-variant">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.coverImage}
                    alt="Ảnh đại diện"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    {uploadingCover ? "Đang tải..." : "Đổi ảnh"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, coverImage: "" }))}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-outline-variant text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Gỡ ảnh
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCover}
                className="w-full py-10 flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                <span className="text-sm font-bold">
                  {uploadingCover ? "Đang tải ảnh..." : "Thêm ảnh đại diện"}
                </span>
                <span className="text-xs">JPG, PNG, WEBP — khuyến nghị tỉ lệ 16:9</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-bold text-on-surface">Tags</label>
            <Link
              href="/admin/news/categories"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Quản lý tags
            </Link>
          </div>
          {tags.length === 0 ? (
            <p className="text-xs text-on-surface-variant bg-surface-container-low rounded-xl px-4 py-3 border border-outline-variant">
              Chưa có tag nào. Hãy tạo tag ở trang Danh mục &amp; Tags trước.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-outline-variant bg-surface-container-low/40">
              {tags.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      selected
                        ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                        : "bg-white text-slate-600 border-outline-variant hover:border-cyan-400 hover:text-cyan-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {selected ? "check_circle" : "sell"}
                    </span>
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-on-surface">Mô tả ngắn (Summary)</label>
          <textarea
            name="summary"
            rows={3}
            value={formData.summary}
            onChange={handleChange}
            placeholder="Vài dòng tóm tắt bài viết..."
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-on-surface">
          Nội dung bài viết <span className="text-red-500">*</span>
        </label>
        <div className="border border-outline-variant rounded-xl overflow-hidden bg-white news-quill-editor">
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
            modules={modules}
            className="min-h-[400px]"
          />
        </div>
      </div>

      <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant space-y-4">
        <h3 className="font-bold text-sm uppercase tracking-widest text-outline">
          SEO (Tối ưu công cụ tìm kiếm)
        </h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">Meta Title</label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">Meta Description</label>
            <textarea
              name="metaDesc"
              rows={2}
              value={formData.metaDesc}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">Focus Keyword</label>
            <input
              type="text"
              name="focusKeyword"
              value={formData.focusKeyword}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant space-y-4">
        <h3 className="font-bold text-sm uppercase tracking-widest text-outline">Cài đặt xuất bản</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold"
            >
              <option value="DRAFT">Nháp (Draft)</option>
              <option value="PUBLISHED">Xuất bản (Published)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">Thời gian xuất bản</label>
            <input
              type="datetime-local"
              name="publishedAt"
              value={formData.publishedAt}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-3 pt-2">
        <div>
          {onDelete && (
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                if (!confirm("Bạn chắc chắn muốn xóa bài viết này?")) return;
                setLoading(true);
                try {
                  await onDelete();
                } catch (err: any) {
                  showNotification(err.message || "Lỗi xóa bài viết", "error");
                  setLoading(false);
                }
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              Xóa bài
            </button>
          )}
        </div>
        <div className="flex gap-3 ml-auto">
          <Link
            href="/admin/news"
            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={loading || uploadingCover}
            className={`px-8 py-2.5 rounded-xl font-bold text-white shadow-sm transition-all ${
              loading || uploadingCover
                ? "bg-primary/50 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 active:scale-95"
            }`}
          >
            {loading ? "Đang lưu..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
