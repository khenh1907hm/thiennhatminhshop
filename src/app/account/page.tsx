"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses">("orders");

  const userProfile = {
    name: "Nguyễn Văn An",
    email: "nguyenvanan@gmail.com",
    phone: "0908 123 456",
    address: "Số 123 Nguyễn Văn Cừ, Phường 2, Quận 5, TP. HCM",
    joinedDate: "15/01/2026",
    memberLevel: "Thành viên Vàng"
  };

  const userOrders = [
    {
      id: "ORD-9842",
      date: "05/08/2026",
      status: "Chờ xác nhận",
      total: 38500000,
      items: [
        { name: "Biến tần Dynamic Hybrid 10kW", qty: 1, price: 24500000 },
        { name: "Pin lưu trữ Lithium 5kWh", qty: 1, price: 14000000 }
      ]
    },
    {
      id: "ORD-8810",
      date: "20/06/2026",
      status: "Hoàn thành",
      total: 5200000,
      items: [
        { name: "Tấm pin năng lượng mặt trời EcoSolar 550W", qty: 1, price: 5200000 }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-8 py-6 w-full flex-grow flex flex-col gap-4">
        {/* User Card Header (White Card) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-200">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center font-bold text-2xl">
              <span className="material-symbols-outlined text-4xl">face</span>
            </div>
            <div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-slate-800">{userProfile.name}</h1>
                <span className="text-xs text-slate-500 mt-1">{userProfile.phone}</span>
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px h-16 bg-slate-200"></div>

          <div className="flex flex-col items-center justify-center flex-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <span className="material-symbols-outlined">shopping_cart</span>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-800">{userOrders.length}</p>
                <p className="text-xs text-slate-500">Tổng số đơn hàng đã mua</p>
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px h-16 bg-slate-200"></div>

          <div className="flex flex-col items-center justify-center flex-1 text-center">
             <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <span className="material-symbols-outlined">wallet</span>
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-blue-600">3.096.000đ</p>
                  <p className="text-xs text-slate-500">Tổng tiền tích luỹ</p>
                </div>
             </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mt-2">
          {/* Navigation Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm space-y-1">
               <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${
                  activeTab === "profile"
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${
                  activeTab === "orders"
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                Lịch sử mua hàng
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${
                  activeTab === "addresses"
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">shield</span>
                Tra cứu bảo hành
              </button>
            </div>
          </aside>

          {/* Main Tab Content */}
          <div className="md:col-span-3 space-y-4">
            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Lịch sử mua hàng</h2>
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div key={order.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div>
                          <span className="font-semibold text-slate-800">#{order.id}</span>
                          <span className="text-xs text-slate-500 ml-3">{order.date}</span>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          order.status === "Hoàn thành" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-2 flex justify-between items-center text-sm">
                            <div>
                              <p className="font-medium text-slate-800">{item.name}</p>
                              <p className="text-xs text-slate-500">x{item.qty}</p>
                            </div>
                            <span className="font-semibold text-slate-800">
                              {(item.price * item.qty).toLocaleString("vi-VN")} đ
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex justify-end gap-4 items-center">
                        <span className="text-sm text-slate-500">Tổng tiền:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {order.total.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-4">
                  <h2 className="text-lg font-bold text-slate-800 mb-4">Hỗ trợ</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                         <span className="material-symbols-outlined text-2xl">support_agent</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">Tư vấn mua hàng (7h30 - 22h00)</p>
                        <p className="text-xs text-slate-500 mt-1">1800.2097</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                         <span className="material-symbols-outlined text-2xl">report_problem</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">Khiếu nại (8h00 - 21h30)</p>
                        <p className="text-xs text-slate-500 mt-1">1800.2063</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                   <h2 className="text-lg font-bold text-slate-800 mb-4">Thông tin tài khoản</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và tên</label>
                      <input type="text" defaultValue={userProfile.name} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Số điện thoại</label>
                      <input type="text" defaultValue={userProfile.phone} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                      <input type="email" defaultValue={userProfile.email} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <button className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm">
                    Cập nhật thông tin
                  </button>
                </div>
              </>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-lg font-bold text-slate-800">Tra cứu bảo hành</h2>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-sm text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300">verified</span>
                  <p className="text-slate-600">Bạn chưa có sản phẩm nào đang bảo hành.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
