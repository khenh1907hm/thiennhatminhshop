"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";

type Tab = "categories" | "tags";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

type Tag = {
  id: string;
  name: string;
  slug: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-slate-400";

export default function AdminNewsTaxonomyPage() {
  const { showNotification } = useNotification();
  const [tab, setTab] = useState<Tab>("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDescription, setCatDescription] = useState("");

  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagSlug, setTagSlug] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, tagRes] = await Promise.all([
        fetch("/api/admin/news/categories"),
        fetch("/api/admin/news/tags"),
      ]);
      if (!catRes.ok || !tagRes.ok) throw new Error("Failed to fetch");
      const [catData, tagData] = await Promise.all([catRes.json(), tagRes.json()]);
      setCategories(Array.isArray(catData) ? catData : []);
      setTags(Array.isArray(tagData) ? tagData : []);
    } catch (err) {
      console.error(err);
      showNotification("Lỗi tải danh mục / tags", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetCatForm = () => {
    setEditingCatId(null);
    setCatName("");
    setCatSlug("");
    setCatDescription("");
  };

  const resetTagForm = () => {
    setEditingTagId(null);
    setTagName("");
    setTagSlug("");
  };

  const startEditCat = (c: Category) => {
    setEditingCatId(c.id);
    setCatName(c.name);
    setCatSlug(c.slug);
    setCatDescription(c.description || "");
  };

  const startEditTag = (t: Tag) => {
    setEditingTagId(t.id);
    setTagName(t.name);
    setTagSlug(t.slug);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: catName.trim(),
        slug: catSlug.trim(),
        description: catDescription.trim() || null,
      };
      const res = await fetch(
        editingCatId
          ? `/api/admin/news/categories/${editingCatId}`
          : "/api/admin/news/categories",
        {
          method: editingCatId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Lưu thất bại");
      }
      showNotification(editingCatId ? "Đã cập nhật danh mục" : "Đã thêm danh mục", "success");
      resetCatForm();
      await loadData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi lưu danh mục", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: tagName.trim(), slug: tagSlug.trim() };
      const res = await fetch(
        editingTagId ? `/api/admin/news/tags/${editingTagId}` : "/api/admin/news/tags",
        {
          method: editingTagId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Lưu thất bại");
      }
      showNotification(editingTagId ? "Đã cập nhật tag" : "Đã thêm tag", "success");
      resetTagForm();
      await loadData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi lưu tag", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Xóa danh mục "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/news/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Xóa thất bại");
      }
      if (editingCatId === id) resetCatForm();
      showNotification("Đã xóa danh mục", "success");
      await loadData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi xóa", "error");
    }
  };

  const handleDeleteTag = async (id: string, name: string) => {
    if (!confirm(`Xóa tag "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/news/tags/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Xóa thất bại");
      }
      if (editingTagId === id) resetTagForm();
      showNotification("Đã xóa tag", "success");
      await loadData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi xóa", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link
            href="/admin/news"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 mb-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Tin tức
          </Link>
          <h1 className="text-xl font-bold text-slate-900 font-headline">Danh mục &amp; Tags</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {categories.length} danh mục · {tags.length} tags
          </p>
        </div>

        <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setTab("categories")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              tab === "categories"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Danh mục
          </button>
          <button
            type="button"
            onClick={() => setTab("tags")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              tab === "tags"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Tags
          </button>
        </div>
      </div>

      {tab === "categories" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <section className="lg:col-span-4">
            <form
              onSubmit={handleSaveCategory}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
            >
              <h2 className="text-sm font-bold text-slate-800">
                {editingCatId ? "Sửa danh mục" : "Thêm danh mục"}
              </h2>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tên</label>
                <input
                  required
                  value={catName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCatName(val);
                    if (!editingCatId) setCatSlug(slugify(val));
                  }}
                  placeholder="VD: Công nghệ"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Slug</label>
                <input
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className={`${inputCls} font-mono`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Mô tả</label>
                <textarea
                  rows={3}
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Tùy chọn"
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div className="flex gap-2 pt-1">
                {editingCatId && (
                  <button
                    type="button"
                    onClick={resetCatForm}
                    className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : editingCatId ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </section>

          <section className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 text-sm font-semibold text-slate-700">
                Danh sách danh mục
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                      <th className="px-4 py-2.5 font-semibold">Tên</th>
                      <th className="px-4 py-2.5 font-semibold">Slug</th>
                      <th className="px-4 py-2.5 font-semibold">Mô tả</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                          Đang tải...
                        </td>
                      </tr>
                    ) : categories.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                          Chưa có danh mục
                        </td>
                      </tr>
                    ) : (
                      categories.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 font-semibold text-slate-800">{c.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.slug}</td>
                          <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">
                            {c.description || "—"}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => startEditCat(c)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md"
                              title="Sửa"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(c.id, c.name)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-md"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <section className="lg:col-span-4">
            <form
              onSubmit={handleSaveTag}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
            >
              <h2 className="text-sm font-bold text-slate-800">
                {editingTagId ? "Sửa tag" : "Thêm tag"}
              </h2>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tên</label>
                <input
                  required
                  value={tagName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTagName(val);
                    if (!editingTagId) setTagSlug(slugify(val));
                  }}
                  placeholder="VD: Inverter"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Slug</label>
                <input
                  required
                  value={tagSlug}
                  onChange={(e) => setTagSlug(e.target.value)}
                  className={`${inputCls} font-mono`}
                />
              </div>
              <div className="flex gap-2 pt-1">
                {editingTagId && (
                  <button
                    type="button"
                    onClick={resetTagForm}
                    className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : editingTagId ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </section>

          <section className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 text-sm font-semibold text-slate-700">
                Danh sách tags
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                      <th className="px-4 py-2.5 font-semibold">Tên</th>
                      <th className="px-4 py-2.5 font-semibold">Slug</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center text-slate-400">
                          Đang tải...
                        </td>
                      </tr>
                    ) : tags.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center text-slate-400">
                          Chưa có tag
                        </td>
                      </tr>
                    ) : (
                      tags.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 font-semibold text-slate-800">{t.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.slug}</td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => startEditTag(t)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md"
                              title="Sửa"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTag(t.id, t.name)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-md"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
