"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/formatPrice";

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type Order = {
  id: string;
  orderNumber: string;
  totalAmount: number | string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems: Array<{ id: string; quantity: number; price: number | string; product: { id: string; name: string; images: string[] } | null }>;
};

const statusSteps = [
  { key: "PENDING", label: "Chờ xác nhận", icon: "pending_actions" },
  { key: "PROCESSING", label: "Đang xử lý", icon: "inventory_2" },
  { key: "SHIPPED", label: "Đang giao hàng", icon: "local_shipping" },
  { key: "DELIVERED", label: "Đã giao hàng", icon: "check_circle" },
] as const;

const statusLabels: Record<OrderStatus, string> = { PENDING: "Chờ xác nhận", PROCESSING: "Đang xử lý", SHIPPED: "Đang giao hàng", DELIVERED: "Đã giao hàng", CANCELLED: "Đã hủy" };

function formatDate(value: string) {
  return new Date(value).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function statusStyle(status: OrderStatus) {
  if (status === "DELIVERED") return "bg-emerald-100 text-emerald-700";
  if (status === "CANCELLED") return "bg-rose-100 text-rose-700";
  if (status === "SHIPPED") return "bg-indigo-100 text-indigo-700";
  return "bg-amber-100 text-amber-700";
}

function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") return <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><span className="material-symbols-outlined">cancel</span>Đơn hàng đã được hủy.</div>;
  const currentIndex = statusSteps.findIndex((step) => step.key === status);
  return <div className="grid grid-cols-4 gap-2">{statusSteps.map((step, index) => <div key={step.key} className="relative text-center"><div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${index <= currentIndex ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}><span className="material-symbols-outlined text-[18px]">{step.icon}</span></div><p className={`mt-2 text-[11px] font-semibold ${index <= currentIndex ? "text-primary" : "text-slate-400"}`}>{step.label}</p>{index < statusSteps.length - 1 && <div className={`absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-4 h-0.5 ${index < currentIndex ? "bg-primary" : "bg-slate-200"}`} />}</div>)}</div>;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/user/orders")
      .then(async (response) => { if (!response.ok) throw new Error("Không thể tải lịch sử đơn hàng"); return response.json(); })
      .then((data: Order[]) => { const nextOrders = Array.isArray(data) ? data : []; setOrders(nextOrders); setOpenOrderId(nextOrders[0]?.id || null); })
      .catch((fetchError) => setError(fetchError instanceof Error ? fetchError.message : "Không thể tải lịch sử đơn hàng"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rounded-2xl bg-white p-12 text-center shadow-sm"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>;
  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>;
  if (orders.length === 0) return <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm"><span className="material-symbols-outlined text-5xl text-slate-300">receipt_long</span><h2 className="mt-4 text-lg font-bold text-slate-800">Bạn chưa có đơn hàng nào</h2><p className="mt-2 text-sm text-slate-500">Các đơn hàng sau khi đăng nhập sẽ được lưu và hiển thị tại đây.</p></div>;

  return <div className="space-y-4">{orders.map((order) => {
    const expanded = openOrderId === order.id;
    return <article key={order.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button onClick={() => setOpenOrderId(expanded ? null : order.id)} className="flex w-full flex-wrap items-center justify-between gap-4 p-5 text-left hover:bg-slate-50">
        <div><p className="font-bold text-blue-600">#{order.orderNumber}</p><p className="mt-1 text-xs text-slate-500">Đặt lúc {formatDate(order.createdAt)} · {order.orderItems.length} sản phẩm</p></div>
        <div className="flex items-center gap-4"><div className="text-right"><p className="text-xs text-slate-500">Tổng tiền</p><p className="font-bold text-slate-800">{formatPrice(order.totalAmount)}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle(order.status)}`}>{statusLabels[order.status]}</span><span className="material-symbols-outlined text-slate-500">{expanded ? "expand_less" : "expand_more"}</span></div>
      </button>
      {expanded && <div className="space-y-6 border-t border-slate-200 p-5"><OrderProgress status={order.status} /><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Thanh toán</p><p className="mt-2 text-sm font-semibold text-slate-800">{order.paymentMethod === "qr" ? "QR Bank chưa tích hợp" : order.paymentStatus === "PAID" ? "COD - Đã thanh toán" : "COD - Chưa thanh toán"}</p><p className="mt-1 text-xs text-slate-500">Trạng thái: {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Giao hàng</p><p className="mt-2 text-sm font-semibold text-slate-800">{statusLabels[order.status]}</p><p className="mt-1 text-xs text-slate-500">Cập nhật: {formatDate(order.updatedAt)}</p></div></div><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Địa chỉ nhận hàng</p><p className="mt-2 text-sm text-slate-800">{order.shippingAddress || "Chưa có địa chỉ"}</p>{order.note && <p className="mt-2 text-xs text-slate-500">Ghi chú: {order.note}</p>}</div><div><p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Sản phẩm</p><div className="divide-y divide-slate-200 rounded-xl border border-slate-200">{order.orderItems.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 p-3"><div className="flex min-w-0 items-center gap-3">{item.product?.images?.[0] ? <Image src={item.product.images[0]} alt="" width={48} height={48} className="h-12 w-12 rounded-lg object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100"><span className="material-symbols-outlined text-slate-400">inventory_2</span></div>}<div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{item.product?.name || "Sản phẩm"}</p><p className="mt-1 text-xs text-slate-500">Số lượng: {item.quantity}</p></div></div><p className="shrink-0 text-sm font-semibold text-slate-800">{formatPrice(Number(item.price) * item.quantity)}</p></div>)}</div></div></div>}
    </article>;
  })}</div>;
}
