"use client";

import { useState } from "react";
import Link from "next/link";

const mockCustomers = [
  { id: "CUS-001", name: "Nguyễn Văn A", email: "nguyenvana@gmail.com", phone: "0909123456", role: "Quản trị viên", status: "Hoạt động", orders: 12 },
  { id: "CUS-002", name: "Trần Thị B", email: "tranthib@company.vn", phone: "0988765432", role: "Khách hàng", status: "Hoạt động", orders: 3 },
  { id: "CUS-003", name: "Lê Văn C", email: "levanc.corp@gmail.com", phone: "0912345678", role: "Nhân viên kho", status: "Hoạt động", orders: 0 },
  { id: "CUS-004", name: "Phạm Thị D", email: "phamthid@yahoo.com", phone: "0933445566", role: "Khách hàng", status: "Bị khóa", orders: 1 },
];

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || customer.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Quản lý Khách hàng & Phân quyền</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Quản lý tài khoản, phân quyền nhân viên và lịch sử hoạt động.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 active:scale-98">
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Thêm người dùng
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-surface rounded-2xl p-4 border border-outline-variant shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo Tên hoặc Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="Khách hàng">Khách hàng</option>
            <option value="Quản trị viên">Quản trị viên (Admin)</option>
            <option value="Nhân viên kho">Nhân viên kho</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-outline uppercase tracking-wider">
                <th className="px-6 py-4">Tài khoản</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Số đơn</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-surface-container-low/60 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">{customer.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          customer.status === "Hoạt động" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {customer.status}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-on-surface font-medium">{customer.email}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{customer.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                      customer.role === "Quản trị viên" ? "bg-purple-100 text-purple-800 border border-purple-200" :
                      customer.role === "Nhân viên kho" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                      "bg-surface-container-high text-on-surface border border-outline-variant"
                    }`}>
                      {customer.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant font-medium">
                    {customer.orders}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Chỉnh sửa quyền">
                        <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                      </button>
                      <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-colors" title="Khóa tài khoản">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
