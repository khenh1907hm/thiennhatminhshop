"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { addToCart } = useCart();
  const { showNotification } = useNotification();

  // Find current product
  const product = products.find((p) => p.id === id);

  // States
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState(false);

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

  // Fallback for detail images if not defined in mock
  const detailImages = product.detailImages || [product.image];
  const allImages = [product.image, ...detailImages.filter(img => img !== product.image)];

  // Filter related products
  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 3);

  // Handler to add to cart
  const handleAddToCart = () => {
    addToCart(product, quantity);
    showNotification(`Đã thêm ${quantity} x ${product.name} vào giỏ hàng thành công!`, "success");
  };

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      showNotification(`Đã thêm ${product.name} vào danh sách yêu thích!`, "info");
    } else {
      showNotification(`Đã xóa ${product.name} khỏi danh sách yêu thích.`, "info");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="max-w-screen-2xl mx-auto px-8 py-8 w-full flex-grow">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link href="/" className="hover:text-primary transition-colors">Sản phẩm</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="hover:text-primary cursor-pointer transition-colors">{product.brand}</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-on-surface font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Info Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Left Column: Product Images */}
          <div className="xl:col-span-7 space-y-6">
            <div className="aspect-square rounded-xl bg-white flex items-center justify-center p-12 relative overflow-hidden shadow-[0px_24px_48px_rgba(0,39,67,0.08)] border border-outline-variant/10">
              <img
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 hover:scale-103"
                src={selectedImage || product.image}
              />
              {product.inStock && (
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className="bg-tertiary-fixed/90 backdrop-blur-md text-on-tertiary-fixed px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-amber-500/10 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-on-tertiary-fixed rounded-full animate-pulse"></span>
                    Đang có hàng
                  </span>
                </div>
              )}
            </div>
            
            {/* Gallery thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
                {allImages.map((img, idx) => {
                  const isActive = (selectedImage === img) || (!selectedImage && idx === 0);
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`aspect-square w-24 shrink-0 snap-start rounded-lg p-2 cursor-pointer transition-all duration-300 border flex items-center justify-center ${
                        isActive
                          ? "border-amber-500 bg-white shadow-sm"
                          : "border-outline-variant/10 bg-surface-container-low/50 hover:bg-surface-container-high/50"
                      }`}
                    >
                      <img
                        alt={`Detail view ${idx + 1}`}
                        className="w-full h-full object-contain mix-blend-multiply"
                        src={img}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Purchase Details */}
          <div className="xl:col-span-5 flex flex-col justify-center">
            <span className="text-tertiary-fixed-dim font-bold tracking-widest text-xs uppercase mb-2">
              {product.brand} INDUSTRIAL GRADE
            </span>
            <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-headline font-bold text-[#0A3D62] dark:text-amber-500">
                {product.price}
              </span>
              {product.originalPrice && (
                <span className="text-slate-400 line-through text-lg">
                  {product.originalPrice}
                </span>
              )}
              {product.discount && (
                <span className="bg-error-container text-on-error-container px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                  {product.discount}
                </span>
              )}
            </div>

            <p className="text-sm text-secondary mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity Selector and Action Buttons */}
            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-6">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest w-24">
                  Số lượng
                </span>
                <div className="flex items-center bg-surface-container/60 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-outline-variant/10">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-primary hover:bg-white/80 rounded-lg transition-all duration-200 active:scale-90"
                  >
                    <span className="material-symbols-outlined text-sm select-none">remove</span>
                  </button>
                  <span className="w-12 text-center font-bold text-primary select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-primary hover:bg-white/80 rounded-lg transition-all duration-200 active:scale-90"
                  >
                    <span className="material-symbols-outlined text-sm select-none">add</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-primary-container to-primary hover:brightness-105 text-white py-4 rounded-xl font-label text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/10 border border-primary/20 active:scale-98"
                >
                  <span className="material-symbols-outlined">shopping_bag</span>
                  Thêm vào giỏ hàng
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
            {product.documents && (
              <div className="bg-surface-container-low/60 backdrop-blur-sm rounded-xl p-6 border border-outline-variant/10 shadow-sm">
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2 font-headline select-none">
                  <span className="material-symbols-outlined text-base">description</span>
                  Tài liệu kỹ thuật
                </h4>
                <div className="space-y-3">
                  {product.documents.map((doc, index) => (
                    <a
                      key={index}
                      className="flex items-center justify-between text-sm text-secondary hover:text-primary transition-colors group py-1"
                      href={doc.href}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-lg ${
                          doc.type === "pdf" ? "text-error" : "text-primary"
                        }`}>
                          {doc.type === "pdf" ? "picture_as_pdf" : "settings_applications"}
                        </span>
                        {doc.title}
                      </span>
                      <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-all duration-200 text-base transform translate-x-1 group-hover:translate-x-0">
                        download
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bento Specifications Grid */}
        {product.specs && (
          <div className="mt-20">
            <h2 className="text-2xl font-headline font-bold text-primary mb-8 border-l-4 border-tertiary-fixed-dim pl-4 select-none">
              Thông số kỹ thuật chi tiết
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 overflow-hidden rounded-2xl border border-outline-variant/10 shadow-sm">
              {/* Box 1 */}
              <div className="bg-surface-container-low/75 backdrop-blur-sm p-8 hover:bg-surface-container-low transition-colors duration-300">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-4 block font-headline">
                  {product.specs.category1}
                </span>
                <div className="space-y-6">
                  {product.specs.specs1.map((item, idx) => (
                    <div key={idx} className="transition-all duration-300 hover:translate-x-1">
                      <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                      <p className="text-lg font-headline font-medium text-primary">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Box 2 */}
              <div className="bg-surface-container/75 backdrop-blur-sm p-8 hover:bg-surface-container transition-colors duration-300">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-4 block font-headline">
                  {product.specs.category2}
                </span>
                <div className="space-y-6">
                  {product.specs.specs2.map((item, idx) => (
                    <div key={idx} className="transition-all duration-300 hover:translate-x-1">
                      <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                      <p className="text-lg font-headline font-medium text-primary">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 3 */}
              <div className="bg-surface-container-high/75 backdrop-blur-sm p-8 hover:bg-surface-container-high transition-colors duration-300">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-4 block font-headline">
                  {product.specs.category3}
                </span>
                <div className="space-y-6">
                  {product.specs.specs3.map((item, idx) => (
                    <div key={idx} className="transition-all duration-300 hover:translate-x-1">
                      <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                      <p className="text-lg font-headline font-medium text-primary">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews & Ratings Section */}
        <section className="mt-20">
          <h2 className="text-2xl font-headline font-bold text-primary mb-8 border-l-4 border-amber-500 pl-4 select-none">
            Đánh giá & Nhận xét
          </h2>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/20 flex flex-col items-center justify-center text-center shadow-sm h-fit">
              <h3 className="text-5xl font-black text-primary font-headline mb-2">4.8</h3>
              <div className="flex gap-1 text-amber-500 mb-2">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Dựa trên 12 đánh giá</p>
              
              <button className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-md">
                Viết đánh giá
              </button>
            </div>

            {/* Review List */}
            <div className="xl:col-span-2 space-y-4">
              {/* Mock Review 1 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                      H
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Hoàng Minh</p>
                      <div className="flex gap-1 text-amber-500 text-[10px]">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">2 ngày trước</span>
                </div>
                <p className="text-sm text-slate-600">Sản phẩm rất tốt, giao hàng nhanh chóng và đóng gói cẩn thận. Tôi đã lắp đặt và hoạt động rất trơn tru.</p>
              </div>

              {/* Mock Review 2 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                      T
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Trần Văn A</p>
                      <div className="flex gap-1 text-amber-500 text-[10px]">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-sm text-slate-300" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">1 tuần trước</span>
                </div>
                <p className="text-sm text-slate-600">Khá hài lòng với chất lượng. Sẽ ủng hộ shop thêm trong tương lai. Hỗ trợ kỹ thuật nhiệt tình.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products Grid */}
        <section className="mt-24 mb-16">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
