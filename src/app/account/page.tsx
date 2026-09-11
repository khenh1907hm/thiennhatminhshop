"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import OrderHistory from "@/components/account/OrderHistory";
import { useNotification } from "@/context/NotificationContext";
import { parseAddressOption, parseAddressOptions, type AddressOption } from "@/lib/address";

type Profile = { name: string | null; email: string | null; phone: string | null; address: string | null; createdAt: string };
type Tab = "profile" | "orders" | "addresses";
function AccountContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<Tab>(searchParams.get("tab") === "orders" ? "orders" : "profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    fetch("/api/user/profile")
      .then(async (response) => { if (!response.ok) throw new Error("Không thể tải hồ sơ"); return response.json(); })
      .then((data: Profile) => { setProfile(data); setFormData({ name: data.name || "", phone: data.phone || "", address: data.address || "" }); })
      .catch(() => showNotification("Không thể tải thông tin tài khoản", "error"))
      .finally(() => setLoading(false));
  }, [status, router, showNotification]);

  async function updateProfile(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/user/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
    if (!response.ok) { showNotification("Lỗi cập nhật thông tin", "error"); return; }
    setProfile((current) => current ? { ...current, ...formData } : current);
    setEditing(false);
    showNotification("Cập nhật thông tin thành công", "success");
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { showNotification("Mật khẩu xác nhận không khớp", "error"); return; }
    const response = await fetch("/api/user/password", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(passwordForm) });
    const data = await response.json();
    if (!response.ok) { showNotification(data.error || "Không thể đổi mật khẩu", "error"); return; }
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    showNotification("Đổi mật khẩu thành công", "success");
  }

  if (status === "loading" || loading) return <PageShell><main className="flex flex-1 items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></main></PageShell>;
  if (!session || !profile) return null;

  const tabs: Array<{ key: Tab; label: string; icon: string }> = [
    { key: "profile", label: "Tổng quan", icon: "person" },
    { key: "orders", label: "Lịch sử mua hàng", icon: "receipt_long" },
    { key: "addresses", label: "Tra cứu bảo hành", icon: "shield" },
  ];

  return <PageShell><main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-4 px-4 py-6 sm:px-8">
    <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:flex-row">
      <div className="flex flex-1 items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-500"><span className="material-symbols-outlined text-4xl">face</span></div><div><h1 className="text-lg font-bold text-slate-800">{profile.name || session.user?.name || "Khách hàng"}</h1><span className="mt-1 block text-xs text-slate-500">{profile.phone || "Chưa cập nhật số điện thoại"}</span></div></div>
      <div className="hidden h-16 w-px bg-slate-200 md:block" /><div className="flex flex-1 items-center justify-center gap-2"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500"><span className="material-symbols-outlined">account_circle</span></div><div><p className="text-sm font-bold text-slate-800">Tài khoản của tôi</p><p className="text-xs text-slate-500">Quản lý thông tin và đơn hàng</p></div></div>
    </div>
    <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
      <aside><div className="space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">{tabs.map((tab) => <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${activeTab === tab.key ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}><span className="material-symbols-outlined text-[20px]">{tab.icon}</span>{tab.label}</button>)}</div></aside>
      <div className="space-y-4 md:col-span-3">
        {activeTab === "orders" && <><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-800">Lịch sử mua hàng</h2><p className="mt-1 text-sm text-slate-500">Theo dõi trạng thái đơn hàng, thanh toán và giao hàng.</p></div><OrderHistory /></>}
        {activeTab === "profile" && <><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-bold text-slate-800">Hỗ trợ</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Support icon="support_agent" title="Tư vấn mua hàng (7h30 - 22h00)" phone="+84 983 449 446" /><Support icon="report_problem" title="Khiếu nại (8h00 - 21h30)" phone="+84 983 449 446" /></div></div><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-800">Thông tin tài khoản</h2><button onClick={() => setEditing((value) => !value)} className="text-sm font-semibold text-blue-600 hover:underline">{editing ? "Hủy" : "Chỉnh sửa"}</button></div>{editing ? <form onSubmit={updateProfile} className="space-y-4"><Field label="Họ và tên" value={formData.name} onChange={(value) => setFormData({ ...formData, name: value })} /><Field label="Số điện thoại" value={formData.phone} onChange={(value) => setFormData({ ...formData, phone: value })} /><DefaultAddressFields value={formData.address} onChange={(value) => setFormData({ ...formData, address: value })} /><button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">Lưu thay đổi</button></form> : <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2"><Info label="Họ và tên" value={profile.name || "Chưa cập nhật"} /><Info label="Email" value={profile.email || "Chưa cập nhật"} /><Info label="Số điện thoại" value={profile.phone || "Chưa cập nhật"} /><Info label="Ngày tham gia" value={new Date(profile.createdAt).toLocaleDateString("vi-VN")} /><Info label="Địa chỉ giao hàng mặc định" value={profile.address || "Chưa cập nhật"} /></div>}</section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-bold text-slate-800">Đổi mật khẩu</h2><form onSubmit={changePassword} className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Field label="Mật khẩu hiện tại" value={passwordForm.currentPassword} onChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })} /><Field label="Mật khẩu mới" value={passwordForm.newPassword} onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })} /><Field label="Xác nhận mật khẩu mới" value={passwordForm.confirmPassword} onChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })} /><button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white sm:col-span-3 sm:w-fit">Cập nhật mật khẩu</button></form></section></>}
        {activeTab === "addresses" && <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-bold text-slate-800">Tra cứu bảo hành</h2><div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600"><span className="material-symbols-outlined text-4xl text-slate-300">verified</span><p className="mt-2">Bạn chưa có sản phẩm nào đang bảo hành.</p></div></div>}
      </div>
    </div>
  </main></PageShell>;
}

