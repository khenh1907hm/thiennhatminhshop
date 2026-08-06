"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  const navLinks = [
    { name: "LIÊN HỆ", href: "/contact" },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname.startsWith("/product");
    }
    return pathname === href;
  };

  return (
    <header className="bg-surface/80 sticky top-0 z-50 backdrop-blur-md border-b border-outline-variant">
      <div className="flex flex-col w-full px-8 py-4 max-w-screen-2xl mx-auto">
        {/* Top Row: Links and Branding */}
        <div className="flex justify-between items-center pb-2 gap-4">
           <Link href="/" className="text-xl font-black tracking-tight text-on-surface font-headline hover:text-primary transition-colors duration-200 flex items-center gap-2 whitespace-nowrap shrink-0">
            <span className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center text-sm font-bold shadow-md shadow-primary/20">TN</span>
            THIÊN NHẬT MINH ECO
          </Link>
          
          {/* Middle: Expanded Search Bar */}
          <div className="hidden sm:flex flex-1 max-w-2xl mx-4 lg:mx-8">
             <div className="relative w-full flex items-center bg-white border-2 border-primary px-4 py-1.5 rounded-full focus-within:ring-4 focus-within:ring-primary/20 transition-all duration-300 shadow-sm hover:shadow-md">
               <span className="material-symbols-outlined text-primary text-xl select-none mr-1">search</span>
               <input
                 className="bg-transparent border-none focus:ring-0 text-sm w-full pl-2 outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                 placeholder="Bạn muốn tìm gì hôm nay?"
                 type="text"
               />
               <button className="bg-primary text-white rounded-full px-5 py-2 ml-2 text-sm font-bold hover:bg-primary/90 transition-colors shrink-0 shadow-sm">
                 Tìm kiếm
               </button>
             </div>
          </div>

          {/* Right: Nav Links and Actions */}
          <div className="flex items-center gap-3 lg:gap-4 text-on-surface shrink-0">
            {/* Phone Info */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">call</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] text-slate-500 font-semibold leading-none mb-1">Hotline</span>
                 <a href="tel:+84983449446" className="text-sm font-bold text-slate-800 hover:text-primary transition-colors leading-none">+84 983 449 446</a>
              </div>
            </div>

            {/* Map Info */}
            <div className="hidden xl:flex items-center gap-2 max-w-[200px]">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-lg">location_on</span>
              </div>
              <div className="flex flex-col overflow-hidden">
                 <span className="text-[10px] text-slate-500 font-semibold leading-none mb-1">Địa chỉ</span>
                 <a href="https://maps.app.goo.gl/317Scp3d6KATsDm8A" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-800 hover:text-primary transition-colors truncate leading-tight" title="75 Nguyễn Cửu Đàm, Phường Tân Sơn Nhì, TP. Hồ Chí Minh">
                   75 Nguyễn Cửu Đàm...
                 </a>
              </div>
            </div>

            <nav className="hidden md:flex items-center mx-2">
              {navLinks.map((link, idx) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={idx}
                    href={link.href}
                    className={`text-xs font-bold transition-all duration-300 uppercase tracking-widest relative py-1.5 ${
                      active
                        ? "text-primary"
                        : "text-slate-600 hover:text-primary"
                    }`}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-primary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
            
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

            <Link href="/wishlist" className="relative cursor-pointer hover:bg-slate-100 transition-all duration-300 p-2 rounded-full flex items-center justify-center text-slate-700 hover:text-red-500">
              <span className="material-symbols-outlined text-2xl">favorite</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-bounce flex items-center justify-center min-w-[18px] h-[18px] border border-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative cursor-pointer hover:bg-slate-100 transition-all duration-300 p-2 rounded-full flex items-center justify-center text-slate-700 hover:text-primary">
              <span className="material-symbols-outlined text-2xl">shopping_cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-bounce flex items-center justify-center min-w-[18px] h-[18px] border border-white">
                  {itemCount}
                </span>
              )}
            </Link>
            
            <div className="relative group">
              <Link href="/account" className="cursor-pointer hover:bg-slate-100 transition-all duration-300 p-2 rounded-full scale-98 flex items-center justify-center border border-transparent hover:border-slate-200 shadow-sm text-slate-700 hover:text-primary">
                <span className="material-symbols-outlined text-2xl">person</span>
              </Link>
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-50">
                <div className="p-2 flex flex-col gap-1">
                  <Link href="/account" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                    Tài khoản của tôi
                  </Link>
                  <Link href="/account?tab=orders" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                    Đơn hàng
                  </Link>
                  <div className="h-px bg-slate-200 my-1"></div>
                  <Link href="/login" className="block px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    Đăng xuất
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden mt-2">
          <div className="relative w-full">
            <input
              className="w-full bg-surface-container-high/50 border border-outline-variant/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-surface-tint focus:bg-white transition-all text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Tìm kiếm sản phẩm..."
              type="text"
            />
            <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline">search</span>
          </div>
        </div>
      </div>
    </header>
  );
}
