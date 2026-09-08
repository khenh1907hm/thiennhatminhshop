"use client";

import Link from "next/link";

export default function AdminReviewsPage() {
  return (
    <div className="max-w-xl mx-auto my-16 bg-surface p-8 rounded-2xl border border-outline-variant shadow-sm text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-3xl">visibility_off</span>
      </div>
      <h1 className="text-xl font-bold text-on-surface font-headline">
        Tính năng Đánh giá đã được tắt
      </h1>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        Phần đánh giá & nhận xét sản phẩm hiện đã được gỡ bỏ khỏi giao diện người dùng và trang quản trị theo yêu cầu hệ thống.
      </p>
      <div className="pt-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Về Trang Tổng quan Admin
        </Link>
      </div>
    </div>
  );
}
