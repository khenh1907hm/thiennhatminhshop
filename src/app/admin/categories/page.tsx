"use client";

import { useState } from "react";

const mockCategories = [
  { id: "CAT-1", name: "Biến tần (Inverter)", count: 24, status: "Hiển thị" },
  { id: "CAT-2", name: "Pin lưu trữ (Battery)", count: 12, status: "Hiển thị" },
  { id: "CAT-3", name: "Tấm pin mặt trời", count: 8, status: "Hiển thị" },
  { id: "CAT-4", name: "Trạm sạc xe điện", count: 5, status: "Ẩn" },
];

const mockBrands = [
  { id: "BRD-1", name: "Siemens", products: 15 },
  { id: "BRD-2", name: "Schneider", products: 22 },
  { id: "BRD-3", name: "Omron", products: 10 },
  { id: "BRD-4", name: "LS Electric", products: 5 },
];

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Quản lý Danh mục & Thương hiệu</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Thiết lập cây danh mục sản phẩm và hãng sản xuất.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 active:scale-98">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "categories" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Danh mục sản phẩm
        </button>
        <button
          onClick={() => setActiveTab("brands")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "brands" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Hãng sản xuất (Brands)
        </button>
      </div>

      {/* Content */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        {activeTab === "categories" ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-outline uppercase tracking-wider">
                <th className="px-6 py-4">Tên danh mục</th>
                <th className="px-6 py-4">Số sản phẩm</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {mockCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="px-6 py-4 font-semibold text-on-surface">{cat.name}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{cat.count} SP</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      cat.status === "Hiển thị" ? "bg-emerald-100 text-emerald-800" : "bg-surface-container-high text-on-surface-variant"
                    }`}>
                      {cat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-on-surface-variant hover:text-primary rounded-lg">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-outline uppercase tracking-wider">
                <th className="px-6 py-4">Thương hiệu (Hãng)</th>
                <th className="px-6 py-4">Số sản phẩm</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {mockBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="px-6 py-4 font-semibold text-on-surface">{brand.name}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{brand.products} SP</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-on-surface-variant hover:text-primary rounded-lg">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
