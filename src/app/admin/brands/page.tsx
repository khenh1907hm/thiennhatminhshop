"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";

type BrandRow = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  productCount?: number;
};

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1);

  const fetchBrands = async () => {
    try {
      const res = await fetch(`/api/admin/brands?paged=true&page=${page}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBrands(data.items || []); setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
      showNotification("Lỗi khi tải thương hiệu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) return;

    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete");
      }
      showNotification("Xóa thương hiệu thành công", "success");
      fetchBrands();
    } catch (error: any) {
      console.error(error);
      showNotification(error.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">
            Quản lý Thương hiệu
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Quản lý danh sách thương hiệu và logo hiển thị trên trang chủ.
          </p>
        </div>
        <Link
          href="/admin/brands/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 active:scale-98"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm mới
        </Link>
      </div>
      <div className="flex justify-end gap-3 text-sm"><span>Trang {page}/{totalPages}</span><button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Trước</button><button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Sau</button></div>

      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-outline uppercase tracking-wider">
              <th className="px-6 py-4">Logo</th>
              <th className="px-6 py-4">Tên thương hiệu</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Sản phẩm</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Chưa có thương hiệu nào.
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr
                  key={brand.id}
                  className="hover:bg-surface-container-low/60 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="w-14 h-10 rounded-lg bg-white border border-outline-variant flex items-center justify-center overflow-hidden">
                      {brand.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="max-h-8 max-w-full object-contain"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-outline text-lg">
                          image
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-on-surface">
                    {brand.name}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-xs">
                    {brand.slug}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {brand.productCount || 0} SP
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/brands/${brand.id}`}
                        className="p-2 text-on-surface-variant hover:text-primary rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          edit
                        </span>
                      </Link>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="p-2 text-on-surface-variant hover:text-red-500 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
