"use client";

const mockInventory = [
  { sku: "INV-5KW-SM", name: "Biến tần Siemens 5kW", stock: 45, threshold: 10, supplier: "Siemens VN" },
  { sku: "BAT-LFP-100", name: "Pin Lithium LFP 100Ah", stock: 3, threshold: 5, supplier: "TNM Eco Import" },
  { sku: "PNL-450W-MS", name: "Tấm pin Mono 450W", stock: 120, threshold: 50, supplier: "SolarTech" },
  { sku: "CAB-DC-4MM", name: "Cáp DC 4.0mm2 (Cuộn 1000m)", stock: 1, threshold: 2, supplier: "Cadivi" },
];

export default function AdminInventoryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Quản lý Kho & Nhà cung cấp</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Theo dõi tồn kho thực tế và thiết lập mức cảnh báo hết hàng.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-medium hover:bg-surface-container-low transition-colors shadow-sm">
            Nhà cung cấp
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
            <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
            Tạo phiếu nhập kho
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl p-5 border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant">Tổng mã hàng (SKU)</p>
            <p className="text-2xl font-bold text-on-surface font-headline">1,248</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl p-5 border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <span className="material-symbols-outlined animate-pulse">warning</span>
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant">Sắp hết hàng</p>
            <p className="text-2xl font-bold text-rose-600 font-headline">2 mã</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-outline uppercase tracking-wider">
                <th className="px-6 py-4">Sản phẩm / SKU</th>
                <th className="px-6 py-4">Tồn kho hiện tại</th>
                <th className="px-6 py-4">Định mức tối thiểu</th>
                <th className="px-6 py-4">Nhà cung cấp</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {mockInventory.map((item) => {
                const isLowStock = item.stock <= item.threshold;
                return (
                  <tr key={item.sku} className={`hover:bg-surface-container-low/60 transition-colors ${isLowStock ? 'bg-rose-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-on-surface">{item.name}</p>
                      <p className="text-xs text-outline font-mono mt-0.5">{item.sku}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-lg ${isLowStock ? "text-rose-600" : "text-emerald-600"}`}>
                          {item.stock}
                        </span>
                        {isLowStock && (
                          <span className="material-symbols-outlined text-rose-500 text-[16px]" title="Cần nhập hàng">
                            error
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant font-medium">
                      {item.threshold}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-surface-container-high rounded-md text-xs font-medium text-on-surface-variant">
                        {item.supplier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors text-sm font-semibold">
                        Điều chỉnh
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
