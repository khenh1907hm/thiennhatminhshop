"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/context/NotificationContext";
import { formatPrice } from "@/lib/formatPrice";

interface CustomerUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "USER" | "ADMIN";
  phone?: string | null;
  address?: string | null;
  image?: string | null;
  createdAt: string;
  _count?: {
    orders: number;
  };
}

interface UserDetail extends CustomerUser {
  orders?: {
    id: string;
    orderNumber: string;
    totalAmount: number | string;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminCustomersPage() {
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Detail modal
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Create user modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "USER",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
      showNotification("Lỗi tải danh sách khách hàng từ database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể cập nhật vai trò");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null));
      }
      showNotification(`Đã cập nhật vai trò thành công: ${newRole}`, "success");
    } catch (error: any) {
      console.error(error);
      showNotification(error.message || "Lỗi cập nhật vai trò", "error");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${userName}" khỏi cơ sở dữ liệu?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể xóa tài khoản");
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showNotification("Đã xóa tài khoản thành công", "success");
    } catch (error: any) {
      console.error(error);
      showNotification(error.message || "Lỗi khi xóa tài khoản", "error");
    }
  };

  const handleViewDetail = async (userId: string) => {
    try {
      setLoadingDetail(true);
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error("Không thể tải thông tin chi tiết");
      const data = await res.json();
      setSelectedUser(data);
    } catch (error: any) {
      console.error(error);
      showNotification(error.message || "Lỗi tải chi tiết", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email.trim()) {
      showNotification("Vui lòng nhập email", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tạo tài khoản");

      showNotification("Tạo tài khoản thành công", "success");
      setCreateForm({ name: "", email: "", phone: "", address: "", role: "USER" });
      setIsCreateOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      showNotification(error.message || "Lỗi tạo tài khoản", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | string) => formatPrice(amount);

  // KPIs
  const totalUsers = users.length;
  const customerCount = users.filter((u) => u.role === "USER").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const withOrdersCount = users.filter((u) => (u._count?.orders || 0) > 0).length;

  // Filter
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (user.name && user.name.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.phone && user.phone.toLowerCase().includes(term));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[28px]">people</span>
            <h1 className="text-2xl font-bold text-on-surface font-headline">
              Quản lý Khách hàng & Người dùng
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Đồng bộ trực tiếp với bảng User trong cơ sở dữ liệu. Quản lý thông tin, phân quyền và lịch sử đặt hàng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
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
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-98"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Thêm người dùng mới
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">groups</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-on-surface-variant uppercase">Tổng người dùng</span>
            <p className="text-2xl font-bold text-on-surface font-headline mt-0.5">{totalUsers}</p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">person</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-on-surface-variant uppercase">Khách hàng (USER)</span>
            <p className="text-2xl font-bold text-emerald-600 font-headline mt-0.5">{customerCount}</p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-on-surface-variant uppercase">Quản trị viên (ADMIN)</span>
            <p className="text-2xl font-bold text-purple-600 font-headline mt-0.5">{adminCount}</p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">shopping_basket</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-on-surface-variant uppercase">Khách đã mua hàng</span>
            <p className="text-2xl font-bold text-amber-600 font-headline mt-0.5">{withOrdersCount}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-surface rounded-2xl p-4 border border-outline-variant shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo Tên, Email hoặc SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-on-surface-variant shrink-0">Phân quyền:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">Tất cả vai trò ({users.length})</option>
            <option value="USER">Khách hàng (USER)</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl animate-spin text-primary">
              progress_activity
            </span>
            <p className="mt-2 text-sm font-medium">Đang tải danh sách người dùng từ database...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl text-outline mb-2">
              person_off
            </span>
            <h3 className="text-base font-bold text-on-surface">Không tìm thấy người dùng nào</h3>
            <p className="text-xs mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bấm &quot;Thêm người dùng mới&quot;.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-outline uppercase tracking-wider">
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Thông tin liên hệ</th>
                  <th className="px-6 py-4">Phân quyền (Role)</th>
                  <th className="px-6 py-4">Đơn hàng</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-sm">
                {filteredUsers.map((user) => {
                  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();

                  return (
                    <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors">
                      {/* Người dùng */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name || "Avatar"}
                              className="w-10 h-10 rounded-full object-cover border border-outline-variant shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-base shrink-0">
                              {initial}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-on-surface truncate">
                              {user.name || "Chưa đặt tên"}
                            </p>
                            <p className="text-xs text-on-surface-variant truncate font-mono">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Liên hệ */}
                      <td className="px-6 py-4">
                        <p className="text-xs text-on-surface font-medium">
                          {user.phone ? `📞 ${user.phone}` : <span className="text-outline italic">Chưa có SĐT</span>}
                        </p>
                        <p className="text-xs text-on-surface-variant truncate max-w-[200px] mt-0.5">
                          {user.address ? `📍 ${user.address}` : <span className="text-outline italic">Chưa có địa chỉ</span>}
                        </p>
                      </td>

                      {/* Phân quyền - Cập nhật trực tiếp DB */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-all shadow-xs ${
                            user.role === "ADMIN"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          <option value="USER">Khách hàng (USER)</option>
                          <option value="ADMIN">Quản trị viên (ADMIN)</option>
                        </select>
                      </td>

                      {/* Số đơn hàng */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                          (user._count?.orders || 0) > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
                          {user._count?.orders || 0} đơn
                        </span>
                      </td>

                      {/* Ngày tạo */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-on-surface-variant">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Thao tác */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewDetail(user.id)}
                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                            title="Xem chi tiết & Lịch sử đơn hàng"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name || user.email || "Người dùng")}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa người dùng"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
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

      {/* MODAL: Thêm người dùng mới */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-2xl border border-outline-variant shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h3 className="text-base font-bold text-on-surface font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_add</span>
                Thêm người dùng mới vào Database
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-on-surface-variant hover:bg-surface-container-high rounded-lg"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    placeholder="0912345678"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                    Phân quyền (Role)
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:border-primary font-bold"
                  >
                    <option value="USER">Khách hàng (USER)</option>
                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  placeholder="Địa chỉ giao hàng mặc định..."
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-surface-container-high text-on-surface text-xs font-semibold rounded-xl hover:bg-surface-container-highest"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Tạo người dùng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Chi tiết người dùng & Lịch sử đơn hàng */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface w-full max-w-xl rounded-2xl border border-outline-variant shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h3 className="text-base font-bold text-on-surface font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_circle</span>
                Hồ sơ Người dùng & Đơn hàng
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 text-on-surface-variant hover:bg-surface-container-high rounded-lg"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* User Profile */}
            <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xl shrink-0">
                {(selectedUser.name || selectedUser.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-on-surface">{selectedUser.name || "Chưa đặt tên"}</p>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    selectedUser.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
                <p className="text-on-surface-variant">✉️ {selectedUser.email}</p>
                <p className="text-on-surface-variant">📞 {selectedUser.phone || "Chưa có SĐT"}</p>
                <p className="text-on-surface-variant">📍 {selectedUser.address || "Chưa có địa chỉ"}</p>
              </div>
            </div>

            {/* Orders List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">receipt_long</span>
                Lịch sử Đơn hàng ({selectedUser.orders?.length || 0} đơn)
              </h4>

              {selectedUser.orders && selectedUser.orders.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedUser.orders.map((o) => (
                    <div
                      key={o.id}
                      className="p-3 bg-surface-container-low rounded-xl border border-outline-variant flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-primary block">
                          #{o.orderNumber}
                        </span>
                        <span className="text-[11px] text-outline">
                          {formatDate(o.createdAt)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-on-surface block">
                          {formatCurrency(o.totalAmount)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-outline italic p-3 text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                  Người dùng này chưa có đơn hàng nào trong hệ thống.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-outline-variant">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold rounded-xl"
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
