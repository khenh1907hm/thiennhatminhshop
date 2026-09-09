"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import NewsList from "@/components/news/NewsList";
import QuoteRequestSection from "@/components/home/QuoteRequestSection";
import HomeNewsSection from "@/components/home/HomeNewsSection";
import CustomersSection from "@/components/home/CustomersSection";
import BrandsTabSection from "@/components/home/BrandsTabSection";
import FaqSection from "@/components/home/FaqSection";
import BackToTopButton from "@/components/ui/BackToTopButton";
import Pagination from "@/components/ui/Pagination";
import { useNotification } from "@/context/NotificationContext";
import { SpeedInsights } from "@vercel/speed-insights/next"

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

function HomeContent() {
  const { showNotification } = useNotification();
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get("search") || "";
  const urlCategoryQuery = searchParams.get("category");
  const activeTab = searchParams.get("tab");
  const isNewsTab = activeTab === "news";
  const isBrandsTab = activeTab === "brands";

  const [selectedCategory, setSelectedCategory] = useState(urlCategoryQuery || "ALL");
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearchQuery);
  const [sortBy, setSortBy] = useState("newest");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setSearchQuery(urlSearchQuery);
    setDebouncedSearch(urlSearchQuery);
    setPage(1);
  }, [urlSearchQuery]);

  useEffect(() => {
    if (urlCategoryQuery) {
      setSelectedCategory(urlCategoryQuery);
    } else {
      setSelectedCategory("ALL");
    }
    setPage(1);
  }, [urlCategoryQuery]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (isNewsTab || isBrandsTab) return;

    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(console.error);
  }, [isNewsTab, isBrandsTab]);

  useEffect(() => {
    if (isNewsTab || isBrandsTab) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "12",
          sort: sortBy,
        });
        if (selectedCategory !== "ALL") params.set("category", selectedCategory);
        if (debouncedSearch) params.set("search", debouncedSearch);

        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        setProducts(Array.isArray(data.items) ? data.items : []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Failed to fetch products", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [isNewsTab, isBrandsTab, page, selectedCategory, debouncedSearch, sortBy]);

  const handleCategorySelect = (catId: string, catName: string) => {
    setSelectedCategory(catId);
    setPage(1);
    showNotification(`Đã lọc danh mục: ${catName}`, "info");
  };

  if (isNewsTab) {
    return (
      <div className="min-h-screen flex flex-col fe-bg-gradient">
        <Header />
        <main className="w-[85%] max-w-[1440px] mx-auto py-8 flex-grow">
          <NewsList showBanner listBasePath="/news" pageSize={12} />
        </main>
        <Footer />
        <BackToTopButton />
      </div>
    );
  }

  if (isBrandsTab) {
    return (
      <div className="min-h-screen flex flex-col fe-bg-gradient">
        <Header />
        <main className="w-[85%] max-w-[1440px] mx-auto py-8 flex-grow">
          <BrandsTabSection />
        </main>
        <Footer />
        <BackToTopButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col fe-bg-gradient">
      <Header />

      <main className="w-[85%] max-w-[1440px] mx-auto py-8 flex flex-col lg:flex-row gap-8 flex-grow">
        <aside className="w-full lg:w-72 flex flex-col gap-2 shrink-0">
          <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant relative z-20">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low/50 rounded-t-2xl">
              <h2 className="text-on-surface text-xs uppercase tracking-widest font-bold font-headline select-none">
                DANH MỤC THIẾT BỊ
              </h2>
            </div>

            <nav className="flex flex-col py-2">
              <div
                onClick={() => handleCategorySelect("ALL", "TẤT CẢ SẢN PHẨM")}
                className={`flex items-center gap-2.5 px-4 py-2.5 mx-2 my-0.5 cursor-pointer transition-all duration-200 rounded-xl group ${
                  selectedCategory === "ALL"
                    ? "bg-primary text-on-primary font-bold shadow-md shadow-primary/20"
                    : "hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-lg select-none">grid_view</span>
                <span className="text-xs font-bold uppercase tracking-tight">TẤT CẢ THIẾT BỊ</span>
              </div>

              {categories.map((group) => {
                const isGroupActive = selectedCategory === group.id;
                const hasChildren = group.children && group.children.length > 0;

                return (
                  <div key={group.id} className="relative group/category">
                    <div
                      onClick={() => handleCategorySelect(group.id, group.name)}
                      className={`flex items-center justify-between px-4 py-2.5 mx-2 my-0.5 cursor-pointer transition-all duration-200 rounded-xl ${
                        isGroupActive
                          ? "bg-primary/10 text-primary font-bold border border-primary/20"
                          : "hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="text-xs font-bold uppercase tracking-tight truncate flex-1">
                        {group.name}
                      </span>
                      {hasChildren && (
                        <span className="material-symbols-outlined text-[16px] text-outline group-hover/category:text-primary group-hover/category:translate-x-0.5 transition-all shrink-0 ml-2">
                          chevron_right
                        </span>
                      )}
                    </div>

                    {hasChildren && (
                      <div className="absolute left-full top-0 ml-1.5 hidden group-hover/category:flex flex-col bg-surface border border-outline-variant shadow-2xl rounded-2xl min-w-[220px] max-w-[280px] p-2 z-50 animate-in fade-in slide-in-from-left-2 duration-150 before:absolute before:-left-3 before:top-0 before:w-3 before:h-full before:content-['']">
                        <div className="px-3 py-1.5 border-b border-outline-variant/50 mb-1">
                          <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                            {group.name}
                          </span>
                        </div>
                        <div className="flex flex-col space-y-0.5">
                          {group.children.map((sub) => {
                            const isSubActive = selectedCategory === sub.id;
                            return (
                              <button
                                key={sub.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCategorySelect(sub.id, sub.name);
                                }}
                                className={`py-2 px-3 rounded-xl text-xs font-semibold text-left transition-all duration-200 flex items-center justify-between group/sub cursor-pointer ${
                                  isSubActive
                                    ? "text-primary font-bold bg-primary/10"
                                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                                }`}
                              >
                                <span className="truncate">{sub.name}</span>
                                {sub._count?.products > 0 && (
                                  <span className="text-[10px] text-outline/70 bg-surface-container px-1.5 py-0.5 rounded-md ml-2 shrink-0">
                                    {sub._count.products}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="mt-4 p-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl text-white shadow-xl shadow-blue-500/15 relative overflow-hidden group">
            <span className="material-symbols-outlined text-4xl text-cyan-200 mb-3 animate-pulse select-none">
              bolt
            </span>
            <h3 className="text-base font-bold leading-tight font-headline select-none">
              HỖ TRỢ KĨ THUẬT 24/7
            </h3>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed select-none">
              Đội ngũ kỹ sư Thiên Nhật Minh tư vấn giải pháp năng lượng mặt trời.
            </p>
            <button
              onClick={() => showNotification("Kỹ sư hỗ trợ đang kết nối...", "info")}
              className="mt-4 w-full py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95 cursor-pointer"
            >
              LIÊN HỆ NGAY
            </button>
          </div>
        </aside>

        <section className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="w-full sm:flex-1 relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2.5 pl-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none text-slate-800 placeholder-slate-400"
                placeholder="Tìm kiếm sản phẩm kỹ thuật..."
                type="text"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg select-none">
                search
              </span>
            </div>
            <div className="relative w-full sm:w-56 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full appearance-none bg-surface border border-outline-variant rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              >
                <option value="newest">Sản phẩm mới nhất</option>
                <option value="price_asc">Giá thấp → cao</option>
                <option value="price_desc">Giá cao → thấp</option>
                <option value="name_asc">Thứ tự A → Z</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline text-lg pointer-events-none select-none">
                expand_more
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6 px-1 select-none">
            <p className="text-sm text-on-surface-variant font-medium">
              Hiển thị <span className="text-primary font-bold">{products.length}</span> / {total} sản phẩm
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          ) : (
            <div className="bg-surface-container-lowest/80 backdrop-blur-sm rounded-xl p-12 text-center border border-outline-variant/10 shadow-sm">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">search_off</span>
              <h3 className="text-lg font-bold text-primary font-headline">Không tìm thấy sản phẩm</h3>
              <p className="text-sm text-slate-500 mt-2">
                Hãy thử thay đổi danh mục hoặc từ khóa tìm kiếm khác.
              </p>
            </div>
          )}
        </section>
      </main>

      <HomeNewsSection />
      <CustomersSection />
      <FaqSection />
      <QuoteRequestSection />
      <Footer />
      <BackToTopButton />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <HomeContent />
    </Suspense>
  );
}
