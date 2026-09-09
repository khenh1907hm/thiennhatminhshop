"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import QuoteRequestSection from "@/components/home/QuoteRequestSection";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-8 py-10 w-full flex-grow space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          {/* <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Liên hệ &amp; giải pháp
          </span> */}
          <div className="flex justify-center py-2">
            <h1
              className="heading-dual text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 font-headline tracking-tight"
              data-en="Contact"
            >
              <span>TƯ VẤN GIẢI PHÁP</span>
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
            Hãy để lại thông tin nhu cầu của bạn — kỹ sư Thiên Nhật Minh sẽ tư vấn và gửi báo giá
            trong thời gian sớm nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-4">
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-4">
              <h2 className="text-base font-bold text-on-surface font-headline border-b border-outline-variant pb-3">
                Thông tin liên hệ
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block">Trụ sở chính:</span>
                    <span className="text-on-surface-variant">
                      75 Nguyễn Cửu Đàm, Phường Tân Sơn Nhì, TP. Hồ Chí Minh
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">call</span>
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block">Hotline tư vấn 24/7:</span>
                    <span className="text-primary font-bold">+84 983 449 446</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block">Email kỹ thuật:</span>
                    <span className="text-on-surface-variant">ng.luan@thiennhatminh.com</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 text-white space-y-2 shadow-md">
              <h3 className="font-bold text-sm font-headline">Thời gian làm việc</h3>
              <p className="text-xs text-slate-200">Thứ Hai - Thứ Bảy: 08:00 - 17:30</p>
              <p className="text-xs text-slate-200">Chủ Nhật: Hỗ trợ tư vấn khẩn cấp qua Hotline</p>
            </div>
          </div>

          <div className="md:col-span-7">
            <QuoteRequestSection
              variant="formOnly"
              sourceLabel="Yêu cầu báo giá từ trang Liên hệ"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
