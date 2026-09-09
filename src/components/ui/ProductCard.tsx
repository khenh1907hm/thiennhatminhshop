"use client";

import Link from "next/link";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useNotification } from "@/context/NotificationContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/formatPrice";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const isLiked = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    showNotification(`Đã thêm 1 x ${product.name} vào giỏ hàng thành công!`, "success");
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) {
      removeFromWishlist(product.id);
      showNotification(`Đã xóa ${product.name} khỏi danh sách yêu thích`, "info");
    } else {
      addToWishlist(product);
      showNotification(`Đã thêm ${product.name} vào danh sách yêu thích`, "success");
    }
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="bg-surface rounded-2xl p-3 sm:p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border border-outline-variant hover:border-primary/40 group flex flex-col justify-between h-full cursor-pointer relative overflow-hidden"
    >
      {/* Subtle Cyan glow reflection overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-500/5 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div>
        <div className="aspect-square rounded-xl bg-surface-container-low mb-3 sm:mb-4 overflow-hidden relative flex items-center justify-center border border-outline-variant p-3 sm:p-4">
          <img
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
            src={Array.isArray((product as any).images) ? (product as any).images[0] : (product as any).image}
          />
          {product.inStock && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-emerald-500 text-white px-2 py-1 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              Sẵn Hàng
            </div>
          )}
          {product.brand && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold max-w-[70%] truncate">
              {product.brand}
            </div>
          )}
          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm z-10 ${
              isLiked 
                ? "bg-red-500 text-white" 
                : "bg-white/80 backdrop-blur-sm text-slate-400 hover:text-red-500 hover:bg-white"
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${isLiked ? 'fill-current' : ''}`}>
              favorite
            </span>
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] sm:text-[10px] text-outline font-semibold uppercase tracking-wider line-clamp-1">
            {typeof product.category === 'string' ? product.category : (product.category as any)?.name}
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 font-headline">
            {product.name}
          </h3>
          <p className="text-[10px] sm:text-[11px] font-mono text-outline">
            SKU: {product.sku}
          </p>
        </div>
      </div>

      <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-outline-variant flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] sm:text-xs text-outline block -mb-1">Giá niêm yết</span>
          <span className="text-sm sm:text-base font-bold text-primary font-headline">
            {formatPrice(product.price)}
          </span>
        </div>
        
        <button
          onClick={handleAddToCart}
          className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-primary hover:bg-primary/90 text-on-primary text-[10px] sm:text-xs font-semibold rounded-xl flex items-center gap-1 transition-all shadow-md shadow-primary/20 active:scale-95 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[15px] sm:text-[16px]">shopping_cart</span>
          <span>Mua ngay</span>
        </button>
      </div>
    </Link>
  );
}
