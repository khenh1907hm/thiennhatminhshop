"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/admin/categories?paged=true&page=${page}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCategories(data.items || []); setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
      showNotification("Lỗi khi tải danh mục", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete");
      }
      showNotification("Xóa danh mục thành công", "success");
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      showNotification(error.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Quản lý Danh mục</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Thiết lập cây danh mục sản phẩm.
          </p>
        </div>
        <Link 
          href="/admin/categories/new"
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
              <th className="px-6 py-4">Tên danh mục</th>
              <th className="px-6 py-4">Danh mục cha</th>
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
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Chưa có danh mục nào.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="px-6 py-4 font-semibold text-on-surface">{cat.name}</td>
                  <td className="px-6 py-4">
                    {cat.parentName ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        <span className="material-symbols-outlined text-[13px]">subdirectory_arrow_right</span>
                        {cat.parentName}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        <span className="material-symbols-outlined text-[13px]">account_tree</span>
                        Danh mục gốc
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-xs">{cat.slug}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{cat._count?.products || 0} SP</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/admin/categories/${cat.id}`}
                        className="p-2 text-on-surface-variant hover:text-primary rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Link>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-on-surface-variant hover:text-red-500 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
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
