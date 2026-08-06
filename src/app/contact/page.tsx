"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    solution: "solar-home",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-8 py-10 w-full flex-grow space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Liên Hệ & Báo Giá</span>
          <h1 className="text-3xl font-bold text-on-surface font-headline">Tư Vấn Giải Pháp Năng Lượng Thiên Nhật Minh</h1>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Hãy để lại thông tin nhu cầu của bạn, các kỹ sư điện mặt trời của chúng tôi sẽ tính toán công suất và gửi báo giá chi tiết trong vòng 24 giờ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Contact Information Cards */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-4">
              <h2 className="text-base font-bold text-on-surface font-headline border-b border-outline-variant pb-3">Thông Tin Liên Hệ</h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block">Trụ sở chính:</span>
                    <span className="text-on-surface-variant">Số 123 Nguyễn Văn Cừ, Phường 2, Quận 5, TP. Hồ Chí Minh</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">call</span>
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block">Hotline Tư Vấn 24/7:</span>
                    <span className="text-primary font-bold">0909 123 456 - 1900-VOLT-ECO</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block">Email Kỹ Thuật:</span>
                    <span className="text-on-surface-variant">contact@thiennhatminheco.vn</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-cyan-800 rounded-2xl p-6 text-white space-y-2 shadow-md">
              <h3 className="font-bold text-sm font-headline">Thời Gian Làm Việc</h3>
              <p className="text-xs text-blue-100">Thứ Hai - Thứ Bảy: 08:00 - 17:30</p>
              <p className="text-xs text-blue-100">Chủ Nhật: Hỗ trợ tư vấn khẩn cấp qua Hotline</p>
            </div>
          </div>

          {/* Contact Request Form */}
          <div className="md:col-span-7">
            <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-outline-variant shadow-sm space-y-6">
              {submitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-3xl">check</span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface font-headline">Gửi Yêu Cầu Thành Công!</h3>
                  <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                    Kỹ sư Thiên Nhật Minh Eco sẽ liên hệ với <span className="font-semibold text-on-surface">{formData.name}</span> qua SĐT <span className="font-semibold text-on-surface">{formData.phone}</span> sớm nhất.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-base font-bold text-on-surface font-headline border-b border-outline-variant pb-3">Form Nhận Tư Vấn Mẫu</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">Họ và tên *</label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Nguyễn Văn A"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">Số điện thoại *</label>
                      <input
                        type="tel"
                        required
                        placeholder="VD: 0909 123 456"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Giải pháp quan tâm</label>
                    <select
                      value={formData.solution}
                      onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="solar-home">Điện mặt trời mái nhà hộ gia đình</option>
                      <option value="solar-business">Hệ thống năng lượng doanh nghiệp / Nhà xưởng</option>
                      <option value="battery">Pin lưu trữ Lithium PowerWall</option>
                      <option value="ev">Trạm sạc xe điện EV Charger</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Nội dung chi tiết nhu cầu</label>
                    <textarea
                      rows={4}
                      placeholder="Nhập diện tích mái, hóa đơn tiền điện trung bình hàng tháng..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                  >
                    Gửi Yêu Cầu Tư Vấn
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
