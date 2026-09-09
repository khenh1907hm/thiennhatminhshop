"use client";

import { useEffect, useState } from "react";
import { useNotification } from "@/context/NotificationContext";
import { formatPrice, formatVndInput, parseVndInput } from "@/lib/formatPrice";

type Promotion = {
  id: string;
  code: string;
  description?: string | null;
  discountType: string;
  discountValue: number | string;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
};

const emptyForm = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  startDate: "",
  endDate: "",
  usageLimit: "",
  isActive: true,
};

function toDateInput(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function promoStatus(p: Promotion) {
  const now = new Date();
  const start = new Date(p.startDate);
  const end = new Date(p.endDate);
  if (!p.isActive) return { label: "Tắt", cls: "bg-slate-100 text-slate-600" };
  if (end < now) return { label: "Hết hạn", cls: "bg-rose-100 text-rose-800" };
  if (start > now) return { label: "Chưa bắt đầu", cls: "bg-amber-100 text-amber-800" };
  if (p.usageLimit != null && p.usedCount >= p.usageLimit) {
    return { label: "Hết lượt", cls: "bg-rose-100 text-rose-800" };
  }
  return { label: "Đang chạy", cls: "bg-emerald-100 text-emerald-800" };
}

function formatDiscount(p: Promotion) {
  const value = Number(p.discountValue);
  if (p.discountType === "PERCENTAGE") return `${value}%`;
  return formatPrice(value);
}

export default function AdminPromotionsPage() {
  const { showNotification } = useNotification();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/promotions?page=${page}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPromotions(data.items || []); setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      showNotification("Lỗi tải khuyến mãi", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditingId(p.id);
    setForm({
      code: p.code,
      description: p.description || "",
      discountType: p.discountType || "PERCENTAGE",
      discountValue:
        p.discountType === "FIXED"
          ? formatVndInput(String(Math.round(Number(p.discountValue))))
          : String(Number(p.discountValue)),
      startDate: toDateInput(p.startDate),
      endDate: toDateInput(p.endDate),
      usageLimit: p.usageLimit != null ? String(p.usageLimit) : "",
      isActive: p.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const discountValue =
        form.discountType === "FIXED"
          ? parseVndInput(form.discountValue)
          : parseFloat(form.discountValue);

      if (!form.code.trim() || !discountValue || !form.startDate || !form.endDate) {
        throw new Error("Vui lòng điền đủ thông tin bắt buộc");
      }

      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
        discountType: form.discountType,
        discountValue,
        startDate: form.startDate,
        endDate: form.endDate,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : null,
        isActive: form.isActive,
      };

      const res = await fetch(
        editingId ? `/api/admin/promotions/${editingId}` : "/api/admin/promotions",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Lưu thất bại");
      }

      showNotification(editingId ? "Cập nhật mã thành công" : "Tạo mã thành công", "success");
      setModalOpen(false);
      await load();
    } catch (err: any) {
      showNotification(err.message || "Lỗi lưu khuyến mãi", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: Promotion) => {
    try {
      const res = await fetch(`/api/admin/promotions/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      showNotification(p.isActive ? "Đã tắt mã" : "Đã bật mã", "success");
      await load();
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa mã khuyến mãi này?")) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xóa thất bại");
      showNotification("Đã xóa mã khuyến mãi", "success");
      await load();
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Mã giảm giá & Khuyến mãi</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Tạo mã áp dụng khi thêm/sửa sản phẩm · {promotions.length} mã
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 active:scale-98"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo mã mới
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-outline uppercase tracking-wider">
                <th className="px-6 py-4">Mã CODE</th>
                <th className="px-6 py-4">Mức giảm</th>
                <th className="px-6 py-4">Đã dùng</th>
                <th className="px-6 py-4">Thời hạn</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Đang tải...
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Chưa có mã khuyến mãi nào.
                  </td>
                </tr>
              ) : (
                promotions.map((promo) => {
                  const status = promoStatus(promo);
                  return (
                    <tr key={promo.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-primary">{promo.code}</div>
                        {promo.description && (
                          <div className="text-xs text-outline mt-0.5">{promo.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-on-surface">
                        {formatDiscount(promo)}
                        <span className="block text-[10px] text-outline uppercase mt-0.5">
                          {promo.discountType === "PERCENTAGE" ? "Phần trăm" : "Số tiền cố định"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">
                        {promo.usedCount}
                        {promo.usageLimit != null ? ` / ${promo.usageLimit}` : " / ∞"}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant text-xs">
                        {toDateInput(promo.startDate)} → {toDateInput(promo.endDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <label className="relative inline-flex items-center cursor-pointer mr-2 align-middle">
                          <input
                            type="checkbox"
                            checked={promo.isActive}
                            onChange={() => toggleActive(promo)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                        </label>
                        <button
                          type="button"
                          onClick={() => openEdit(promo)}
                          className="p-2 text-on-surface-variant hover:text-primary rounded-lg"
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(promo.id)}
                          className="p-2 text-on-surface-variant hover:text-error rounded-lg"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pager page={page} totalPages={totalPages} onChange={setPage}/>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
            aria-label="Đóng"
          />
          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-lg bg-white rounded-3xl border border-outline-variant shadow-2xl p-6 space-y-4"
          >
            <h2 className="text-lg font-bold text-on-surface">
              {editingId ? "Sửa mã khuyến mãi" : "Tạo mã khuyến mãi"}
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-outline mb-1.5">
                Mã CODE *
              </label>
              <input
                required
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low font-mono font-bold uppercase outline-none focus:border-primary"
                placeholder="VD: SALE10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-outline mb-1.5">
                Mô tả
              </label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-primary text-sm"
                placeholder="Mô tả ngắn"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-outline mb-1.5">
                  Loại giảm *
                </label>
                <select
                  value={form.discountType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      discountType: e.target.value,
                      discountValue: "",
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-primary text-sm"
                >
                  <option value="PERCENTAGE">Phần trăm (%)</option>
                  <option value="FIXED">Số tiền cố định (VNĐ)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-outline mb-1.5">
                  Giá trị *
                </label>
                <input
                  required
                  value={form.discountValue}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setForm((f) => ({
                      ...f,
                      discountValue:
                        f.discountType === "FIXED" ? formatVndInput(raw) : raw.replace(/[^\d.]/g, ""),
                    }));
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-primary text-sm font-semibold"
                  placeholder={form.discountType === "FIXED" ? "50.000" : "10"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-outline mb-1.5">
                  Ngày bắt đầu *
                </label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-outline mb-1.5">
                  Ngày kết thúc *
                </label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-primary text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-outline mb-1.5">
                Giới hạn lượt dùng
              </label>
              <input
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-primary text-sm"
                placeholder="Để trống = không giới hạn"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-outline-variant hover:bg-surface-container-low">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="w-5 h-5 rounded text-primary"
              />
              <span className="text-sm font-semibold text-on-surface">Kích hoạt ngay</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu mã"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
function Pager({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) { return <div className="flex justify-end gap-3 text-sm"><span>Trang {page}/{totalPages}</span><button disabled={page === 1} onClick={() => onChange(page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Trước</button><button disabled={page === totalPages} onClick={() => onChange(page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Sau</button></div>; }
