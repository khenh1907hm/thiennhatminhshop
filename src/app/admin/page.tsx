"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const stats = [
  { name: "Tổng doanh thu", value: "124,500,000 đ", trend: "+14.5%", isPositive: true, icon: "payments" },
  { name: "Đơn hàng mới", value: "354", trend: "+5.2%", isPositive: true, icon: "shopping_bag" },
  { name: "Khách hàng", value: "1,240", trend: "-2.1%", isPositive: false, icon: "group" },
  { name: "Lượt truy cập", value: "45,200", trend: "+24.5%", isPositive: true, icon: "visibility" },
];

const revenueData = [
  { name: "T2", revenue: 40000000 },
  { name: "T3", revenue: 30000000 },
  { name: "T4", revenue: 50000000 },
  { name: "T5", revenue: 27000000 },
  { name: "T6", revenue: 18000000 },
  { name: "T7", revenue: 23000000 },
  { name: "CN", revenue: 34000000 },
];

const recentOrders = [
  { id: "#ORD-001", customer: "Nguyễn Văn A", date: "Hôm nay, 10:24", amount: "1,250,000 đ", status: "Hoàn thành" },
  { id: "#ORD-002", customer: "Trần Thị B", date: "Hôm nay, 09:12", amount: "850,000 đ", status: "Đang xử lý" },
  { id: "#ORD-003", customer: "Lê Văn C", date: "Hôm qua, 15:45", amount: "2,100,000 đ", status: "Đang giao" },
  { id: "#ORD-004", customer: "Phạm Thị D", date: "Hôm qua, 11:30", amount: "450,000 đ", status: "Hoàn thành" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Tổng quan hệ thống</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Chào mừng trở lại! Dưới đây là thông tin chi tiết hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            30 ngày qua
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full ${
                stat.isPositive ? "text-emerald-700 bg-emerald-100" : "text-rose-700 bg-rose-100"
              }`}>
                <span className="material-symbols-outlined text-[16px]">
                  {stat.isPositive ? "trending_up" : "trending_down"}
                </span>
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-on-surface-variant">{stat.name}</p>
              <p className="text-2xl font-bold text-on-surface mt-1 font-headline">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-outline-variant shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-on-surface font-headline">Biểu đồ doanh thu</h2>
            <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
              <span className="material-symbols-outlined text-outline">more_vert</span>
            </button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  tickFormatter={(value) => `${(value / 1000000)}M`}
                  dx={-10}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} đ`, "Doanh thu"]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-on-surface font-headline">Đơn hàng gần đây</h2>
            <button className="text-sm font-medium text-primary hover:underline">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors group cursor-pointer border border-transparent hover:border-outline-variant">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-medium">
                    {order.customer.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{order.customer}</p>
                    <p className="text-xs text-on-surface-variant">{order.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-on-surface">{order.amount}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                    order.status === "Hoàn thành" ? "bg-emerald-100 text-emerald-800" :
                    order.status === "Đang xử lý" ? "bg-amber-100 text-amber-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
