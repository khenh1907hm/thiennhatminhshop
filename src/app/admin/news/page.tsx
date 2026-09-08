"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";
import Pagination from "@/components/ui/Pagination";

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/news/posts?page=${page}&limit=12`);
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(Array.isArray(data.items) ? data.items : []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } catch (err) {
        console.error(err);
        showNotification("Lỗi tải danh sách bài viết", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [page, showNotification]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Tin tức & Bài viết</h1>
          <p className="text-sm text-on-surface-variant">
            Quản lý nội dung blog · {total} bài viết
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/news/categories"
            className="px-4 py-2 bg-surface border border-outline-variant text-on-surface rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            Danh mục & Tags
          </Link>
          <Link
            href="/admin/news/new"
            className="px-4 py-2 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Viết bài mới
          </Link>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b text-xs font-semibold uppercase text-outline tracking-wider">
                <th className="px-6 py-4">Bài viết</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Tác giả</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Thời gian xuất bản</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {loading ? (
                <tr><td colSpan={6} className="p-6 text-center">Đang tải...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center">Chưa có bài viết nào</td></tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 max-w-[300px]">
                      <div className="font-bold text-on-surface truncate">{post.title}</div>
                      <div className="text-xs text-on-surface-variant truncate mt-0.5">{post.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      {post.category ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {post.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Không có</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {post.author?.name || "Admin"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        post.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {formatDate(post.publishedAt)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/news/${post.id}`}
                        className="text-primary hover:text-primary/80 font-semibold"
                      >
                        Sửa
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
