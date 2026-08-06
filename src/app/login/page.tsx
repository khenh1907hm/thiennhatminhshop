"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginTab) {
      alert(`Đăng nhập thành công với tài khoản: ${email}`);
    } else {
      alert(`Đăng ký tài khoản thành công cho: ${name}`);
    }
    router.push("/");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-theme-bg">
      <div className="max-w-md w-full space-y-6 bg-surface p-8 rounded-3xl border border-outline-variant shadow-xl">
        {/* Header Tabs */}
        <div className="flex border-b border-outline-variant">
          <button
            onClick={() => setIsLoginTab(true)}
            className={`flex-1 pb-4 text-center text-sm font-semibold transition-all ${
              isLoginTab
                ? "text-primary border-b-2 border-primary font-headline"
                : "text-outline hover:text-on-surface"
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => setIsLoginTab(false)}
            className={`flex-1 pb-4 text-center text-sm font-semibold transition-all ${
              !isLoginTab
                ? "text-primary border-b-2 border-primary font-headline"
                : "text-outline hover:text-on-surface"
            }`}
          >
            Tạo Tài Khoản
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-on-surface font-headline">
            {isLoginTab ? "Chào mừng trở lại!" : "Đăng ký thành viên"}
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            {isLoginTab
              ? "Đăng nhập để theo dõi đơn hàng và lưu danh sách yêu thích"
              : "Tạo tài khoản để nhận ưu đãi và bảo hành chính hãng"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginTab && (
            <>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  placeholder="0909 123 456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Địa chỉ Email *</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-on-surface">Mật khẩu *</label>
              {isLoginTab && (
                <a href="#" className="text-xs text-primary hover:underline">
                  Quên mật khẩu?
                </a>
              )}
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-98"
          >
            {isLoginTab ? "Đăng Nhập" : "Đăng Ký Tài Khoản"}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-outline-variant"></div>
          <span className="flex-shrink mx-4 text-xs text-outline">Hoặc</span>
          <div className="flex-grow border-t border-outline-variant"></div>
        </div>

        {/* Guest Order Shortcut Notice */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
          <p className="text-xs text-amber-900 font-medium">Bạn muốn mua hàng ngay?</p>
          <p className="text-[11px] text-amber-800/80 mt-0.5">
            Không cần tài khoản! Bạn vẫn có thể mua hàng trực tiếp tại giỏ hàng bằng cách điền thông tin giao hàng.
          </p>
          <Link
            href="/cart"
            className="inline-block mt-2 text-xs font-bold text-amber-900 underline hover:text-primary transition-colors"
          >
            Đến Giỏ hàng & Thanh toán vãng lai ➔
          </Link>
        </div>
      </div>
    </div>
  );
}
