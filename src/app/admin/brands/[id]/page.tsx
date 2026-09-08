"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const res = await fetch(`/api/admin/brands/${id}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch brand");
        }
        const data = await res.json();
        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          description: data.description || "",
          image: data.image || "",
        });
      } catch (error: any) {
        console.error(error);
        showNotification(error.message, "error");
        router.push("/admin/brands");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchBrand();
  }, [id, router, showNotification]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData((prev) => ({ ...prev, image: data.url }));
      showNotification("Tải ảnh thành công", "success");
    } catch (err) {
      console.error(err);
      showNotification("Lỗi khi tải ảnh", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/brands/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update brand");
      }

      showNotification("Cập nhật thương hiệu thành công", "success");
      router.push("/admin/brands");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/brands"
          className="p-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">
            Cập nhật Thương hiệu
          </h1>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Tên thương hiệu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleNameChange}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Đường dẫn (Slug) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Logo thương hiệu
              </label>
              <div className="flex items-center gap-4">
                <div className="w-28 h-20 rounded-xl bg-white border border-outline-variant flex items-center justify-center overflow-hidden shrink-0">
                  {formData.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formData.image}
                      alt="Logo"
                      className="max-h-14 max-w-full object-contain"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-outline text-2xl">
                      image
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm font-medium cursor-pointer hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-[18px]">
                      upload
                    </span>
                    {uploading ? "Đang tải..." : "Tải ảnh lên"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="Hoặc dán URL ảnh..."
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-outline-variant">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 active:scale-98 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Cập nhật thương hiệu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
