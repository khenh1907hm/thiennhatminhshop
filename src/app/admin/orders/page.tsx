"use client";

import { useState } from "react";
import Link from "next/link";

const mockOrders = [
  { id: "ORD-2023-1001", customer: "Nguyễn Văn A", company: "Công ty TNHH ABC", date: "2023-10-15 10:24", amount: "12,500,000 đ", status: "Hoàn thành", items: 3 },
  { id: "ORD-2023-1002", customer: "Trần Thị B", company: "Cửa hàng Thiết bị điện B", date: "2023-10-15 09:12", amount: "850,000 đ", status: "Đang xử lý", items: 1 },
  { id: "ORD-2023-1003", customer: "Lê Văn C", company: "Khu Công Nghiệp X", date: "2023-10-14 15:45", amount: "42,100,000 đ", status: "Đang giao", items: 12 },
  { id: "ORD-2023-1004", customer: "Phạm Thị D", company: "-", date: "2023-10-14 11:30", amount: "4,450,000 đ", status: "Hoàn thành", items: 2 },
  { id: "ORD-2023-1005", customer: "Hoàng Minh", company: "TNM Eco", date: "2023-10-13 14:20", amount: "1,200,000 đ", status: "Đã hủy", items: 1 },
];

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hoàn thành": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Đang xử lý": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Đang giao": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Đã hủy": return "bg-rose-100 text-rose-800 border-rose-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Quản lý Đơn hàng</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Theo dõi, xử lý và cập nhật trạng thái các đơn đặt hàng.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 active:scale-98">
          <span className="material-symbols-outlined text-[20px]">download</span>
          Xuất file Excel
        </button>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="bg-surface rounded-2xl p-4 border border-outline-variant shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo Mã ĐH, Tên KH, Công ty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-outline uppercase tracking-wider">
                <th className="px-6 py-4">Mã Đơn</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Ngày đặt</th>
                <th className="px-6 py-4">SL / Tổng tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low/60 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-primary font-mono">{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-on-surface">{order.customer}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{order.company}</p>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {order.date}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-on-surface">{order.amount}</p>
                    <p className="text-xs text-on-surface-variant">{order.items} sản phẩm</p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={() => {}}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${getStatusColor(order.status)}`}
                    >
                      <option value="Đang xử lý">Đang xử lý</option>
                      <option value="Đang giao">Đang giao</option>
                      <option value="Hoàn thành">Hoàn thành</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="In hóa đơn"
                      >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 text-outline">inbox</span>
                    <p>Không tìm thấy đơn hàng nào phù hợp.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
