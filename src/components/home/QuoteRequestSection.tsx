"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";
import ProductPickerDialog, {
  type PickerProduct,
} from "@/components/home/ProductPickerDialog";

type SelectedProduct = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
};

type Props = {
  variant?: "home" | "formOnly";
  sourceLabel?: string;
};

export default function QuoteRequestSection({
  variant = "home",
  sourceLabel = "Yêu cầu báo giá từ trang chủ",
}: Props) {
  const { showNotification } = useNotification();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateQty = (id: string, quantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: Math.max(1, quantity || 1) } : p
      )
    );
  };

  const removeProduct = (id: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleConfirmProducts = (products: PickerProduct[]) => {
    setSelectedProducts((prev) => {
      const qtyMap = new Map(prev.map((p) => [p.id, p.quantity]));
      return products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        quantity: qtyMap.get(p.id) || 1,
      }));
    });
  };

  const downloadTemplate = () => {
    const csv = "Ten_hoac_SKU,So_luong\nSKU-001,10\nCong tac ABB,5\n";
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-bao-gia.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProducts.length === 0 && !excelFile) {
      showNotification("Chọn sản phẩm hoặc tải file Excel", "error");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("phone", form.phone.trim());
      fd.append("email", form.email.trim());
      fd.append("source", sourceLabel);
      fd.append(
        "items",
        JSON.stringify(
          selectedProducts.map((p) => ({
            productId: p.id,
            nameOrSku: p.sku || p.name,
            quantity: p.quantity,
          }))
        )
      );
      if (excelFile) fd.append("excel", excelFile);

      const res = await fetch("/api/quotes", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gửi yêu cầu thất bại");
      }

      showNotification("Đã gửi yêu cầu báo giá. Chúng tôi sẽ liên hệ sớm!", "success");
      setForm({ name: "", phone: "", email: "" });
      setSelectedProducts([]);
      setExcelFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Không thể gửi yêu cầu";
      showNotification(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formCard = (
    <form
      onSubmit={handleSubmit}
      className={`rounded-[1.75rem] p-5 sm:p-6 space-y-4 ${
        variant === "formOnly"
          ? "bg-[#bfdbfe94] border border-outline-variant shadow-sm"
          : "bg-[#bfdbfe94] backdrop-blur-2xl border border-white/70 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)]"
      }`}
    >
      <div className="space-y-1 mb-1">
        <h3 className="text-xl font-bold text-slate-900 font-headline">
          Yêu cầu báo giá
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Chọn nhiều sản phẩm hoặc tải file Excel theo mẫu.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
          Họ và tên
        </label>
        <input
          required
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nhập họ và tên"
          className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-slate-200/80
            text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40
            placeholder:text-slate-400 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Số điện thoại
          </label>
          <input
            required
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="Số điện thoại"
            className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-slate-200/80
              text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40
              placeholder:text-slate-400 shadow-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Email
          </label>
          <input
            required
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email liên hệ"
            className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-slate-200/80
              text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40
              placeholder:text-slate-400 shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
          Sản phẩm
        </label>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-slate-200/80
            text-left text-sm shadow-sm hover:border-primary/40 hover:bg-white
            focus:ring-2 focus:ring-primary/25 outline-none transition-all
            flex items-center gap-3"
        >
          <span className="material-symbols-outlined text-primary text-[22px] shrink-0">
            inventory_2
          </span>
          <span className="min-w-0 flex-1 text-slate-500">
            {selectedProducts.length > 0
              ? `Đã chọn ${selectedProducts.length} sản phẩm — bấm để sửa`
              : "Chọn một hoặc nhiều sản phẩm..."}
          </span>
          <span className="material-symbols-outlined text-slate-400 text-[20px] shrink-0">
            unfold_more
          </span>
        </button>

        {selectedProducts.length > 0 && (
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {selectedProducts.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-500">SKU: {p.sku}</p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={p.quantity}
                  onChange={(e) => updateQty(p.id, parseInt(e.target.value, 10))}
                  className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-center text-xs font-bold outline-none focus:border-primary"
                  title="Số lượng"
                />
                <button
                  type="button"
                  onClick={() => removeProduct(p.id)}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
          File Excel (tuỳ chọn)
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 border border-slate-200/80 text-sm font-medium cursor-pointer hover:border-primary/40">
            <span className="material-symbols-outlined text-[18px] text-primary">
              upload_file
            </span>
            {excelFile ? excelFile.name : "Tải file Excel lên"}
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
            />
          </label>
          {excelFile && (
            <button
              type="button"
              onClick={() => {
                setExcelFile(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="text-xs text-red-500 font-semibold hover:underline"
            >
              Xóa file
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Template file: gồm{" "}
          <span className="font-semibold text-slate-700">1 cột tên hoặc mã SKU</span> và{" "}
          <span className="font-semibold text-slate-700">1 cột số lượng</span>.{" "}
          <button
            type="button"
            onClick={downloadTemplate}
            className="text-primary font-bold hover:underline"
          >
            Tải mẫu CSV
          </button>
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-sm
          hover:bg-primary/90 disabled:opacity-60 active:scale-[0.99]
          transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[18px]">
              autorenew
            </span>
            Đang gửi...
          </>
        ) : (
          <>
            Gửi yêu cầu
            <span className="material-symbols-outlined text-[18px]">send</span>
          </>
        )}
      </button>
    </form>
  );

  return (
    <>
      {variant === "formOnly" ? (
        formCard
      ) : (
        <section className="w-[85%] mx-auto pb-10 md:pb-14">
          <div
            className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem]
            border border-blue-200/70
            shadow-[0_24px_60px_-24px_rgba(37,99,235,0.45)]
            bg-gradient-to-br from-[#eff6ff] via-[#dbeafe] to-[#bfdbfe]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[#ffffff]" />
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 p-6 sm:p-8 lg:p-10 items-center">
              <div className="lg:col-span-6 xl:col-span-7 text-on-surface space-y-5 max-w-xl text-center lg:text-left mx-auto lg:mx-0 flex flex-col items-center lg:items-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {/* <img
                  src="/images/logo.png"
                  alt="Logo Thiên Nhật Minh"
                  className="h-12 sm:h-14 w-auto object-contain"
                /> */}
                <h2
                  className="heading-dual text-3xl sm:text-4xl font-bold font-headline leading-tight tracking-tight"
                  data-en=" Distributor"
                >
                  <span className="drop-shadow-sm">Nhà phân phối chính hãng</span>
                </h2>
                <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  Đơn vị cung cấp giải pháp thiết bị điện công nghiệp hàng đầu khu vực.
                  Phân phối chính hãng Schneider Electric, Siemens, Omron và nhiều thương
                  hiệu uy tín — tư vấn kỹ thuật và báo giá nhanh chóng.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl
                  bg-primary text-on-primary font-bold text-sm
                  hover:bg-primary/90 active:scale-[0.98] transition-all
                  shadow-lg shadow-primary/20"
                >
                  Tìm hiểu thêm
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </Link>
              </div>
              <div className="lg:col-span-6 xl:col-span-5">{formCard}</div>
            </div>
          </div>
        </section>
      )}

      <ProductPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initialSelected={selectedProducts}
        onConfirm={handleConfirmProducts}
      />
    </>
  );
}
