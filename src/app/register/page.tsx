"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useNotification } from "@/context/NotificationContext";

export default function RegisterPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [rateLimitUntil, setRateLimitUntil] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!rateLimitUntil) {
      setRemainingSeconds(0);
      return;
    }

    const updateCountdown = () => {
      const nextValue = Math.max(0, Math.ceil((rateLimitUntil - Date.now()) / 1000));
      setRemainingSeconds(nextValue);

      if (nextValue <= 0) {
        setRateLimitUntil(null);
      }
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [rateLimitUntil]);

  const isRateLimited = remainingSeconds > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRateLimited) return;
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
        const body = await res.json().catch(() => ({}));

        if (res.status === 429) {
          const waitSeconds = Number(body.retryAfterSeconds ?? res.headers.get("Retry-After") ?? 0);
          const safeWaitSeconds = Number.isFinite(waitSeconds) && waitSeconds > 0 ? waitSeconds : 900;
          setRateLimitUntil(Date.now() + safeWaitSeconds * 1000);
          showNotification(
            `Bạn đã thử quá nhiều lần. Vui lòng chờ ${safeWaitSeconds} giây trước khi đăng ký lại.`,
            "error",
          );
          return;
        }

        showNotification(body.error || "Đăng ký thất bại", "error");
      } else {
        showNotification("Đăng ký thành công! Đang chuyển hướng...", "success");
        sessionStorage.setItem("pendingRegistrationPassword", formData.password);
        setTimeout(() => router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`), 800);
      }
    } catch {
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

            {isRateLimited && (
              <p className="text-sm text-red-600 font-medium">
                Bạn đang bị giới hạn đăng ký. Vui lòng chờ thêm {remainingSeconds} giây trước khi thử lại.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || isRateLimited}
              className="w-full py-3 mt-4 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : isRateLimited ? `Thử lại sau ${remainingSeconds}s` : "Đăng ký"}
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