export default function AccountPage() {
  return <Suspense fallback={<PageShell><main className="flex flex-1 items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></main></PageShell>}><AccountContent /></Suspense>;
}

function PageShell({ children }: { children: React.ReactNode }) { return <div className="flex min-h-screen flex-col bg-slate-100"><Header />{children}<Footer /></div>; }
function Support({ icon, title, phone }: { icon: string; title: string; phone: string }) { return <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white"><span className="material-symbols-outlined text-2xl">{icon}</span></div><div><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-1 text-xs text-slate-500">{phone}</p></div></div>; }
function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: "text" | "password" }) { return <label className="block text-xs font-semibold text-slate-600">{label}<input type={label.toLowerCase().includes("mật khẩu") ? "password" : type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-500" /></label>; }
function Info({ label, value }: { label: string; value: string }) { return <div><span className="mb-0.5 block text-xs text-slate-500">{label}</span><span className="font-semibold text-slate-800">{value}</span></div>; }

function DefaultAddressFields({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [provinces, setProvinces] = useState<AddressOption[]>([]);
  const [districts, setDistricts] = useState<AddressOption[]>([]);
  const [wards, setWards] = useState<AddressOption[]>([]);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");
  const [detail, setDetail] = useState(value.split(",")[0]?.trim() || "");

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=1").then((response) => response.json()).then((data) => setProvinces(parseAddressOptions(data))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!province) return;
    fetch(`https://provinces.open-api.vn/api/p/${province}?depth=2`).then((response) => response.json()).then((data) => setDistricts(parseAddressOption(data).districts || [])).catch(() => {});
  }, [province]);

  useEffect(() => {
    if (!district) return;
    fetch(`https://provinces.open-api.vn/api/d/${district}?depth=2`).then((response) => response.json()).then((data) => setWards(parseAddressOption(data).wards || [])).catch(() => {});
  }, [district]);

  function updateAddress(next: { detail?: string; provinceName?: string; districtName?: string; wardName?: string }) {
    const nextDetail = next.detail ?? detail;
    const parts = [nextDetail, next.wardName || wardName, next.districtName || districtName, next.provinceName || provinceName].filter(Boolean);
    setDetail(nextDetail);
    onChange(parts.join(", "));
  }

  return <div className="space-y-3"><p className="text-xs font-semibold text-slate-600">Địa chỉ giao hàng mặc định</p><div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><select value={province} onChange={(event) => { const option = provinces.find((item) => String(item.code) === event.target.value); const nextProvinceName = option?.name || ""; setProvince(event.target.value); setProvinceName(nextProvinceName); setDistrict(""); setDistrictName(""); setWard(""); setWardName(""); setDistricts([]); setWards([]); updateAddress({ provinceName: nextProvinceName, districtName: "", wardName: "" }); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"><option value="">Tỉnh / thành phố</option>{provinces.map((option) => <option key={option.code} value={option.code}>{option.name}</option>)}</select><select value={district} disabled={!province} onChange={(event) => { const option = districts.find((item) => String(item.code) === event.target.value); const nextDistrictName = option?.name || ""; setDistrict(event.target.value); setDistrictName(nextDistrictName); setWard(""); setWardName(""); setWards([]); updateAddress({ districtName: nextDistrictName, wardName: "" }); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm disabled:opacity-50"><option value="">Quận / huyện</option>{districts.map((option) => <option key={option.code} value={option.code}>{option.name}</option>)}</select><select value={ward} disabled={!district} onChange={(event) => { const option = wards.find((item) => String(item.code) === event.target.value); const nextWardName = option?.name || ""; setWard(event.target.value); setWardName(nextWardName); updateAddress({ wardName: nextWardName }); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm disabled:opacity-50"><option value="">Phường / xã</option>{wards.map((option) => <option key={option.code} value={option.code}>{option.name}</option>)}</select></div><input value={detail} onChange={(event) => updateAddress({ detail: event.target.value })} placeholder="Số nhà, tên đường" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-500" /><p className="text-xs text-slate-500">Địa chỉ cũ vẫn được giữ trong ô chi tiết; chọn lại các cấp địa giới để chuẩn hóa đầy đủ.</p></div>;
}
