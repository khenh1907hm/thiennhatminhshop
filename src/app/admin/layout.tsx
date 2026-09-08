import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Portal - Thien Nhat Minh",
  description: "Hệ thống quản trị chuyên nghiệp",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-theme-bg">
      <AdminSidebar />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-[85%] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
