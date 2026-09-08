"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useNotification } from "@/context/NotificationContext";
import { formatPrice } from "@/lib/formatPrice";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showNotification } = useNotification();
  
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Form States
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, ordersRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/orders")
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
        setFormData({
          name: profileData.name || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
        });
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        setIsEditing(false);
        showNotification("Cập nhật thông tin thành công!", "success");
      } else {
        showNotification("Lỗi cập nhật thông tin", "error");
      }
    } catch (error) {
      showNotification("Lỗi cập nhật thông tin", "error");
    }
  };

  const formatCurrency = (val: string | number) => formatPrice(val);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      
      <main className="flex-1 max-w-screen-xl mx-auto px-4 sm:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary font-headline">Hồ sơ cá nhân</h1>
          <p className="text-sm text-on-surface-variant mt-1">Quản lý thông tin và theo dõi đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
                <h2 className="text-lg font-bold text-on-surface font-headline">Thông tin của tôi</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-primary text-sm font-semibold hover:underline"
                >
                  {isEditing ? "Hủy" : "Chỉnh sửa"}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Họ và tên</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Địa chỉ giao hàng</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm min-h-[80px]"
                    />
                  </div>
                  <button type="submit" className="w-full py-2 bg-primary text-on-primary rounded-lg font-bold text-sm">
                    Lưu thay đổi
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="block text-xs text-outline mb-0.5">Họ và tên</span>
                    <span className="font-semibold">{profile?.name || "Chưa cập nhật"}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-outline mb-0.5">Email</span>
                    <span className="font-semibold">{profile?.email}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-outline mb-0.5">Số điện thoại</span>
                    <span className="font-semibold">{profile?.phone || "Chưa cập nhật"}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-outline mb-0.5">Địa chỉ giao hàng mặc định</span>
                    <span className="font-semibold">{profile?.address || "Chưa cập nhật"}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-outline mb-0.5">Ngày tham gia</span>
                    <span className="font-semibold">{new Date(profile?.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order History */}
          <div className="lg:col-span-2">
            <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant shadow-sm h-full">
              <h2 className="text-lg font-bold text-on-surface font-headline border-b border-outline-variant pb-4 mb-6">
                Lịch sử đơn hàng
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">inventory_2</span>
                  <p className="text-on-surface-variant text-sm">Bạn chưa có đơn hàng nào.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div key={order.id} className="border border-outline-variant rounded-xl p-4 bg-surface hover:border-primary/50 transition-colors">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-outline-variant/50">
                        <div>
                          <div className="font-bold text-primary font-headline">#{order.orderNumber}</div>
                          <div className="text-xs text-on-surface-variant mt-1">
                            {new Date(order.createdAt).toLocaleString("vi-VN")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-on-surface">{formatCurrency(order.totalAmount)}</div>
                          <div className={`text-xs font-semibold inline-block px-2 py-1 rounded-full mt-1 ${
                            order.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                            order.status === "PROCESSING" ? "bg-blue-100 text-blue-700" :
                            order.status === "SHIPPED" ? "bg-purple-100 text-purple-700" :
                            order.status === "DELIVERED" ? "bg-emerald-100 text-emerald-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {order.status}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.orderItems.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-surface-container border border-outline-variant rounded flex items-center justify-center p-1">
                              <img src={item.product.images?.[0] || 'https://via.placeholder.com/150'} alt={item.product.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold line-clamp-1">{item.product.name}</div>
                              <div className="text-xs text-on-surface-variant">
                                {formatCurrency(item.price)} x {item.quantity}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
