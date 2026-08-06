"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import { products } from "@/data/products";
import { useNotification } from "@/context/NotificationContext";

interface SubCategory {
  id: string;
  name: string;
}

interface MainCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: SubCategory[];
}

export default function Home() {
  const { showNotification } = useNotification();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Hierarchical categories structure
  const mainCategories: MainCategory[] = [
    {
      id: "industrial_automation",
      name: "TỰ ĐỘNG HÓA & CÔNG NGHIỆP",
      icon: "precision_manufacturing",
      subcategories: [
        { id: "SIEMENS", name: "SIEMENS INDUSTRIAL" },
        { id: "OMRON", name: "OMRON SENSORS" },
        { id: "CONTACTOR KHỞI ĐỘNG TỪ", name: "CONTACTOR - KHỞI ĐỘNG TỪ" },
      ],
    },
    {
      id: "electrical_components",
      name: "THIẾT BỊ ĐIỆN DÂN DỤNG",
      icon: "home_max",
      subcategories: [
        { id: "SCHNEIDER CHÍNH HÃNG GIÁ RẺ", name: "SCHNEIDER ELECTRIC" },
        { id: "ĐÈN LED", name: "ĐÈN LED CHIẾU SÁNG" },
      ],
    },
    {
      id: "cables_and_gas",
      name: "CÁP ĐIỆN & HỆ THỐNG GA",
      icon: "settings_input_hdmi",
      subcategories: [
        { id: "DÂY ĐIỆN - CÁP ĐIỆN", name: "CÁP ĐIỆN CADIVI" },
        { id: "KROMSCHRODER", name: "THIẾT BỊ GA KROMSCHRODER" },
      ],
    },
    {
      id: "measuring_appliances",
      name: "ĐO LƯỜNG & KHÁC",
      icon: "speed",
      subcategories: [
        { id: "ENCODER", name: "ENCODER MÃ HÓA VÒNG QUAY" },
        { id: "BATHROOM", name: "THIẾT BỊ NHÀ TẮM" },
      ],
    },
  ];

  // State to manage expanded/collapsed status of large categories
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({
    industrial_automation: true,
    electrical_components: true,
    cables_and_gas: true,
    measuring_appliances: false,
  });

  const toggleGroup = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the group if they just click the chevron arrow
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleCategorySelect = (catId: string, catName: string) => {
    setSelectedCategory(catId);
    showNotification(`Đã lọc danh mục: ${catName}`, "info");
  };

  // Helper to check if a product matches selected hierarchical filters
  const matchesCategoryFilter = (productCategory: string) => {
    if (selectedCategory === "ALL") return true;

    // Check if the selected category is a main category
    const mainCat = mainCategories.find((cat) => cat.id === selectedCategory);
    if (mainCat) {
      // Show products belonging to ANY of its subcategories
      return mainCat.subcategories.some((sub) => sub.id === productCategory);
    }

    // Otherwise, check direct match on subcategory ID
    return productCategory === selectedCategory;
  };

  // Filter products based on active category & search query
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = matchesCategoryFilter(prod.category);
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="max-w-screen-2xl mx-auto px-8 py-8 flex flex-col lg:flex-row gap-8 w-full flex-grow">
        {/* SideNavBar Strategy: Hierarchical Sidebar Category List */}
        <aside className="w-full lg:w-72 flex flex-col gap-2 shrink-0">
          <div className="bg-surface rounded-2xl overflow-hidden shadow-sm border border-outline-variant">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low/50">
              <h2 className="text-on-surface text-xs uppercase tracking-widest font-bold font-headline select-none">
                DANH MỤC THIẾT BỊ
              </h2>
            </div>
            
            <nav className="flex flex-col py-2 max-h-[600px] lg:max-h-none overflow-y-auto">
              {/* All Products Row */}
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

              {mainCategories.map((group) => {
                const isGroupExpanded = expandedGroups[group.id];
                const isGroupActive = selectedCategory === group.id;

                return (
                  <div key={group.id} className="flex flex-col">
                    {/* Large Category Header Row */}
                    <div
                      onClick={() => handleCategorySelect(group.id, group.name)}
                      className={`flex items-center justify-between px-4 py-2.5 mx-2 my-0.5 cursor-pointer transition-all duration-200 rounded-xl group ${
                        isGroupActive
                          ? "bg-primary/10 text-primary font-bold border border-primary/20"
                          : "hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-lg transition-colors">
                          {group.icon}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-tight">
                          {group.name}
                        </span>
                      </div>
                      
                      {/* Accordion Expand/Collapse arrow */}
                      <button
                        onClick={(e) => toggleGroup(group.id, e)}
                        className="p-1 hover:bg-surface-container-high rounded-lg transition-all text-outline hover:text-on-surface active:scale-90 flex items-center justify-center"
                      >
                        <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${
                          isGroupExpanded ? "rotate-180" : ""
                        }`}>
                          keyboard_arrow_down
                        </span>
                      </button>
                    </div>

                    {/* Nested Subcategories */}
                    {isGroupExpanded && (
                      <div className="flex flex-col pl-9 pr-4 pb-2 ml-4 mb-1 space-y-1 border-l-2 border-outline-variant/60 animate-slide-down">
                        {group.subcategories.map((sub) => {
                          const isSubActive = selectedCategory === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => handleCategorySelect(sub.id, sub.name)}
                              className={`py-1.5 px-3 rounded-lg text-[11px] font-semibold tracking-tight text-left transition-all duration-200 flex items-center gap-2 ${
                                isSubActive
                                  ? "text-primary font-bold bg-primary/10"
                                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full transition-transform ${
                                isSubActive ? "bg-primary scale-125" : "bg-outline"
                              }`} />
                              <span>{sub.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
 
          {/* Glowing Sidebar Contact Banner */}
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
 
        {/* Main Content Canvas */}
        <section className="flex-1">
          {/* Hero Banner for Product Page */}
          <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-8 group shadow-sm border border-outline-variant/5">
            <img
              alt="Electrical Infrastructure"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDldz8IsRitbau6RdQBqDy78r-naGY9HTMdpNG0MFZNKOQWYC8GyjQWX6qxOcV5oWxWZDfyT27XBXoJl13R0T--wKl5XENBFvdvXNDgedDtuIQ4sQj-vlOJAv0KDLhBXXpdvf9AQO6n6BFHlCTopEKNR9EOMSncHTeULJlpjlLXce7VqrtRrtci2WKqZxP-CawxsSJFN62gQQZ394uvCDucZtpuinRuHWtdgAvsN0uojY3ZT2G0AWtbronz4z3YPdq8vqQddB-N_nY"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/85 to-transparent flex flex-col justify-center px-12">
              <h1 className="text-white text-3xl sm:text-4xl font-bold tracking-tight mb-2 font-headline select-none">
                DANH MỤC THIẾT BỊ
              </h1>
              <p className="text-amber-400 font-medium tracking-widest uppercase text-sm select-none">
                Precision Power Engineering Solutions
              </p>
            </div>
          </div>
 
          {/* Search Bar in Content Area for extra utility */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full max-w-md relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-high/40 border border-outline-variant/10 rounded-xl px-4 py-2.5 pl-10 focus:ring-2 focus:ring-surface-tint focus:bg-white transition-all text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Tìm kiếm sản phẩm kỹ thuật..."
                type="text"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg select-none">
                search
              </span>
            </div>

            <div className="flex gap-4 shrink-0 w-full sm:w-auto">
              <div 
                onClick={() => showNotification("Tính năng lọc theo hãng đang được xây dựng.", "info")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-500/5 hover:bg-slate-500/10 border border-outline-variant/10 px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-all active:scale-98"
              >
                <span className="material-symbols-outlined text-sm select-none">
                  filter_list
                </span>
                <span className="select-none">Lọc theo hãng</span>
              </div>
              <div 
                onClick={() => showNotification("Danh sách đã được sắp xếp tự động.", "info")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-500/5 hover:bg-slate-500/10 border border-outline-variant/10 px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-all active:scale-98"
              >
                <span className="material-symbols-outlined text-sm select-none">sort</span>
                <span className="select-none">Mới nhất</span>
              </div>
            </div>
          </div>

          {/* Toolbar / Filters info */}
          <div className="flex justify-between items-center mb-6 px-2 select-none">
            <p className="text-sm text-on-surface-variant font-medium">
              Hiển thị{" "}
              <span className="text-primary font-bold">
                {filteredProducts.length}
              </span>{" "}
              sản phẩm
            </p>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest/80 backdrop-blur-sm rounded-xl p-12 text-center border border-outline-variant/10 shadow-sm">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">
                search_off
              </span>
              <h3 className="text-lg font-bold text-primary font-headline">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                Hãy thử thay đổi danh mục hoặc từ khóa tìm kiếm khác.
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-12 flex justify-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-outline-variant/20 text-primary font-bold shadow-sm active:scale-90 transition-all">
              1
            </button>
            <button 
              onClick={() => showNotification("Đang tải dữ liệu trang tiếp theo...", "info")}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-primary transition-all border border-transparent hover:border-outline-variant/10 active:scale-90 font-bold"
            >
              2
            </button>
            <button 
              onClick={() => showNotification("Đang tải dữ liệu trang tiếp theo...", "info")}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-primary transition-all border border-transparent hover:border-outline-variant/10 active:scale-90 font-bold"
            >
              3
            </button>
            <button 
              onClick={() => showNotification("Đang tải dữ liệu trang tiếp theo...", "info")}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-primary transition-all border border-transparent hover:border-outline-variant/10 active:scale-90 font-bold"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* Embedded Animations styles */}
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
