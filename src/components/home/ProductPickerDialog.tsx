"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CategoryItem = {
  id: string;
  name: string;
};

export type PickerProduct = {
  id: string;
  name: string;
  sku: string;
  brand?: string | null;
  images?: string[];
  category?: { name: string } | null;
};

type ProductPickerDialogProps = {
  open: boolean;
  onClose: () => void;
  initialSelected?: PickerProduct[];
  onConfirm: (products: PickerProduct[]) => void;
};

function ProductSkeleton() {
  return (
    <div className="flex gap-3 p-3 rounded-2xl border border-white/40 bg-white/40 animate-pulse">
      <div className="w-14 h-14 rounded-xl bg-slate-200/80 shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3.5 w-3/4 rounded-full bg-slate-200/80" />
        <div className="h-3 w-1/2 rounded-full bg-slate-200/60" />
      </div>
    </div>
  );
}

export default function ProductPickerDialog({
  open,
  onClose,
  initialSelected = [],
  onConfirm,
}: ProductPickerDialogProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState<PickerProduct[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [picked, setPicked] = useState<Map<string, PickerProduct>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const seededRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!open) {
      seededRef.current = false;
      return;
    }
    if (!seededRef.current) {
      setPicked(new Map(initialSelected.map((p) => [p.id, p])));
      seededRef.current = true;
    }
  }, [open, initialSelected]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [open]);

  const loadPage = useCallback(
    async (pageToLoad: number, replace: boolean) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      if (replace) setInitialLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(pageToLoad),
          limit: "12",
        });
        if (activeCategory !== "ALL") params.set("category", activeCategory);
        if (debouncedSearch) params.set("search", debouncedSearch);

        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        const items: PickerProduct[] = Array.isArray(data?.items) ? data.items : [];
        setProducts((prev) => (replace ? items : [...prev, ...items]));
        setHasMore(Boolean(data?.hasMore));
        setPage(pageToLoad);
      } catch (err) {
        console.error(err);
        if (replace) setProducts([]);
        setHasMore(false);
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [activeCategory, debouncedSearch]
  );

  useEffect(() => {
    if (!open) return;
    setProducts([]);
    setPage(1);
    setHasMore(true);
    loadPage(1, true);
  }, [open, activeCategory, debouncedSearch, loadPage]);

  useEffect(() => {
    if (!open) return;
    const root = listRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingRef.current) {
          loadPage(page + 1, false);
        }
      },
      { root, rootMargin: "120px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [open, hasMore, page, loadPage, products.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const toggle = (product: PickerProduct) => {
    setPicked((prev) => {
      const next = new Map(prev);
      if (next.has(product.id)) next.delete(product.id);
      else next.set(product.id, product);
      return next;
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full sm:max-w-xl max-h-[88vh] sm:max-h-[82vh] flex flex-col
          rounded-t-[2rem] sm:rounded-[2rem] bg-white/75 backdrop-blur-2xl
          border border-white/60 shadow-[0_25px_80px_-20px_rgba(15,23,42,0.45)] overflow-hidden"
      >
        <div className="shrink-0 px-5 pt-5 pb-3 border-b border-white/50">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-headline">
                Chọn sản phẩm
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chọn nhiều sản phẩm · Đã chọn {picked.size}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-900/5 hover:bg-slate-900/10 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[22px] text-slate-600">
                close
              </span>
            </button>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm sản phẩm, mã hàng, thương hiệu..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/80 border border-slate-200/80
                text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40
                placeholder:text-slate-400 shadow-sm"
            />
          </div>

          <div className="mt-3 -mx-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 px-1 py-1 min-w-max">
              <button
                type="button"
                onClick={() => setActiveCategory("ALL")}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  activeCategory === "ALL"
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                    : "bg-white/70 text-slate-600 border-slate-200/80 hover:border-primary/40"
                }`}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    activeCategory === cat.id
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                      : "bg-white/70 text-slate-600 border-slate-200/80 hover:border-primary/40"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
          {initialLoading ? (
            Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
                inventory_2
              </span>
              <p className="text-sm font-semibold text-slate-600">
                Không tìm thấy sản phẩm
              </p>
            </div>
          ) : (
            products.map((product) => {
              const image = product.images?.[0];
              const selected = picked.has(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggle(product)}
                  className={`w-full flex gap-3 p-3 rounded-2xl border text-left transition-all ${
                    selected
                      ? "bg-primary/10 border-primary/40 shadow-sm"
                      : "bg-white/55 border-white/60 hover:bg-white/90 hover:border-primary/25"
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/70">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-300">
                          image
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                      SKU: {product.sku}
                      {product.brand ? ` · ${product.brand}` : ""}
                    </p>
                  </div>
                  <span
                    className={`material-symbols-outlined self-center ${
                      selected ? "text-primary" : "text-slate-300"
                    }`}
                  >
                    {selected ? "check_circle" : "radio_button_unchecked"}
                  </span>
                </button>
              );
            })
          )}
          {!initialLoading && loading && (
            <>
              <ProductSkeleton />
              <ProductSkeleton />
            </>
          )}
          <div ref={sentinelRef} className="h-4" />
        </div>

        <div className="shrink-0 p-4 border-t border-white/50 bg-white/50 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(Array.from(picked.values()));
              onClose();
            }}
            className="flex-[1.4] py-3 rounded-2xl bg-primary text-white text-sm font-bold hover:bg-primary/90"
          >
            Xác nhận ({picked.size})
          </button>
        </div>
      </div>
    </div>
  );
}
