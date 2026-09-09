import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Chính sách bảo hành | Thiên Nhật Minh",
  description: "Thông tin chính sách bảo hành sản phẩm tại Thiên Nhật Minh.",
};

export default function WarrantyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="w-[85%] max-w-5xl mx-auto py-10 flex-grow">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="flex justify-center py-2">
            <h1
              className="heading-dual text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 font-headline tracking-tight"
              data-en="Warranty Policy"
            >
              <span>CHÍNH SÁCH BẢO HÀNH</span>
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Thông tin về điều kiện, thời hạn và quy trình bảo hành sản phẩm.
          </p>
        </div>

        <article className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6 sm:p-8 space-y-8 text-sm text-on-surface-variant leading-7">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
              1. Điều kiện bảo hành
            </h2>
            <p>
              Sản phẩm được bảo hành khi còn trong thời hạn bảo hành và có
              thông tin mua hàng hợp lệ tại Thiên Nhật Minh.
            </p>
            <p>
              Sản phẩm cần còn nguyên tem bảo hành và không thuộc các trường
              hợp hư hỏng do sử dụng sai hướng dẫn, tự ý sửa chữa hoặc tác động
              ngoại lực.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
              2. Thời hạn bảo hành
            </h2>
            <p>
              Thời hạn bảo hành được áp dụng theo chính sách của từng sản
              phẩm hoặc nhà sản xuất và được thể hiện trên báo giá, phiếu bảo
              hành hoặc chứng từ mua hàng.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
              3. Quy trình tiếp nhận bảo hành
            </h2>
            <p>
              Vui lòng liên hệ hotline hoặc gửi yêu cầu qua trang Liên hệ,
              cung cấp mã đơn hàng, thông tin sản phẩm và mô tả lỗi. Bộ phận
              kỹ thuật sẽ tiếp nhận, kiểm tra và phản hồi hướng xử lý.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
              4. Liên hệ hỗ trợ
            </h2>
            <p>
              Hotline: +84 983 449 446. Thời gian hỗ trợ: Thứ Hai - Thứ Bảy,
              08:00 - 17:30.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
