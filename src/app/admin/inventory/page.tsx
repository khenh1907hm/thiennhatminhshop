"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Product = { id: string; name: string; sku: string; stock: number; stockAlertThreshold: number; category: { name: string } | null };
type Receipt = { id: string; receiptNumber: string; note: string | null; createdAt: string; items: Array<{ id: string; quantity: number; stockBefore: number; stockAfter: number; product: { name: string; sku: string } }> };
type ReceiptLine = { productId: string; quantity: number };
const emptyLine = (): ReceiptLine => ({ productId: "", quantity: 1 });

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stats, setStats] = useState({ totalProducts: 0, lowStockCount: 0 });
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [thresholdProduct, setThresholdProduct] = useState<Product | null>(null);
  const [threshold, setThreshold] = useState(20);
  const [lines, setLines] = useState<ReceiptLine[]>([emptyLine()]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1); const [receiptPage, setReceiptPage] = useState(1); const [receiptTotalPages, setReceiptTotalPages] = useState(1);

  const loadInventory = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (lowStockOnly) params.set("lowStock", "true");
      params.set("page", String(page)); params.set("receiptPage", String(receiptPage)); params.set("limit", "20");
      const res = await fetch(`/api/admin/inventory?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tải dữ liệu kho");
      setProducts(data.products); setStats(data.stats); setReceipts(data.receipts); setTotalPages(data.totalPages); setReceiptTotalPages(data.receiptTotalPages);
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể tải dữ liệu kho"); }
    finally { setLoading(false); }
  }, [search, lowStockOnly, page, receiptPage]);

  useEffect(() => { const timer = window.setTimeout(loadInventory, 200); return () => window.clearTimeout(timer); }, [loadInventory]);
  const productOptions = useMemo(() => [...products].sort((a, b) => a.name.localeCompare(b.name, "vi")), [products]);

  async function saveThreshold(event: FormEvent) {
    event.preventDefault(); if (!thresholdProduct) return; setSaving(true);
    try {
      const res = await fetch(`/api/admin/inventory/${thresholdProduct.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stockAlertThreshold: Number(threshold) }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Không thể cập nhật ngưỡng");
      setThresholdProduct(null); await loadInventory();
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể cập nhật ngưỡng"); }
    finally { setSaving(false); }
  }

  function changeLine(index: number, field: keyof ReceiptLine, value: string | number) { setLines((current) => current.map((line, i) => i === index ? { ...line, [field]: value } : line)); }

  async function createReceipt(event: FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      const res = await fetch("/api/admin/inventory/receipts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note, items: lines.map((line) => ({ ...line, quantity: Number(line.quantity) })) }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Không thể tạo phiếu nhập");
      setReceiptOpen(false); await loadInventory();
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể tạo phiếu nhập"); }
    finally { setSaving(false); }
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold text-on-surface font-headline">Quản lý kho</h1><p className="text-sm text-on-surface-variant mt-1">Theo dõi tồn kho, đặt ngưỡng cảnh báo và lập phiếu nhập hàng.</p></div><button onClick={() => { setLowStockOnly(false); setSearch(""); setLines([emptyLine()]); setNote(""); setReceiptOpen(true); }} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 shadow-sm"><span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>Tạo phiếu nhập kho</button></div>
    {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-surface rounded-2xl p-5 border border-outline-variant shadow-sm flex gap-4 items-center"><span className="material-symbols-outlined text-blue-600 bg-blue-100 rounded-xl p-3">inventory_2</span><div><p className="text-sm text-on-surface-variant">Tổng mã hàng</p><p className="text-2xl font-bold">{stats.totalProducts}</p></div></div>
      <button onClick={() => { setPage(1); setLowStockOnly((value) => !value); }} className={`text-left bg-surface rounded-2xl p-5 border shadow-sm flex gap-4 items-center ${lowStockOnly ? "border-rose-500 ring-1 ring-rose-300" : "border-outline-variant"}`}><span className="material-symbols-outlined text-rose-600 bg-rose-100 rounded-xl p-3">warning</span><div><p className="text-sm text-on-surface-variant">Tồn kho cần chú ý</p><p className="text-2xl font-bold text-rose-600">{stats.lowStockCount} mã</p></div></button>
      <div className="bg-surface rounded-2xl p-5 border border-outline-variant shadow-sm flex gap-4 items-center"><span className="material-symbols-outlined text-emerald-600 bg-emerald-100 rounded-xl p-3">receipt_long</span><div><p className="text-sm text-on-surface-variant">Phiếu nhập gần đây</p><p className="text-2xl font-bold">{receipts.length}</p></div></div>
    </div>
    <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden"><div className="p-4 border-b border-outline-variant flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full sm:max-w-sm"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc SKU..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:outline-none focus:border-primary" /></div>{lowStockOnly && <button onClick={() => setLowStockOnly(false)} className="text-sm font-medium text-primary">Hiện tất cả sản phẩm</button>}</div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="bg-surface-container-low text-xs uppercase text-outline"><th className="px-6 py-4">Sản phẩm / SKU</th><th className="px-6 py-4">Danh mục</th><th className="px-6 py-4">Tồn hiện tại</th><th className="px-6 py-4">Cảnh báo khi ≤</th><th className="px-6 py-4">Trạng thái</th><th className="px-6 py-4 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-outline-variant">
      {loading ? <tr><td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">Đang tải dữ liệu kho...</td></tr> : products.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">Không tìm thấy sản phẩm phù hợp.</td></tr> : products.map((product) => { const low = product.stock <= product.stockAlertThreshold; return <tr key={product.id} className={low ? "bg-rose-50/30" : "hover:bg-surface-container-low/60"}><td className="px-6 py-4"><p className="font-semibold text-on-surface">{product.name}</p><p className="text-xs text-outline font-mono mt-0.5">{product.sku}</p></td><td className="px-6 py-4 text-on-surface-variant">{product.category?.name || "—"}</td><td className={`px-6 py-4 font-bold text-lg ${low ? "text-rose-600" : "text-emerald-600"}`}>{product.stock}</td><td className="px-6 py-4">{product.stockAlertThreshold}</td><td className="px-6 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${low ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>{low ? "Cần nhập thêm" : "Đủ hàng"}</span></td><td className="px-6 py-4 text-right"><button onClick={() => { setThresholdProduct(product); setThreshold(product.stockAlertThreshold); }} className="font-semibold text-primary hover:underline">Đặt ngưỡng</button></td></tr>; })}
    </tbody></table></div><Pager page={page} totalPages={totalPages} onChange={setPage}/></div>
    <section className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden"><div className="px-6 py-4 border-b border-outline-variant"><h2 className="font-semibold text-on-surface">Lịch sử phiếu nhập gần đây</h2></div><div className="divide-y divide-outline-variant">{receipts.length === 0 ? <p className="p-6 text-sm text-on-surface-variant">Chưa có phiếu nhập kho nào.</p> : receipts.map((receipt) => <div key={receipt.id} className="px-6 py-4"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold">{receipt.receiptNumber}</p><p className="text-xs text-on-surface-variant mt-1">{new Date(receipt.createdAt).toLocaleString("vi-VN")}{receipt.note ? ` · ${receipt.note}` : ""}</p></div><span className="text-sm text-emerald-700 font-semibold">+{receipt.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</span></div><p className="text-xs text-on-surface-variant mt-2">{receipt.items.map((item) => `${item.product.sku} (+${item.quantity}: ${item.stockBefore} → ${item.stockAfter})`).join(" · ")}</p></div>)}</div><Pager page={receiptPage} totalPages={receiptTotalPages} onChange={setReceiptPage}/></section>
    {thresholdProduct && <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"><form onSubmit={saveThreshold} className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl space-y-5"><div><h2 className="text-lg font-bold">Đặt ngưỡng cảnh báo</h2><p className="text-sm text-on-surface-variant mt-1">{thresholdProduct.name}</p></div><label className="block text-sm font-medium">Cảnh báo khi tồn kho nhỏ hơn hoặc bằng<input required min="0" step="1" type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-outline-variant px-3 py-2.5" /></label><div className="flex justify-end gap-3"><button type="button" onClick={() => setThresholdProduct(null)} className="px-4 py-2 text-sm">Hủy</button><button disabled={saving} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Lưu ngưỡng</button></div></form></div>}
    {receiptOpen && <div className="fixed inset-0 z-50 bg-black/45 overflow-y-auto p-4"><form onSubmit={createReceipt} className="mx-auto my-6 w-full max-w-2xl rounded-2xl bg-surface p-6 shadow-xl space-y-5"><div><h2 className="text-lg font-bold">Tạo phiếu nhập kho</h2><p className="text-sm text-on-surface-variant mt-1">Tồn kho được cộng ngay khi lưu phiếu.</p></div><div className="space-y-3">{lines.map((line, index) => <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px_auto]"><select required value={line.productId} onChange={(e) => changeLine(index, "productId", e.target.value)} className="rounded-xl border border-outline-variant px-3 py-2.5 text-sm"><option value="">Chọn sản phẩm</option>{productOptions.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku}) — tồn {product.stock}</option>)}</select><input required min="1" step="1" type="number" value={line.quantity} onChange={(e) => changeLine(index, "quantity", Number(e.target.value))} className="rounded-xl border border-outline-variant px-3 py-2.5 text-sm" /><button type="button" disabled={lines.length === 1} onClick={() => setLines((current) => current.filter((_, i) => i !== index))} className="px-2 text-rose-600 disabled:opacity-40"><span className="material-symbols-outlined">delete</span></button></div>)}<button type="button" onClick={() => setLines((current) => [...current, emptyLine()])} className="text-sm font-semibold text-primary">+ Thêm sản phẩm</button></div><label className="block text-sm font-medium">Ghi chú<input value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="Ví dụ: Nhập đợt tháng 9" className="mt-2 w-full rounded-xl border border-outline-variant px-3 py-2.5 text-sm" /></label><div className="flex justify-end gap-3"><button type="button" onClick={() => setReceiptOpen(false)} className="px-4 py-2 text-sm">Hủy</button><button disabled={saving} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Đang lưu..." : "Lưu phiếu nhập"}</button></div></form></div>}
  </div>;
}
function Pager({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (value: number) => void }) { return <div className="flex justify-end gap-3 border-t border-outline-variant p-4 text-sm"><span>Trang {page}/{totalPages}</span><button disabled={page === 1} onClick={() => onChange(page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Trước</button><button disabled={page === totalPages} onClick={() => onChange(page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Sau</button></div>; }
