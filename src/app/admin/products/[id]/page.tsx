"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import { products } from "@/data/products";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    originalPrice: "",
    brand: "SIEMENS",
    category: "SIEMENS",
    inStock: true,
    description: "",
    power: "5kw",
    waterResistance: "IP65",
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Find the product by ID
    const product = products.find((p) => p.id === id);
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        price: product.price || "",
        originalPrice: product.originalPrice || "",
        brand: product.brand || "SIEMENS",
        category: product.category || "SIEMENS",
        inStock: product.inStock,
        description: product.description || "",
        power: "5kw", // Mock property since not on schema
        waterResistance: "IP65", // Mock property
      });
    }
    setIsLoading(false);
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      showNotification("Đã cập nhật sản phẩm thành công!", "success");
      router.push("/admin/products");
    }, 600);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-outline">Đang tải thông tin...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant hover:text-primary"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Chỉnh sửa sản phẩm</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Cập nhật thông tin cho mã: <span className="font-mono text-primary font-bold">{formData.sku}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold font-headline text-on-surface mb-4">Thông tin cơ bản</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Tên sản phẩm *</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập tên thiết bị..."
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Mã SKU *</label>
                  <input
                    required
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="Ví dụ: SM-TX-45091"
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Hãng sản xuất</label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    <option value="SIEMENS">Siemens</option>
                    <option value="SCHNEIDER">Schneider</option>
                    <option value="CADIVI">Cadivi</option>
                    <option value="PANASONIC">Panasonic</option>
                    <option value="OMRON">Omron</option>
                    <option value="LS ELECTRIC">LS Electric</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Mô tả sản phẩm</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Nhập mô tả kỹ thuật chi tiết..."
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold font-headline text-on-surface mb-4">Thông số nổi bật</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Công suất</label>
                <select
                  name="power"
                  value={formData.power}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="5kw">Dưới 5kW</option>
                  <option value="10kw">5kW - 10kW</option>
                  <option value="15kw">10kW - 15kW</option>
                  <option value="20kw">Trên 15kW</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Chuẩn chống nước</label>
                <select
                  name="waterResistance"
                  value={formData.waterResistance}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="IP65">IP65</option>
                  <option value="IP67">IP67</option>
                  <option value="IP68">IP68</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold font-headline text-on-surface mb-4">Trạng thái & Giá</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Giá niêm yết (VNĐ) *</label>
                <input
                  required
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="VD: 24.500.000"
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Giá gốc (Tùy chọn)</label>
                <input
                  type="text"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="VD: 28.000.000"
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-sm font-semibold text-on-surface">Tình trạng kho</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-3 text-sm font-medium text-on-surface-variant">
                    {formData.inStock ? "Còn hàng" : "Hết hàng"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold font-headline text-on-surface mb-4">Hình ảnh</h2>
            
            <div className="w-full h-40 border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center text-outline bg-surface-container-low/50 hover:bg-surface-container-low transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-4xl mb-2">cloud_upload</span>
              <p className="text-sm font-medium">Nhấn để thay ảnh</p>
              <p className="text-xs mt-1">PNG, JPG, WEBP lên đến 5MB</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="lg:col-span-3 flex items-center justify-end gap-4 pt-6 border-t border-outline-variant mt-2">
          <Link
            href="/admin/products"
            className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-95"
          >
            Cập nhật sản phẩm
          </button>
        </div>
      </form>
    </div>
  );
}
