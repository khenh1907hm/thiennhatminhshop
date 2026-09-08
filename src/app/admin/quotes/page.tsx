"use client";

import { Fragment, useEffect, useState } from "react";
import { useNotification } from "@/context/NotificationContext";

type QuoteItem = {
  id: string;
  nameOrSku: string;
  productName?: string | null;
  productSku?: string | null;
  quantity: number;
};

type Quote = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  source?: string | null;
  excelUrl?: string | null;
  note?: string | null;
  status: "RECEIVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  items: QuoteItem[];
  _count?: { items: number };
};

const STATUS_LABEL: Record<Quote["status"], string> = {
  RECEIVED: "Đã tiếp nhận",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

const STATUS_CLASS: Record<Quote["status"], string> = {
  RECEIVED: "bg-sky-100 text-sky-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-slate-200 text-slate-600",
};

export default function AdminQuotesPage() {
  const { showNotification } = useNotification();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const params = filter !== "ALL" ? `?status=${filter}` : "";
      const res = await fetch(`/api/admin/quotes${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      showNotification("Lỗi khi tải yêu cầu báo giá", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [filter]);

  const updateStatus = async (id: string, status: Quote["status"]) => {
    try {
      const res = await fetch(`/api/admin/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      showNotification("Cập nhật trạng thái thành công", "success");
      fetchQuotes();
    } catch (e: any) {
      showNotification(e.message || "Không cập nhật được", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa yêu cầu báo giá này?")) return;
    try {
      const res = await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showNotification("Đã xóa", "success");
      fetchQuotes();
    } catch (e: any) {
      showNotification(e.message || "Không xóa được", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">
            Yêu cầu báo giá
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Quản lý các yêu cầu báo giá từ trang chủ và liên hệ.
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-surface border border-outline-variant rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="RECEIVED">Đã tiếp nhận</option>
          <option value="IN_PROGRESS">Đang thực hiện</option>
          <option value="COMPLETED">Đã hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-outline uppercase tracking-wider">
              <th className="px-5 py-4">Khách hàng</th>
              <th className="px-5 py-4">Sản phẩm</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4">Ngày gửi</th>
              <th className="px-5 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                  Đang tải...
                </td>
              </tr>
            ) : quotes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                  Chưa có yêu cầu nào.
                </td>
              </tr>
            ) : (
              quotes.map((q) => (
                <Fragment key={q.id}>
                  <tr className="hover:bg-surface-container-low/50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-on-surface">{q.name}</p>
                      <p className="text-xs text-on-surface-variant">{q.email}</p>
                      {q.phone && (
                        <p className="text-xs text-on-surface-variant">{q.phone}</p>
                      )}
                      {q.source && (
                        <p className="text-[10px] text-outline mt-1">{q.source}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((id) => (id === q.id ? null : q.id))
                        }
                        className="text-primary font-semibold hover:underline"
                      >
                        {q.items?.length || q._count?.items || 0} dòng
                      </button>
                      {q.excelUrl && (
                        <a
                          href={q.excelUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-[11px] text-outline hover:text-primary mt-1"
                        >
                          File Excel đính kèm
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={q.status}
                        onChange={(e) =>
                          updateStatus(q.id, e.target.value as Quote["status"])
                        }
                        className={`rounded-full px-3 py-1.5 text-xs font-bold border-0 outline-none cursor-pointer ${STATUS_CLASS[q.status]}`}
                      >
                        {(Object.keys(STATUS_LABEL) as Quote["status"][]).map(
                          (s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant text-xs">
                      {new Date(q.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(q.id)}
                        className="p-2 text-on-surface-variant hover:text-red-500 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                  {expanded === q.id && (
                    <tr>
                      <td colSpan={5} className="px-5 py-4 bg-surface-container-low/40">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-outline uppercase">
                              <th className="text-left py-1">Tên / SKU</th>
                              <th className="text-left py-1">Sản phẩm khớp</th>
                              <th className="text-right py-1">SL</th>
                            </tr>
                          </thead>
                          <tbody>
                            {q.items.map((item) => (
                              <tr key={item.id} className="border-t border-outline-variant/40">
                                <td className="py-2 font-medium">{item.nameOrSku}</td>
                                <td className="py-2 text-on-surface-variant">
                                  {item.productName
                                    ? `${item.productName}${item.productSku ? ` (${item.productSku})` : ""}`
                                    : "— chưa khớp catalog —"}
                                </td>
                                <td className="py-2 text-right font-bold">
                                  {item.quantity}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
