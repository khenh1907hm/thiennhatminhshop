"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [allowGuestCheckout, setAllowGuestCheckout] = useState(true);
  const [storeName, setStoreName] = useState("Thiên Nhật Minh Eco");
  const [hotline, setHotline] = useState("0909 123 456");
  const [email, setEmail] = useState("contact@thiennhatminheco.vn");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Đã lưu cấu hình hệ thống thành công!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-on-surface font-headline">Cài đặt hệ thống</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Cấu hình chung cửa hàng, chính sách bán hàng & phương thức thanh toán.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Guest Checkout Policy Settings */}
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-on-surface border-b border-outline-variant pb-3 font-headline">
            Chính sách đặt hàng (Checkout)
          </h2>

          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant">
            <div>
              <p className="font-semibold text-on-surface text-sm">Cho phép mua hàng không cần đăng nhập (Guest Checkout)</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Khách hàng chỉ cần nhập đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng để mua hàng nhanh.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowGuestCheckout}
                onChange={(e) => setAllowGuestCheckout(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Tax Configuration Settings */}
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-on-surface border-b border-outline-variant pb-3 font-headline">
            Cấu hình Thuế (Tax Settings)
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant">
              <div>
                <p className="font-semibold text-on-surface text-sm">Bao gồm thuế trong giá sản phẩm</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Nếu bật, giá hiển thị trên website đã bao gồm thuế (Ví dụ: Giá bán đã bao gồm 10% VAT).
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Tên loại thuế chính</label>
                <input
                  type="text"
                  defaultValue="VAT"
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Mức thuế mặc định (%)</label>
                <input
                  type="number"
                  defaultValue="10"
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Store General Information */}
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-on-surface border-b border-outline-variant pb-3 font-headline">
            Thông tin doanh nghiệp / Cửa hàng
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Tên cửa hàng</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Hotline tư vấn & Hỗ trợ</label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-on-surface mb-1">Email nhận đơn hàng</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
          >
            Lưu cài đặt
          </button>
        </div>
      </form>
    </div>
  );
}
