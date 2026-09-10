"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSession, signOut } from "next-auth/react";
import { Suspense, useState, useEffect, useRef } from "react";

interface CategoryChild {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface CategoryWithChildren {
  id: string;
  name: string;
  slug: string;
  children: CategoryChild[];
  _count: { products: number };
}

const popularSearches = [
  "Máy biến áp",
  "Contactor",
  "Aptomat",
  "Relay nhiệt",
  "Tủ điện",
  "Inverter",
];

const navMenuItems = [
  { name: "Danh mục sản phẩm", icon: "grid_view", href: "/", isCategoryMenu: true },
  { name: "Các thương hiệu", icon: "verified", href: "/?tab=brands", isCategoryMenu: false },
  { name: "Yêu cầu báo giá", icon: "request_quote", href: "/contact", isCategoryMenu: false },
  { name: "Tài liệu kỹ thuật", icon: "description", href: "/docs", isCategoryMenu: false },
  { name: "Tin tức", icon: "newspaper", href: "/?tab=news", isCategoryMenu: false },
];

function HeaderContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { data: session } = useSession();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  // Fetch categories from DB
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  // Close user menu and category dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(e.target as Node)
      ) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push("/");
    }
  };

  const handlePopularSearch = (term: string) => {
    setSearchTerm(term);
    router.push(`/?search=${encodeURIComponent(term)}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    setCategoryMenuOpen(false);
    router.push(`/?category=${encodeURIComponent(categoryId)}`);
  };

  const handleCategoryMouseEnter = () => {
    if (categoryTimeoutRef.current) {
      clearTimeout(categoryTimeoutRef.current);
      categoryTimeoutRef.current = null;
    }
    setCategoryMenuOpen(true);
  };

  const handleCategoryMouseLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => {
      setCategoryMenuOpen(false);
    }, 200);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* ===== TOP BAR ===== */}
      <div className="border-b border-slate-200 shadow-sm bg-[url('/images/background-header.jpg')] bg-cover bg-center">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
          {/* Main row: Logo | Search | Actions */}
          <div className="flex items-center gap-4 lg:gap-6 py-3">
            {/* Logo */}
            <Link
              href="/"
              className="shrink-0 flex items-center gap-2.5 group"
            >
              <img
                src="/images/logo.png"
                alt="Thiên Nhật Minh"
                className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Search Bar Wrapper */}
            <div className="flex-1 hidden sm:flex justify-center items-center">
              <div className="w-full max-w-lg">
                <form
                  onSubmit={handleSearch}
                  className="flex items-center border-1 border-primary rounded-2xl bg-white p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300"
                >
                  <input
                    className="flex-1 min-w-0 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none border-none bg-transparent font-medium"
                    placeholder="Nhập từ khoá để tìm kiếm sản phẩm"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-sm transition-all duration-200 shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">
                      search
                    </span>

                    <span className="hidden md:inline">
                      Tìm kiếm
                    </span>
                  </button>
                </form>

                {/* Popular Searches */}
                <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-red-500 whitespace-nowrap">
                    Tìm kiếm nhiều nhất :
                  </span>

                  {popularSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handlePopularSearch(term)}
                      className="text-[11px] text-slate-500 hover:text-primary transition-colors duration-200 whitespace-nowrap cursor-pointer"
                    >
                      {term}
                      {i < popularSearches.length - 1 && (
                        <span className="ml-1.5 text-slate-300">·</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 lg:gap-2 shrink-0">
              {/* Hotline */}
              <a
                href="tel:+84983449446"
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                title="Hotline: +84 983 449 446"
              >
                <span className="material-symbols-outlined text-xl">call</span>
              </a>
              {/* Map */}
              <a
                href="https://maps.app.goo.gl/317Scp3d6KATsDm8A"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                title="75 Nguyễn Cửu Đàm, TP. HCM"
              >
                <span className="material-symbols-outlined text-xl">
                  location_on
                </span>
              </a>

              {/* Divider */}
              <div className="hidden lg:block w-px h-7 bg-slate-200 mx-1"></div>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-red-50 text-slate-600 hover:text-red-500 transition-all duration-300"
                title="Yêu thích"
              >
                <span className="material-symbols-outlined text-[22px]">
                  favorite
                </span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 text-slate-600 hover:text-primary transition-all duration-300"
                title="Giỏ hàng"
              >
                <span className="material-symbols-outlined text-[22px]">
                  shopping_cart
                </span>
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-cyan-500 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User Account */}
              <div className="relative" ref={userMenuRef}>
                {session ? (
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-primary/90 transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    <span className="text-sm font-bold">
                      {session.user?.name?.charAt(0) || "U"}
                    </span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-primary/90 transition-all duration-300 shadow-sm"
                    title="Đăng nhập"
                  >
                    <span className="material-symbols-outlined text-xl">
                      person
                    </span>
                  </Link>
                )}

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-in overflow-hidden">
                    <div className="p-2 flex flex-col gap-0.5">
                      {session ? (
                        <>
                          <div className="px-4 py-2.5 border-b border-slate-100 mb-1">
                            <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                              {session.user?.name}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {session.user?.email}
                            </p>
                          </div>
                          <Link
                            href="/account"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">
                              account_circle
                            </span>
                            Tài khoản của tôi
                          </Link>
                          <Link
                            href="/account?tab=orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">
                              receipt_long
                            </span>
                            Đơn hàng
                          </Link>
                          <button
                            onClick={() => {
                              signOut();
                              setUserMenuOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left w-full cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-lg">
                              logout
                            </span>
                            Đăng xuất
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">
                              login
                            </span>
                            Đăng nhập
                          </Link>
                          <Link
                            href="/register"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">
                              person_add
                            </span>
                            Đăng ký tài khoản
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                <span className="material-symbols-outlined text-[22px]">
                  {mobileMenuOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="sm:hidden pb-3">
            <form
              onSubmit={handleSearch}
              className="flex items-center border-2 border-primary rounded-lg overflow-hidden"
            >
              <input
                className="flex-1 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                placeholder="Tìm kiếm sản phẩm..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 shrink-0 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">
                  search
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      <div
        className={`sm:hidden overflow-hidden border-b border-slate-200 bg-white shadow-lg transition-[max-height,opacity] duration-300 ease-out ${mobileMenuOpen ? "max-h-[30rem] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <nav className="grid grid-cols-2 gap-2 p-3">
          {navMenuItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* ===== BOTTOM NAV BAR ===== */}
      <div className="hidden sm:block bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200 shadow-sm relative z-40">
        <div className="max-w-screen-2xl mx-auto px-0 sm:px-6 lg:px-10 overflow-x-auto md:overflow-visible scrollbar-hide">
          <nav className="flex min-w-max items-center justify-start md:min-w-0 md:justify-between overflow-visible">
            {navMenuItems.map((item, idx) => {
              if (item.isCategoryMenu) {
                // "Danh mục sản phẩm" with hover dropdown
                return (
                  <div
                    key={idx}
                    className="relative z-50"
                    ref={categoryMenuRef}
                    onMouseEnter={handleCategoryMouseEnter}
                    onMouseLeave={handleCategoryMouseLeave}
                  >
                    <button
                      type="button"
                      onClick={() => setCategoryMenuOpen((prev) => !prev)}
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 lg:px-4 py-2.5 text-[11px] sm:text-[12px] lg:text-[13px] font-semibold whitespace-nowrap transition-all duration-300 border-b-2 border-transparent hover:border-primary text-slate-700 hover:text-primary hover:bg-primary/5 shrink-0 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-primary">
                        {item.icon || "grid_view"}
                      </span>
                      {item.name}
                      <span
                        className={`material-symbols-outlined text-[13px] sm:text-[14px] text-slate-400 transition-transform duration-200 ${categoryMenuOpen ? "rotate-180 text-primary" : ""
                          }`}
                      >
                        keyboard_arrow_down
                      </span>
                    </button>

                    {/* Categories Flyout Dropdown */}
                    {categoryMenuOpen && (
                      <div className="absolute left-0 top-full bg-white rounded-b-xl shadow-2xl border border-slate-200 border-t-2 border-t-primary z-[100] animate-in fade-in duration-150 flex min-w-[240px] before:absolute before:-top-3 before:left-0 before:w-full before:h-3 before:content-['']">
                        {categories.length > 0 ? (
                          /* Left Panel: Parent categories */
                          <div className="w-64 py-2 flex flex-col">
                            {categories.map((cat) => (
                              <div key={cat.id} className="relative group/cat">
                                <button
                                  onClick={() => handleCategoryClick(cat.id)}
                                  className="flex items-center w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors group/btn cursor-pointer"
                                >
                                  <span className="flex-1 text-sm font-semibold text-slate-700 group-hover/btn:text-primary transition-colors truncate">
                                    {cat.name}
                                  </span>
                                  <span className="flex items-center gap-1.5 shrink-0 ml-2">
                                    {cat._count?.products > 0 && (
                                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                        {cat._count.products}
                                      </span>
                                    )}
                                    {cat.children && cat.children.length > 0 && (
                                      <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover/btn:text-primary transition-colors">
                                        chevron_right
                                      </span>
                                    )}
                                  </span>
                                </button>

                                {/* Right flyout panel: shown on hover */}
                                {cat.children && cat.children.length > 0 && (
                                  <div className="absolute left-full top-0 ml-0.5 hidden group-hover/cat:flex flex-col bg-white border border-slate-200 shadow-xl rounded-xl min-w-[220px] max-w-[280px] py-2 z-50 animate-in fade-in slide-in-from-left-1 duration-150 before:absolute before:-left-3 before:top-0 before:w-3 before:h-full before:content-['']">
                                    <div className="px-4 py-1.5 border-b border-slate-100 mb-1">
                                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        {cat.name}
                                      </span>
                                    </div>
                                    {cat.children.map((child: any) => (
                                      <button
                                        key={child.id}
                                        onClick={() => handleCategoryClick(child.id)}
                                        className="flex items-center gap-2.5 w-full text-left px-4 py-2 hover:bg-primary/5 transition-colors group/child cursor-pointer"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/child:bg-primary transition-colors shrink-0"></span>
                                        <span className="text-sm text-slate-600 group-hover/child:text-primary transition-colors flex-1 truncate">
                                          {child.name}
                                        </span>
                                        {child._count?.products > 0 && (
                                          <span className="text-[10px] text-slate-400 shrink-0">
                                            {child._count.products}
                                          </span>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-5 py-4 text-xs text-slate-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm animate-spin">
                              progress_activity
                            </span>
                            <span>Đang tải danh mục...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex items-center gap-1 px-2.5 sm:px-3 lg:px-4 py-2.5 text-[11px] sm:text-[12px] lg:text-[13px] font-semibold whitespace-nowrap transition-all duration-300 border-b-2 border-transparent hover:border-primary text-slate-600 hover:text-primary hover:bg-primary/5 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-primary">
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default function Header() {
  return (
    <Suspense
      fallback={
        <header className="bg-white sticky top-0 z-50 border-b border-slate-200 h-[120px]" />
      }
    >
      <HeaderContent />
    </Suspense>
  );
}
