import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
      <div className="w-full max-w-5xl flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/404.png"
          alt="Không tìm thấy trang"
          className="block w-auto max-w-full h-auto max-h-[52vh] rounded-2xl"
        />
      </div>

      <div className="mt-8 space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline">
          Không tìm thấy trang
        </h1>
        <p className="text-sm text-on-surface-variant">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang địa chỉ khác.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-md shadow-primary/20 transition-colors hover:bg-primary/90"
        >
          Về trang chủ
        </Link>
      </div>
      </main>

      <Footer />
    </div>
  );
}
