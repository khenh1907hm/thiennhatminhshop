"use client";

const mockPromotions = [
  { id: "PRO-1", code: "WELCOME10", discount: "10%", uses: "45/100", status: "Đang chạy", expiry: "2024-12-31" },
  { id: "PRO-2", code: "FREESHIP", discount: "Phí vận chuyển", uses: "210/∞", status: "Đang chạy", expiry: "Không giới hạn" },
  { id: "PRO-3", code: "SIEMENS20", discount: "20% (Chỉ Siemens)", uses: "100/100", status: "Đã hết", expiry: "2023-11-15" },
];

export default function AdminPromotionsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Mã giảm giá & Khuyến mãi</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Quản lý các chương trình Marketing và phát hành mã Voucher.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 active:scale-98">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo mã mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-outline uppercase tracking-wider">
                <th className="px-6 py-4">Mã CODE</th>
                <th className="px-6 py-4">Mức giảm</th>
                <th className="px-6 py-4">Đã dùng</th>
                <th className="px-6 py-4">Hạn sử dụng</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {mockPromotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-primary">{promo.code}</td>
                  <td className="px-6 py-4 font-medium text-on-surface">{promo.discount}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{promo.uses}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{promo.expiry}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      promo.status === "Đang chạy" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {promo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <label className="relative inline-flex items-center cursor-pointer mr-3">
                      <input type="checkbox" defaultChecked={promo.status === "Đang chạy"} className="sr-only peer" />
                      <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                    <button className="p-2 text-on-surface-variant hover:text-error rounded-lg" title="Xóa mã">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
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
