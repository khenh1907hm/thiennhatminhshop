"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavChild = { name: string; href: string; icon: string };
type NavItem =
  | { name: string; href: string; icon: string; children?: undefined }
  | { name: string; href: string; icon: string; children: NavChild[] };

const navigation: NavItem[] = [
  { name: "Tổng quan", href: "/admin", icon: "dashboard" },
  {
    name: "Sản phẩm",
    href: "/admin/products",
    icon: "inventory_2",
    children: [
      { name: "Quản lý danh mục", href: "/admin/categories", icon: "category" },
      { name: "Quản lý thương hiệu", href: "/admin/brands", icon: "verified" },
      { name: "Quản lý Tài liệu", href: "/admin/documents", icon: "description" },
      { name: "Quản lý khuyến mãi", href: "/admin/promotions", icon: "local_offer" },
    ],
  },
  { name: "Tin tức", href: "/admin/news", icon: "newspaper" },
  { name: "Quản lý Kho", href: "/admin/inventory", icon: "warehouse" },
  { name: "Đơn hàng", href: "/admin/orders", icon: "shopping_cart" },
  { name: "Yêu cầu báo giá", href: "/admin/quotes", icon: "request_quote" },
  { name: "Khách hàng", href: "/admin/customers", icon: "people" },
  { name: "Cài đặt", href: "/admin/settings", icon: "settings" },
  { name: "Popup", href: "/admin/popup", icon: "web_asset" },
];

function isPathActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const productChildActive = navigation
    .find((i) => i.children)
    ?.children?.some((c) => isPathActive(pathname, c.href));
  const productSectionOpen =
    isPathActive(pathname, "/admin/products") || !!productChildActive;

  const [productsOpen, setProductsOpen] = useState(true);

  useEffect(() => {
    if (productSectionOpen) setProductsOpen(true);
  }, [productSectionOpen]);

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
            if (item.children) {
              const parentActive = isPathActive(pathname, item.href);
              return (
                <div key={item.name} className="space-y-0.5">
                  <div
                    className={`flex items-center rounded-xl transition-all duration-200 text-sm font-medium ${
                      parentActive || productChildActive
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-md shadow-blue-500/25"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <Link
                      href={item.href}
                      className="flex flex-1 items-center gap-3 px-3.5 py-2.5 min-w-0"
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          parentActive || productChildActive
                            ? "text-white"
                            : "text-slate-400"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.name}</span>
                    </Link>
                    <button
                      type="button"
                      aria-label="Mở mục con"
                      onClick={() => setProductsOpen((o) => !o)}
                      className="px-2.5 py-2.5 rounded-r-xl hover:bg-black/10"
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] transition-transform ${
                          productsOpen ? "rotate-180" : ""
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                  </div>

                  {productsOpen && (
                    <div className="ml-3 pl-3 border-l border-slate-700 space-y-0.5 py-1">
                      {item.children.map((child) => {
                        const childActive = isPathActive(pathname, child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                              childActive
                                ? "bg-slate-800 text-cyan-300"
                                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {child.icon}
                            </span>
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = isPathActive(pathname, item.href);
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
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-cyan-400"
                  }`}
                >
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <Link
          href="/"
          className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors duration-200 text-sm font-medium"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Về trang chủ Web</span>
        </Link>
      </div>
    </aside>
  );
}
