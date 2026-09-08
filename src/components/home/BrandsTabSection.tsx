"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import Pagination from "@/components/ui/Pagination";
import { useNotification } from "@/context/NotificationContext";

type Brand = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};

export default function BrandsTabSection() {
  const { showNotification } = useNotification();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [brandQuery, setBrandQuery] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBrands(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!searchWrapRef.current?.contains(e.target as Node)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "12",
        });
        if (selectedBrand) params.set("brand", selectedBrand);

        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        setProducts(Array.isArray(data.items) ? data.items : []);
        setTotal(data.total || 0);
        setTotalPages(
          data.totalPages ||
            Math.max(1, Math.ceil((data.total || 0) / (data.limit || 12)))
        );
      } catch (error) {
        console.error("Failed to fetch products", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, selectedBrand]);

  const suggestions = useMemo(() => {
    const q = brandQuery.trim().toLowerCase();
    if (!q) return brands.slice(0, 8);
    return brands
      .filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.slug.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [brandQuery, brands]);

  const handleBrandSelect = (brand: Brand | null) => {
    if (!brand) {
      setSelectedBrand(null);
      setBrandQuery("");
      setPage(1);
      setSuggestOpen(false);
      showNotification("Hiển thị tất cả sản phẩm", "info");
      return;
    }
    setSelectedBrand(brand.name);
    setBrandQuery(brand.name);
    setPage(1);
    setSuggestOpen(false);
    showNotification(`Đã lọc thương hiệu: ${brand.name}`, "info");
  };

  const loop = brands.length > 0 ? [...brands, ...brands] : [];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="flex justify-center py-2">
          <h1
            className="heading-dual text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 font-headline tracking-tight"
            data-en="Our Brands"
          >
            <span>CÁC THƯƠNG HIỆU</span>
          </h1>
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
          Tìm hoặc chọn logo thương hiệu để lọc sản phẩm.
        </p>
      </div>

      <div ref={searchWrapRef} className="relative max-w-xl mx-auto">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
          search
        </span>
        <input
          value={brandQuery}
          onChange={(e) => {
            setBrandQuery(e.target.value);
            setSuggestOpen(true);
          }}
          onFocus={() => setSuggestOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && suggestions[0]) {
              e.preventDefault();
              handleBrandSelect(suggestions[0]);
            }
            if (e.key === "Escape") setSuggestOpen(false);
          }}
          placeholder="Tìm thương hiệu..."
          className="w-full bg-surface border border-outline-variant rounded-xl pl-11 pr-24 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        {selectedBrand && (
          <button
            type="button"
            onClick={() => handleBrandSelect(null)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:underline"
          >
            Xóa lọc
          </button>
        )}

        {suggestOpen && suggestions.length > 0 && (
          <ul className="absolute z-30 left-0 right-0 mt-2 bg-white border border-outline-variant rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
            {suggestions.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => handleBrandSelect(b)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-container-low transition-colors ${
                    selectedBrand === b.name ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-white border border-outline-variant flex items-center justify-center overflow-hidden shrink-0">
                    {b.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.image}
                        alt={b.name}
                        className="max-h-7 max-w-full object-contain"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-outline text-lg">
                        verified
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-on-surface truncate">
                    {b.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {brands.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-on-surface-variant font-medium">
            {selectedBrand
              ? `Đang lọc: ${selectedBrand}`
              : "Hoặc chọn logo bên dưới"}
          </p>

          <div className="logo-marquee py-1">
            <div
              className="logo-marquee-track"
              style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap" }}
            >
              {loop.map((brand, i) => {
                const active = selectedBrand === brand.name;
                return (
                  <button
                    key={`${brand.id}-${i}`}
                    type="button"
                    onClick={() => handleBrandSelect(brand)}
                    className={`flex items-center justify-center w-40 h-24 shrink-0 rounded-2xl bg-white border shadow-sm px-4 py-3 transition-all cursor-pointer ${
                      active
                        ? "border-primary ring-2 ring-primary/30 scale-[1.02]"
                        : "border-outline-variant/40 hover:border-primary/40 hover:shadow-md"
                    }`}
                    title={brand.name}
                  >
                    {brand.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.image}
                        alt={brand.name}
                        className="max-h-14 w-auto max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs font-bold text-on-surface-variant truncate px-2">
                        {brand.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center px-1 select-none">
        <p className="text-sm text-on-surface-variant font-medium">
          Hiển thị{" "}
          <span className="text-primary font-bold">{products.length}</span> /{" "}
          {total} sản phẩm
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            autorenew
          </span>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      ) : (
        <div className="bg-surface-container-lowest/80 backdrop-blur-sm rounded-xl p-12 text-center border border-outline-variant/10 shadow-sm">
          <span className="material-symbols-outlined text-6xl text-outline mb-4">
            search_off
          </span>
          <h3 className="text-lg font-bold text-primary font-headline">
            Không tìm thấy sản phẩm
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            {selectedBrand
              ? "Thương hiệu này chưa có sản phẩm. Thử chọn thương hiệu khác."
              : "Chưa có sản phẩm nào."}
          </p>
        </div>
      )}
    </div>
  );
}
