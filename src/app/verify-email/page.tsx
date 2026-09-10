"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [pendingPassword] = useState(() => typeof window === "undefined" ? "" : sessionStorage.getItem("pendingRegistrationPassword") || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    const response = await fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Mã không hợp lệ"); return; }
    const login = pendingPassword
      ? await signIn("credentials", { redirect: false, email, password: pendingPassword })
      : { error: "missing-password" };
    sessionStorage.removeItem("pendingRegistrationPassword");
    if (login?.error) {
      setMessage("Xác minh thành công. Vui lòng đăng nhập để tiếp tục.");
      setTimeout(() => router.push("/login"), 1200);
      return;
    }
    setMessage("Xác minh thành công. Đang đăng nhập...");
    setTimeout(() => router.push("/account/"), 500);
  }

  return <PageShell><main className="flex flex-1 items-center justify-center p-4"><form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-3xl border border-outline-variant bg-surface-container-low p-8 shadow-xl"><h1 className="text-2xl font-bold text-on-surface">Xác minh email</h1><p className="text-sm text-on-surface-variant">Nhập mã 6 số đã gửi đến email của bạn.</p><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm" /><input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} placeholder="Mã 6 số" className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm tracking-[0.4em]" /><button className="w-full rounded-xl bg-primary py-3 font-bold text-on-primary">Xác minh email</button>{message && <p className="text-sm text-emerald-600">{message}</p>}{error && <p className="text-sm text-rose-600">{error}</p>}</form></main></PageShell>;
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<PageShell><main className="flex flex-1 items-center justify-center" /></PageShell>}><VerifyEmailContent /></Suspense>;
}

function PageShell({ children }: { children: React.ReactNode }) { return <div className="flex min-h-screen flex-col bg-surface"><Header />{children}<Footer /></div>; }
