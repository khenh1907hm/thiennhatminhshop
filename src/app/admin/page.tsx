"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DashboardData = {
  monthlyRevenue: number; newOrders: number; customerCount: number; quoteCount: number;
  chart: Array<{ name: string; revenue: number }>;
  lowStockProducts: Array<{ id: string; name: string; sku: string; stock: number; stockAlertThreshold: number }>;
  recentOrders: Array<{ id: string; orderNumber: string; customerName: string; totalAmount: string | number; status: string; createdAt: string }>;
  recentQuotes: Array<{ id: string; name: string; email: string; status: string; createdAt: string; _count: { items: number } }>;
};

const currency = (value: number | string) => `${Number(value).toLocaleString("vi-VN")} đ`;

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { fetch("/api/admin/dashboard").then(async (res) => { const body = await res.json(); if (!res.ok) throw new Error(body.error); setData(body); }).catch((err) => setError(err.message || "Không thể tải Dashboard")); }, []);
  if (error) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>;
  if (!data) return <div className="py-16 text-center text-on-surface-variant">Đang tải Dashboard...</div>;

  const cards = [
    ["Doanh thu tháng", currency(data.monthlyRevenue), "payments", "text-emerald-600 bg-emerald-100"],
    ["Đơn hàng mới", data.newOrders, "shopping_bag", "text-blue-600 bg-blue-100"],
    ["Khách hàng", data.customerCount, "group", "text-violet-600 bg-violet-100"],
    ["Sản phẩm sắp hết", data.lowStockProducts.length, "warning", "text-rose-600 bg-rose-100"],
    ["Báo giá cần xử lý", data.quoteCount, "request_quote", "text-amber-600 bg-amber-100"],
  ];

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-on-surface font-headline">Dashboard</h1><p className="mt-1 text-sm text-on-surface-variant">Tổng quan vận hành cửa hàng theo dữ liệu hiện tại.</p></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([label, value, icon, color]) => <div key={String(label)} className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm"><div className={`inline-flex rounded-xl p-3 ${color}`}><span className="material-symbols-outlined">{icon}</span></div><p className="mt-4 text-sm text-on-surface-variant">{label}</p><p className="mt-1 text-2xl font-bold text-on-surface">{value}</p></div>)}</div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3"><section className="xl:col-span-2 rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm"><h2 className="font-semibold text-on-surface">Biểu đồ doanh thu 6 tháng</h2><div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.chart}><CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis tickFormatter={(value) => `${value / 1000000}M`}/><Tooltip formatter={(value) => currency(Number(value))}/><Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3}/></LineChart></ResponsiveContainer></div></section><section className="rounded-2xl border border-outline-variant bg-surface shadow-sm overflow-hidden"><div className="flex items-center justify-between border-b border-outline-variant px-5 py-4"><h2 className="font-semibold text-on-surface">Đơn hàng mới</h2><Link href="/admin/orders" className="text-sm font-medium text-primary">Xem tất cả</Link></div><div className="divide-y divide-outline-variant">{data.recentOrders.length === 0 ? <p className="p-5 text-sm text-on-surface-variant">Chưa có đơn hàng.</p> : data.recentOrders.map((order) => <div key={order.id} className="p-4"><div className="flex justify-between gap-3"><div><p className="font-medium">{order.customerName}</p><p className="text-xs text-on-surface-variant">{order.orderNumber}</p></div><p className="font-semibold">{currency(order.totalAmount)}</p></div><p className="mt-1 text-xs text-on-surface-variant">{new Date(order.createdAt).toLocaleString("vi-VN")} · {order.status}</p></div>)}</div></section></div>
    <section className="rounded-2xl border border-outline-variant bg-surface shadow-sm overflow-hidden"><div className="flex items-center justify-between border-b border-outline-variant px-6 py-4"><h2 className="font-semibold text-on-surface">Yêu cầu báo giá gần đây</h2><Link href="/admin/quotes" className="text-sm font-medium text-primary">Quản lý báo giá</Link></div><div className="divide-y divide-outline-variant">{data.recentQuotes.length === 0 ? <p className="p-6 text-sm text-on-surface-variant">Chưa có yêu cầu báo giá.</p> : data.recentQuotes.map((quote) => <div key={quote.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"><div><p className="font-medium">{quote.name}</p><p className="text-xs text-on-surface-variant">{quote.email} · {quote._count.items} sản phẩm</p></div><div className="text-right"><p className="text-xs font-semibold text-amber-700">{quote.status}</p><p className="text-xs text-on-surface-variant">{new Date(quote.createdAt).toLocaleString("vi-VN")}</p></div></div>)}</div></section>
    <section className="rounded-2xl border border-outline-variant bg-surface shadow-sm overflow-hidden"><div className="flex items-center justify-between border-b border-outline-variant px-6 py-4"><h2 className="font-semibold text-on-surface">Sản phẩm sắp hết hàng</h2><Link href="/admin/inventory" className="text-sm font-medium text-primary">Quản lý kho</Link></div><div className="divide-y divide-outline-variant">{data.lowStockProducts.length === 0 ? <p className="p-6 text-sm text-emerald-700">Tất cả sản phẩm đang đủ tồn kho.</p> : data.lowStockProducts.map((product) => <div key={product.id} className="flex items-center justify-between gap-4 px-6 py-4"><div><p className="font-medium">{product.name}</p><p className="text-xs text-on-surface-variant">{product.sku}</p></div><p className="text-sm font-semibold text-rose-600">Còn {product.stock} / ngưỡng {product.stockAlertThreshold}</p></div>)}</div></section>
  </div>;
}
