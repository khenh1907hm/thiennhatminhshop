"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-8 py-8 w-full flex-grow flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 font-headline">
              Sản phẩm yêu thích
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Bạn đang có {wishlist.length} sản phẩm trong danh sách
            </p>
          </div>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 py-20 px-4 text-center shadow-sm">
            <div className="w-24 h-24 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-5xl">heart_broken</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Danh sách trống</h2>
            <p className="text-slate-500 mb-6 max-w-sm">
              Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy dạo một vòng và thả tim cho những món đồ bạn thích nhé.
            </p>
            <Link
              href="/shop"
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
