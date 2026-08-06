"use client";

import { useState } from "react";

export default function AdminShippingPage() {
  const [freeshipThreshold, setFreeshipThreshold] = useState("10,000,000");

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface font-headline">Cấu hình Vận chuyển (Shipping)</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Cài đặt chi phí giao hàng theo khu vực và chính sách miễn phí vận chuyển.
        </p>
      </div>

      {/* Freeship Policy */}
      <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-on-surface border-b border-outline-variant pb-3 font-headline flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">local_shipping</span>
          Chính sách Miễn phí Giao hàng (Freeship)
        </h2>

        <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant">
          <div>
            <p className="font-semibold text-on-surface text-sm">Kích hoạt Freeship tự động</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Hệ thống sẽ tự động trừ phí ship khi giỏ hàng đạt giá trị tối thiểu.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked={true} className="sr-only peer" />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Giá trị đơn hàng tối thiểu để được Freeship (VNĐ)</label>
          <input
            type="text"
            value={freeshipThreshold}
            onChange={(e) => setFreeshipThreshold(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary font-bold"
          />
        </div>
      </div>

      {/* Shipping Zones */}
      <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant pb-3">
          <h2 className="text-lg font-semibold text-on-surface font-headline flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">map</span>
            Biểu phí Khu vực
          </h2>
          <button className="text-sm font-semibold text-primary hover:underline">
            + Thêm khu vực mới
          </button>
        </div>

        <div className="space-y-3">
          {/* Zone 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-outline-variant rounded-xl items-center hover:border-primary transition-colors">
            <div>
              <p className="font-semibold text-on-surface">Nội thành TP.HCM</p>
              <p className="text-xs text-on-surface-variant">Các quận nội thành phố.</p>
            </div>
            <div>
              <input type="text" defaultValue="30,000" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="text-right">
              <button className="text-error text-sm font-medium hover:underline">Xóa</button>
            </div>
          </div>

          {/* Zone 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-outline-variant rounded-xl items-center hover:border-primary transition-colors">
            <div>
              <p className="font-semibold text-on-surface">Các tỉnh thành khác</p>
              <p className="text-xs text-on-surface-variant">Vận chuyển qua Viettel Post / GHTK</p>
            </div>
            <div>
              <input type="text" defaultValue="50,000" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="text-right">
              <button className="text-error text-sm font-medium hover:underline">Xóa</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
          Lưu cài đặt vận chuyển
        </button>
      </div>
    </div>
  );
}
