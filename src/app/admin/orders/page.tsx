"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/context/NotificationContext";
import { formatPrice } from "@/lib/formatPrice";

interface OrderItem {
  id: string;
  quantity: number;
  price: number | string;
  product?: {
    id: string;
    name: string;
    sku: string;
    images?: string[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number | string;
  note?: string | null;
  createdAt: string;
  orderItems: OrderItem[];
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  } | null;
}

export default function AdminOrdersPage() {
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (error) {
      console.error(error);
      showNotification("Lỗi tải danh sách đơn hàng từ database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể cập nhật trạng thái");
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
      showNotification("Đã cập nhật trạng thái đơn hàng thành công", "success");
    } catch (error: any) {
      console.error(error);
      showNotification(error.message || "Lỗi cập nhật", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (!res.ok) throw new Error("Không thể cập nhật trạng thái thanh toán");

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: newPaymentStatus } : null));
      }
      showNotification("Đã cập nhật trạng thái thanh toán", "success");
    } catch (error: any) {
      console.error(error);
      showNotification(error.message || "Lỗi", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteCancelled = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Xóa vĩnh viễn đơn #${orderNumber}? Chỉ áp dụng đơn đã hủy.`)) return;
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không thể xóa đơn");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      showNotification("Đã xóa đơn hàng đã hủy", "success");
    } catch (error: any) {
      showNotification(error.message || "Lỗi xóa đơn", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Format currency
  const formatCurrency = (amount: number | string) => formatPrice(amount);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Status mapping
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-800 border-amber-200" };
      case "PROCESSING":
        return { label: "Đang xử lý", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "SHIPPED":
        return { label: "Đang vận chuyển", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      case "DELIVERED":
        return { label: "Giao thành công", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "CANCELLED":
        return { label: "Đã hủy", color: "bg-rose-100 text-rose-800 border-rose-200" };
      default:
        return { label: status, color: "bg-slate-100 text-slate-800 border-slate-200" };
    }
  };

  // KPI Calculations
  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((acc, o) => acc + (parseFloat(String(o.totalAmount)) || 0), 0);
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const shippingCount = orders.filter((o) => o.status === "PROCESSING" || o.status === "SHIPPED").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(term) ||
      order.customerName.toLowerCase().includes(term) ||
      order.customerPhone.toLowerCase().includes(term) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(term));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      showNotification("Không có đơn hàng để xuất file", "warning");
      return;
    }
    const headers = ["Mã Đơn", "Khách hàng", "SĐT", "Email", "Tổng tiền", "PT Thanh toán", "Trạng thái TT", "Trạng thái Đơn", "Ngày đặt", "Địa chỉ"];
    const rows = orders.map((o) => [
      o.orderNumber,
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.customerEmail || ''}"`,
      o.totalAmount,
      o.paymentMethod,
      o.paymentStatus,
      o.status,
      `"${formatDate(o.createdAt)}"`,
      `"${o.shippingAddress.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DonHang_TNM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[28px]">shopping_cart</span>
            <h1 className="text-2xl font-bold text-on-surface font-headline">
              Quản lý Đơn hàng (Đồng bộ Database)
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Theo dõi, cập nhật tiến trình và xử lý đơn đặt hàng trực tiếp từ hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold rounded-xl text-sm transition-all border border-outline-variant disabled:opacity-50"
            title="Làm mới dữ liệu từ database"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`}>
              sync
            </span>
            Làm mới
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-98"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Xuất file CSV / Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Tổng đơn hàng</span>
            <p className="text-xl font-bold text-on-surface font-headline mt-0.5">{orders.length}</p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">pending</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Chờ xử lý</span>
            <p className="text-xl font-bold text-amber-600 font-headline mt-0.5">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">local_shipping</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Đang vận chuyển</span>
            <p className="text-xl font-bold text-indigo-600 font-headline mt-0.5">{shippingCount}</p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Giao thành công</span>
            <p className="text-xl font-bold text-emerald-600 font-headline mt-0.5">{deliveredCount}</p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <span className="material-symbols-outlined text-2xl">payments</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Doanh thu đơn</span>
            <p className="text-base font-bold text-emerald-700 font-headline mt-0.5 truncate" title={formatCurrency(totalRevenue)}>
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="bg-surface rounded-2xl p-4 border border-outline-variant shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo Mã ĐH, Tên khách hàng, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-on-surface-variant shrink-0">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">Tất cả ({orders.length})</option>
            <option value="PENDING">Chờ xác nhận (PENDING)</option>
            <option value="PROCESSING">Đang xử lý (PROCESSING)</option>
            <option value="SHIPPED">Đang vận chuyển (SHIPPED)</option>
            <option value="DELIVERED">Giao thành công (DELIVERED)</option>
            <option value="CANCELLED">Đã hủy (CANCELLED)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl animate-spin text-primary">
              progress_activity
            </span>
            <p className="mt-2 text-sm font-medium">Đang tải danh sách đơn hàng từ database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl text-outline mb-2">
              remove_shopping_cart
            </span>
            <h3 className="text-base font-bold text-on-surface">Không có đơn hàng nào phù hợp</h3>
            <p className="text-xs mt-1">
              {orders.length === 0
                ? "Chưa có đơn hàng nào được tạo trong cơ sở dữ liệu."
                : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-outline uppercase tracking-wider">
                  <th className="px-6 py-4">Mã Đơn</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Ngày đặt</th>
                  <th className="px-6 py-4">Sản phẩm & Tổng tiền</th>
                  <th className="px-6 py-4">Thanh toán</th>
                  <th className="px-6 py-4">Trạng thái đơn</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-sm">
                {filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const itemCount = order.orderItems?.reduce((s, i) => s + i.quantity, 0) || 0;
                  const isUpdating = updatingId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                      {/* Mã đơn */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="font-mono font-bold text-primary hover:underline flex items-center gap-1 group"
                          title="Nhấp để xem chi tiết"
                        >
                          <span>{order.orderNumber}</span>
                          <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">
                            visibility
                          </span>
                        </button>
                      </td>

                      {/* Khách hàng */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-on-surface">{order.customerName}</p>
                        <p className="text-xs text-on-surface-variant font-mono">{order.customerPhone}</p>
                        {order.customerEmail && (
                          <p className="text-[11px] text-outline truncate max-w-[180px]">{order.customerEmail}</p>
                        )}
                      </td>

                      {/* Ngày đặt */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-on-surface-variant">
                        {formatDate(order.createdAt)}
                      </td>

                      {/* SL & Tổng tiền */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-bold text-on-surface text-base">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {itemCount} sản phẩm ({order.orderItems?.length || 0} món)
                        </p>
                      </td>

                      {/* Thanh toán */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-700 block uppercase">
                          {order.paymentMethod || "COD"}
                        </span>
                        <select
                          value={order.paymentStatus || "UNPAID"}
                          onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                          disabled={isUpdating}
                          className={`text-[11px] font-bold mt-1 px-2 py-0.5 rounded-full border outline-none cursor-pointer ${
                            order.paymentStatus === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : "bg-amber-50 text-amber-700 border-amber-300"
                          }`}
                        >
                          <option value="UNPAID">Chưa thanh toán</option>
                          <option value="PAID">Đã thanh toán</option>
                        </select>
                      </td>

                      {/* Trạng thái đơn - Trực tiếp cập nhật DB */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-all shadow-xs ${badge.color} ${
                            isUpdating ? "opacity-50 animate-pulse" : ""
                          }`}
                        >
                          <option value="PENDING">Chờ xác nhận</option>
                          <option value="PROCESSING">Đang xử lý</option>
                          <option value="SHIPPED">Đang vận chuyển</option>
                          <option value="DELIVERED">Giao thành công</option>
                          <option value="CANCELLED">Đã hủy</option>
                        </select>
                      </td>

                      {/* Thao tác */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 bg-surface-container-high hover:bg-primary hover:text-white text-on-surface text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1 shadow-xs"
                            title="Xem chi tiết đơn hàng"
                          >
                            <span className="material-symbols-outlined text-[16px]">info</span>
                            Chi tiết
                          </button>
                          {order.status === "CANCELLED" && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleDeleteCancelled(order.id, order.orderNumber)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1 border border-rose-200"
                              title="Xóa đơn đã hủy"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                              Xóa
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Chi tiết Đơn hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface w-full max-w-2xl rounded-2xl border border-outline-variant shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex justify-between items-center border-b border-outline-variant pb-4">
              <div>
                <h3 className="text-lg font-bold text-on-surface font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">receipt</span>
                  Chi tiết Đơn hàng: #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Đặt lúc {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Khách hàng & Giao hàng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant text-xs">
              <div>
                <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Thông tin khách hàng
                </span>
                <p className="font-bold text-sm text-on-surface">{selectedOrder.customerName}</p>
                <p className="text-on-surface-variant mt-0.5">📞 {selectedOrder.customerPhone}</p>
                {selectedOrder.customerEmail && (
                  <p className="text-on-surface-variant mt-0.5">✉️ {selectedOrder.customerEmail}</p>
                )}
              </div>
              <div>
                <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Địa chỉ nhận hàng
                </span>
                <p className="text-on-surface font-medium leading-relaxed">
                  {selectedOrder.shippingAddress || "Chưa có địa chỉ"}
                </p>
                {selectedOrder.note && (
                  <p className="text-amber-700 bg-amber-50 p-2 rounded-lg mt-2 border border-amber-200">
                    <strong>Ghi chú:</strong> {selectedOrder.note}
                  </p>
                )}
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-on-surface block mb-2">
                Sản phẩm trong đơn ({selectedOrder.orderItems?.length || 0} món)
              </span>
              <div className="border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant/60 max-h-60 overflow-y-auto">
                {selectedOrder.orderItems?.map((item) => {
                  const itemPrice = parseFloat(String(item.price)) || 0;
                  const itemTotal = itemPrice * item.quantity;
                  const prodImage = item.product?.images?.[0];

                  return (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs bg-surface">
                      <div className="flex items-center gap-3 min-w-0">
                        {prodImage ? (
                          <img
                            src={prodImage}
                            alt={item.product?.name || "Product"}
                            className="w-10 h-10 object-cover rounded-lg border border-outline-variant shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">inventory_2</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-on-surface truncate">
                            {item.product?.name || "Sản phẩm"}
                          </p>
                          <span className="text-[10px] text-outline font-mono">
                            SKU: {item.product?.sku || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-on-surface">
                          {formatCurrency(itemTotal)}
                        </p>
                        <p className="text-[11px] text-on-surface-variant">
                          {formatCurrency(itemPrice)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tổng cộng & Cập nhật nhanh */}
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-3">
              <div className="flex justify-between items-center text-sm font-bold border-b border-outline-variant/60 pb-2">
                <span>Tổng giá trị đơn hàng:</span>
                <span className="text-primary text-xl font-headline">
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Trạng thái Đơn hàng:
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="PENDING">Chờ xác nhận (PENDING)</option>
                    <option value="PROCESSING">Đang xử lý (PROCESSING)</option>
                    <option value="SHIPPED">Đang vận chuyển (SHIPPED)</option>
                    <option value="DELIVERED">Giao thành công (DELIVERED)</option>
                    <option value="CANCELLED">Đã hủy (CANCELLED)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Trạng thái Thanh toán ({selectedOrder.paymentMethod}):
                  </label>
                  <select
                    value={selectedOrder.paymentStatus || "UNPAID"}
                    onChange={(e) => handlePaymentStatusChange(selectedOrder.id, e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="UNPAID">Chưa thanh toán (UNPAID)</option>
                    <option value="PAID">Đã thanh toán (PAID)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold rounded-xl text-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
