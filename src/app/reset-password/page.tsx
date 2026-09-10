"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function ResetPasswordContent() {
  const params = useSearchParams();
  const [form, setForm] = useState({ email: params.get("email") || "", code: "", password: "", confirm: "" });
  const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (form.password !== form.confirm) { setError("Mật khẩu xác nhận không khớp"); return; }
    const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email, code: form.code, password: form.password }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Không thể đặt lại mật khẩu"); return; }
    setMessage("Đặt lại mật khẩu thành công.");
  }
  return <PageShell><main className="flex flex-1 items-center justify-center p-4"><form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-3xl border border-outline-variant bg-surface-container-low p-8 shadow-xl"><h1 className="text-2xl font-bold text-on-surface">Đặt lại mật khẩu</h1><input required type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm" /><input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="Mã 6 số" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm tracking-[0.4em]" /><input required minLength={6} type="password" placeholder="Mật khẩu mới" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm" /><input required minLength={6} type="password" placeholder="Xác nhận mật khẩu mới" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm" /><button className="w-full rounded-xl bg-primary py-3 font-bold text-on-primary">Đặt lại mật khẩu</button>{message && <p className="text-sm text-emerald-600">{message} <Link href="/login" className="font-semibold underline">Đăng nhập</Link></p>}{error && <p className="text-sm text-rose-600">{error}</p>}</form></main></PageShell>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<PageShell><main className="flex flex-1 items-center justify-center" /></PageShell>}><ResetPasswordContent /></Suspense>;
}

function PageShell({ children }: { children: React.ReactNode }) { return <div className="flex min-h-screen flex-col bg-surface"><Header />{children}<Footer /></div>; }
