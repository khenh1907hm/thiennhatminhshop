"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import { products } from "@/data/products";

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [power, setPower] = useState("all");
  const [waterResistance, setWaterResistance] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const categories = [
    { id: "all", name: "Tất cả danh mục" },
    { id: "SIEMENS", name: "Thương hiệu SIEMENS" },
    { id: "SCHNEIDER CHÍNH HÃNG GIÁ RẺ", name: "Schneider Electric" },
    { id: "DÂY ĐIỆN - CÁP ĐIỆN", name: "Dây & Cáp điện Cadivi" },
    { id: "ĐÈN LED", name: "Đèn LED Chiếu Sáng" },
    { id: "OMRON", name: "Cảm biến Omron" },
    { id: "CONTACTOR KHỞI ĐỘNG TỪ", name: "Khởi động từ LS" },
  ];

  const brands = ["all", "SIEMENS", "SCHNEIDER", "CADIVI", "PANASONIC", "OMRON", "LS ELECTRIC"];

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
    const matchesBrand = selectedBrand === "all" || p.brand.toUpperCase() === selectedBrand.toUpperCase();
    
    let matchesPrice = true;
    if (priceRange === "under-1m") matchesPrice = p.numericPrice < 1000000;
    else if (priceRange === "1m-10m") matchesPrice = p.numericPrice >= 1000000 && p.numericPrice <= 10000000;
    else if (priceRange === "above-10m") matchesPrice = p.numericPrice > 10000000;

    const matchesPower = power === "all" || p.name.toLowerCase().includes(power.toLowerCase()) || p.description.toLowerCase().includes(power.toLowerCase());
    const matchesWater = waterResistance === "all" || p.description.toLowerCase().includes(waterResistance.toLowerCase()) || p.name.toLowerCase().includes(waterResistance.toLowerCase());

    return matchesSearch && matchesCat && matchesBrand && matchesPrice && matchesPower && matchesWater;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.numericPrice - b.numericPrice;
    if (sortBy === "price-high") return b.numericPrice - a.numericPrice;
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col fe-bg-gradient">
      <Header />

      <main className="w-[85%] mx-auto py-8 flex-grow">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-primary to-cyan-800 rounded-3xl p-8 sm:p-12 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">Cửa Hàng Thiết Bị Năng Lượng</span>
            <h1 className="text-3xl sm:text-4xl font-bold font-headline">Danh Sách Sản Phẩm Kỹ Thuật</h1>
            <p className="text-sm text-blue-100 leading-relaxed">
              Cung cấp linh kiện điện công nghiệp, biến tần, pin lưu trữ Lithium & trạm sạc xe điện chính hãng.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Filter */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                <h2 className="text-base font-bold text-on-surface font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">filter_alt</span>
                  Bộ Lọc Sản Phẩm
                </h2>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedBrand("all");
                    setPriceRange("all");
                    setPower("all");
                    setWaterResistance("all");
                    setSearchQuery("");
                  }}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Xóa lọc
                </button>
              </div>

              {/* Search */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">Tìm kiếm từ khóa</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tên thiết bị, SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">Danh mục</label>
                <div className="space-y-1">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        selectedCategory === c.id
                          ? "bg-primary text-on-primary font-bold shadow-sm"
                          : "text-on-surface-variant hover:bg-surface-container-low"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">Hãng sản xuất</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface font-medium focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="all">Tất cả hãng</option>
                  {brands.filter(b => b !== "all").map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Power Filter */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">Công suất (kW)</label>
                <select
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface font-medium focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="all">Tất cả</option>
                  <option value="5kw">Dưới 5kW</option>
                  <option value="10kw">5kW - 10kW</option>
                  <option value="15kw">10kW - 15kW</option>
                  <option value="20kw">Trên 15kW</option>
                </select>
              </div>

              {/* Water Resistance Filter */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">Chuẩn chống nước</label>
                <select
                  value={waterResistance}
                  onChange={(e) => setWaterResistance(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface font-medium focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="all">Tất cả</option>
                  <option value="ip65">IP65</option>
                  <option value="ip67">IP67</option>
                  <option value="ip68">IP68</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">Khoảng giá</label>
                <div className="space-y-1.5 text-xs text-on-surface-variant">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === "all"}
                      onChange={() => setPriceRange("all")}
                    />
                    Tất cả mức giá
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === "under-1m"}
                      onChange={() => setPriceRange("under-1m")}
                    />
                    Dưới 1,000,000 đ
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === "1m-10m"}
                      onChange={() => setPriceRange("1m-10m")}
                    />
                    Từ 1,000,000 đ - 10,000,000 đ
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === "above-10m"}
                      onChange={() => setPriceRange("above-10m")}
                    />
                    Trên 10,000,000 đ
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Product List */}
          <div className="lg:col-span-9 space-y-6">
            {/* Toolbar */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-on-surface-variant font-medium">
                Tìm thấy <span className="font-bold text-primary">{sortedProducts.length}</span> thiết bị phù hợp
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs text-outline">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-semibold text-on-surface focus:outline-none"
                >
                  <option value="featured">Nổi bật nhất</option>
                  <option value="price-low">Giá: Thấp đến Cao</option>
                  <option value="price-high">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-surface rounded-2xl p-12 text-center border border-outline-variant shadow-sm space-y-3">
                <span className="material-symbols-outlined text-5xl text-outline">search_off</span>
                <h3 className="text-lg font-bold text-on-surface font-headline">Không tìm thấy sản phẩm phù hợp</h3>
                <p className="text-xs text-on-surface-variant">Thử bỏ các tiêu chí lọc để xem thêm thiết bị khác.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
