"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useNotification } from "@/context/NotificationContext";

export default function RegisterPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showNotification("Mật khẩu xác nhận không khớp!", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        showNotification(error, "error");
      } else {
        showNotification("Đăng ký thành công! Đang chuyển hướng...", "success");
        setTimeout(() => router.push("/login"), 1500);
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
            <h1 className="text-2xl font-bold text-on-surface font-headline">Đăng ký tài khoản</h1>
            <p className="text-sm text-on-surface-variant mt-2">Trở thành thành viên của Thiên Nhật Minh Eco</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Họ và tên</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-sm"
                placeholder="VD: Nguyễn Văn An"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-sm"
                placeholder="VD: example@gmail.com"
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
                placeholder="Ít nhất 6 ký tự"
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-sm"
                placeholder="Nhập lại mật khẩu"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-on-surface-variant">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Đăng nhập
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
