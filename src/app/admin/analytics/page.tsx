"use client";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Báo cáo & Phân tích</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Phân tích số liệu doanh thu, xu hướng bán hàng thiết bị năng lượng mặt trời.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[20px]">download</span>
          Xuất dữ liệu Excel
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-2">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">Doanh thu tháng này</span>
          <p className="text-3xl font-bold text-on-surface font-headline">485,200,000 đ</p>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            Tăng 18.4% so với tháng trước
          </p>
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-2">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">Giá trị trung bình / Đơn</span>
          <p className="text-3xl font-bold text-on-surface font-headline">24,500,000 đ</p>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            Khách ưu chuộng Combo Biến tần + Pin
          </p>
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-2">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">Tỷ lệ khách mua vãng lai (Guest)</span>
          <p className="text-3xl font-bold text-amber-600 font-headline">42.5%</p>
          <p className="text-xs text-on-surface-variant">Khách chọn mua nhanh không cần tạo tài khoản</p>
        </div>
      </div>

      {/* Main Charts Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-on-surface font-headline">Doanh thu theo danh mục</h2>
          <div className="h-64 bg-surface-container-low rounded-xl border border-dashed border-outline-variant flex items-center justify-center text-outline text-sm">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl mb-1">pie_chart</span>
              <p>Biểu đồ cơ cấu doanh thu (Biến tần, Pin Lithium, Tấm pin solar)</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-on-surface font-headline">Lượng đơn hàng theo khung giờ</h2>
          <div className="h-64 bg-surface-container-low rounded-xl border border-dashed border-outline-variant flex items-center justify-center text-outline text-sm">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl mb-1">show_chart</span>
              <p>Biểu đồ biến động đơn hàng trong ngày</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
