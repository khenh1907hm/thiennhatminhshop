import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal - Thien Nhat Minh",
  description: "Hệ thống quản trị chuyên nghiệp",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-theme-bg">
      <AdminSidebar />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
