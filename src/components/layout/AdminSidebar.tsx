"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Tổng quan", href: "/admin", icon: "dashboard" },
    { name: "Sản phẩm", href: "/admin/products", icon: "inventory_2" },
    { name: "Danh mục & Hãng", href: "/admin/categories", icon: "category" },
    { name: "Quản lý Kho", href: "/admin/inventory", icon: "warehouse" },
    { name: "Đơn hàng", href: "/admin/orders", icon: "shopping_cart" },
    { name: "Khách hàng", href: "/admin/customers", icon: "people" },
    { name: "Tin nhắn", href: "/admin/messages", icon: "chat" },
    { name: "Đánh giá", href: "/admin/reviews", icon: "reviews" },
    { name: "Khuyến mãi", href: "/admin/promotions", icon: "local_offer" },
    { name: "Vận chuyển", href: "/admin/shipping", icon: "local_shipping" },
    { name: "Phân tích", href: "/admin/analytics", icon: "analytics" },
    { name: "Cài đặt", href: "/admin/settings", icon: "settings" },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 text-slate-100 hidden md:flex flex-col z-20 shadow-xl">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center font-bold font-headline shadow-md shadow-cyan-500/20">
            TM
          </div>
          <div>
            <span className="text-base font-headline font-bold tracking-tight text-white block">
              Thiên Nhật Minh
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 block -mt-1">
              Admin Portal
            </span>
          </div>
        </Link>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 gap-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
          Quản lý hệ thống
        </div>
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}`));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-md shadow-blue-500/25"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-white" : "text-slate-400 group-hover:text-cyan-400"}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <Link href="/" className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors duration-200 text-sm font-medium">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Về trang chủ Web</span>
        </Link>
      </div>
    </aside>
  );
}
