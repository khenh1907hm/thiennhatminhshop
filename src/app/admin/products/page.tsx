"use client";

import Link from "next/link";
import { useState } from "react";
import { products as initialProducts } from "@/data/products";

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Quản lý sản phẩm</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Quản lý danh sách, thông số và giá sản phẩm thiết bị năng lượng.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 active:scale-98"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm sản phẩm mới
        </Link>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="bg-surface rounded-2xl p-4 border border-outline-variant shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="SIEMENS">Siemens</option>
            <option value="SCHNEIDER CHÍNH HÃNG GIÁ RẺ">Schneider</option>
            <option value="DÂY ĐIỆN - CÁP ĐIỆN">Cáp điện</option>
            <option value="ĐÈN LED">Đèn LED</option>
            <option value="OMRON">Omron</option>
            <option value="CONTACTOR KHỞI ĐỘNG TỪ">Contactor</option>
          </select>

          <button className="flex items-center gap-2 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface font-medium hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Bộ lọc
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-outline uppercase tracking-wider">
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Hãng</th>
                <th className="px-6 py-4">Giá niêm yết</th>
                <th className="px-6 py-4">Tồn kho</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-surface-container-low/60 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high overflow-hidden shrink-0 border border-outline-variant relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <Link href={`/admin/products/${product.id}`} className="font-semibold text-on-surface hover:text-primary transition-colors line-clamp-1">
                          {product.name}
                        </Link>
                        <span className="text-xs text-outline font-mono">{product.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant font-medium">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    <span className="px-2.5 py-1 bg-surface-container-high rounded-md text-xs font-medium">
                      {product.brand}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-on-surface font-headline">
                      {product.price}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.inStock ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {product.inStock ? "Còn hàng" : "Hết hàng"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Link>
                      <button
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
                        title="Xóa sản phẩm"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
