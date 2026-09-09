"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useNotification } from "@/context/NotificationContext";

export default function LoginPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        showNotification(res.error, "error");
      } else {
        const session = await getSession();
        let isAdmin = session?.user?.role === "ADMIN";

        if (!isAdmin && session?.user?.email) {
          const profileRes = await fetch("/api/user/profile");
          if (profileRes.ok) {
            const profile = await profileRes.json();
            isAdmin = profile.role === "ADMIN";
          }
        }

        showNotification("Đăng nhập thành công!", "success");
        router.push(isAdmin ? "/admin" : "/profile");
        router.refresh();
      }
    } catch (error) {
      showNotification("Đã có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface-container-low rounded-3xl p-8 border border-outline-variant shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-on-surface font-headline">Đăng nhập</h1>
            <p className="text-sm text-on-surface-variant mt-2">Đăng nhập để theo dõi đơn hàng của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-sm"
                placeholder="Ví dụ: example@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-sm"
                placeholder="Nhập mật khẩu của bạn"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-on-surface-variant">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
