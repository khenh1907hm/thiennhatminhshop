"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Không thể gửi mã"); return; }
    setSent(true);
  }
  return <PageShell><main className="flex flex-1 items-center justify-center p-4"><div className="w-full max-w-md rounded-3xl border border-outline-variant bg-surface-container-low p-8 shadow-xl"><h1 className="text-2xl font-bold text-on-surface">Quên mật khẩu</h1>{sent ? <div className="space-y-3"><p className="mt-3 text-sm text-on-surface-variant">Nếu email tồn tại, mã đặt lại mật khẩu đã được gửi.</p><Link href={`/reset-password?email=${encodeURIComponent(email)}`} className="inline-block font-semibold text-primary hover:underline">Nhập mã đặt lại mật khẩu</Link></div> : <form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-semibold text-on-surface">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm" /></label><button className="w-full rounded-xl bg-primary py-3 font-bold text-on-primary">Gửi mã qua email</button>{error && <p className="text-sm text-rose-600">{error}</p>}</form>}</div></main></PageShell>;
}

function PageShell({ children }: { children: React.ReactNode }) { return <div className="flex min-h-screen flex-col bg-surface"><Header />{children}<Footer /></div>; }
