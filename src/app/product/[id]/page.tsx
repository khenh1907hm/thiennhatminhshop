"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { parseSpecs } from "@/lib/specs";
import { formatPrice } from "@/lib/formatPrice";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showNotification } = useNotification();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setProduct(data);
        const images = Array.isArray(data.images) ? data.images : [data.image];
        setSelectedImage(images[0] || "");
        
        // Fetch some related products (just get all and slice for now)
        const allRes = await fetch(`/api/products`);
        if (allRes.ok) {
          const allData = await allRes.json();
          setRelatedProducts(allData.filter((p: any) => p.id !== data.id).slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-8 py-20 flex flex-col items-center justify-center w-full">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-surface-container-high border-t-primary shadow-sm"></div>
          <p className="mt-4 text-sm font-semibold text-primary/70 tracking-widest uppercase animate-pulse">Đang tải...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Header />
        <main className="max-w-screen-2xl mx-auto px-8 py-20 flex flex-col items-center justify-center flex-grow text-center">
          <span className="material-symbols-outlined text-6xl text-error mb-4">
            warning
          </span>
          <h1 className="text-3xl font-bold text-primary font-headline">
            Sản phẩm không tồn tại
          </h1>
          <p className="text-slate-500 mt-2 max-w-md">
            Chúng tôi không tìm thấy thông tin sản phẩm bạn yêu cầu. Vui lòng quay lại trang danh sách sản phẩm.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary-container transition-all"
          >
            Quay lại trang chủ
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const allImages = Array.isArray(product.images) ? product.images : [product.image];
  const specGroups = parseSpecs(product.specs);

  // Handler to add to cart
  const handleAddToCart = () => {
    addToCart(product, quantity);
    showNotification(`Đã thêm ${quantity} x ${product.name} vào giỏ hàng thành công!`, "success");
  };

  const isFavorite = product ? isInWishlist(product.id) : false;

  const handleFavoriteClick = () => {
    if (!product) return;
    if (isFavorite) {
      removeFromWishlist(product.id);
      showNotification(`Đã xóa ${product.name} khỏi danh sách yêu thích.`, "info");
    } else {
      addToWishlist(product);
      showNotification(`Đã thêm ${product.name} vào danh sách yêu thích!`, "success");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-grow">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link href="/" className="hover:text-primary transition-colors">Sản phẩm</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="hover:text-primary cursor-pointer transition-colors">{product.brand}</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-on-surface font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Info Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Product Images */}
          <div className="xl:col-span-7 space-y-3">
            <div className="aspect-square rounded-xl bg-white flex items-center justify-center p-2 sm:p-3 relative overflow-hidden shadow-sm border border-outline-variant/15">
              <img
                alt={product.name}
                className="w-full h-full object-contain"
                src={selectedImage || product.image}
              />
              {product.inStock && (
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className="bg-white/95 text-slate-700 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1.5 border border-slate-200 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    Đang có hàng
                  </span>
                </div>
              )}
            </div>
            
            {/* Gallery thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-hide">
                {allImages.map((img: any, idx: number) => {
                  const isActive = (selectedImage === img) || (!selectedImage && idx === 0);
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`aspect-square w-20 shrink-0 snap-start rounded-lg p-1 cursor-pointer transition-all duration-200 border flex items-center justify-center ${
                        isActive
                          ? "border-slate-800 bg-white shadow-sm"
                          : "border-outline-variant/20 bg-surface-container-low/50 hover:bg-surface-container-high/50"
                      }`}
                    >
                      <img
                        alt={`Detail view ${idx + 1}`}
                        className="w-full h-full object-contain"
                        src={img}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Purchase Details */}
          <div className="xl:col-span-5 flex flex-col justify-start gap-5">
            <span className="text-slate-500 font-semibold tracking-widest text-xs uppercase">
              {product.brand} INDUSTRIAL GRADE
            </span>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-900 leading-tight -mt-3">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4">
              <span className="text-2xl font-headline font-bold text-slate-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-slate-400 line-through text-base">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.discount && (
                <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-semibold border border-slate-200">
                  {product.discount}
                </span>
              )}
            </div>

            <p className="text-sm text-secondary leading-relaxed">
              {product.description}
            </p>

            {/* Quantity Selector and Action Buttons */}
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest w-24">
                  Số lượng
                </span>
                <div className="flex items-center bg-surface-container/60 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-outline-variant/10">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-primary hover:bg-white/80 rounded-lg transition-all duration-200 active:scale-90 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <span className="material-symbols-outlined text-sm select-none">remove</span>
                  </button>
                  <span className="w-12 text-center font-bold text-primary select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 9999, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-primary hover:bg-white/80 rounded-lg transition-all duration-200 active:scale-90 disabled:opacity-50"
                    disabled={quantity >= (product.stock || 9999)}
                  >
                    <span className="material-symbols-outlined text-sm select-none">add</span>
                  </button>
                </div>
              </div>

              {product.stock > 0 && product.stock < 10 && (
                <div className="text-error text-xs font-semibold mb-2">
                  Chỉ còn {product.stock} sản phẩm trong kho!
                </div>
              )}
              {product.stock === 0 && (
                <div className="text-error text-xs font-semibold mb-2">
                  Sản phẩm đã hết hàng!
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-primary-container to-primary hover:brightness-105 text-white py-4 rounded-xl font-label text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/10 border border-primary/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">shopping_bag</span>
                  {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                </button>
                
                {/* Glassy Favorite Button */}
                <button
                  onClick={handleFavoriteClick}
                  className={`w-14 h-14 border rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95 ${
                    isFavorite
                      ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-sm"
                      : "bg-slate-500/5 text-primary border-outline-variant/10 hover:bg-slate-500/15"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : undefined }}>
                    favorite
                  </span>
                </button>
              </div>
            </div>

            {/* Technical Documents Section */}
            {Array.isArray(product.documents) && product.documents.length > 0 && (
              <div className="bg-surface-container-low/60 rounded-xl p-5 border border-outline-variant/15 shadow-sm">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2 font-headline select-none">
                  <span className="material-symbols-outlined text-base">description</span>
                  Tài liệu kỹ thuật
                </h4>
                <div className="space-y-2">
                  {product.documents.map((doc: any, index: number) => {
                    const docUrl = doc.url || doc.href || "#";
                    const isPdf = docUrl.toLowerCase().endsWith('.pdf') || doc.type === 'pdf';
                    return (
                      <a
                        key={index}
                        className="flex items-center justify-between text-sm text-secondary hover:text-primary transition-colors group py-1"
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className={`material-symbols-outlined text-lg ${
                            isPdf ? "text-error" : "text-primary"
                          }`}>
                            {isPdf ? "picture_as_pdf" : "settings_applications"}
                          </span>
                          <span className="truncate">{doc.name || doc.title || 'Tài liệu không tên'}</span>
                        </span>
                        <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-all duration-200 text-base flex-shrink-0">
                          download
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Specs — dưới tài liệu, cùng bề ngang, 2 cột Thông số | Giá trị */}
            {specGroups.length > 0 && (
              <div className="bg-surface-container-low/60 rounded-xl p-5 border border-outline-variant/15 shadow-sm">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2 font-headline select-none">
                  <span className="material-symbols-outlined text-base">table_chart</span>
                  Thông số kỹ thuật
                </h4>
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="py-2 pr-3 font-semibold w-1/2">Thông số</th>
                      <th className="py-2 font-semibold w-1/2">Giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specGroups.flatMap((group, gIdx) =>
                      group.items.map((item, idx) => (
                        <tr
                          key={`${gIdx}-${idx}`}
                          className="border-b border-outline-variant/20 last:border-0"
                        >
                          <td className="py-2.5 pr-3 text-slate-600 font-medium align-top">
                            {group.category && idx === 0 ? (
                              <span className="block text-[10px] uppercase text-slate-400 mb-0.5">
                                {group.category}
                              </span>
                            ) : null}
                            {item.label}
                          </td>
                          <td className="py-2.5 text-slate-900 font-semibold align-top">
                            {item.value}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
        <section className="mt-16 mb-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-tertiary-fixed-dim font-bold tracking-widest text-xs uppercase mb-2 block select-none">
                Giải pháp đồng bộ
              </span>
              <h3 className="text-3xl font-headline font-bold text-primary select-none">
                Sản phẩm liên quan
              </h3>
            </div>
            <Link href="/" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline transition-all">
              Xem tất cả
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
