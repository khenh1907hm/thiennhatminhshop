import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | Thiên Nhật Minh",
  description: "Thông tin chính sách thông tin tại Thiên Nhật Minh.",
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
              data-en="Privacy Policy"
            >
              <span>CHÍNH SÁCH BẢO MẬT</span>
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Thông tin về điều kiện, thời hạn và quy trình bảo hành sản phẩm.
          </p>
        </div>
        <article className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6 sm:p-8 space-y-8 text-sm text-on-surface-variant leading-7">

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            1. Thông tin được thu thập
            </h2>
            <p>
            Thiên Nhật Minh có thể thu thập một số thông tin do khách hàng cung cấp
            khi liên hệ, yêu cầu tư vấn hoặc sử dụng các chức năng trên website.
            </p>
            <p>
            Thông tin có thể bao gồm họ tên, số điện thoại, địa chỉ email, địa chỉ
            liên hệ và các nội dung khác mà khách hàng chủ động cung cấp.
            </p>
        </section>

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            2. Mục đích sử dụng thông tin
            </h2>
            <p>
            Thông tin khách hàng được sử dụng nhằm tiếp nhận và phản hồi các yêu cầu
            liên hệ, tư vấn sản phẩm, hỗ trợ khách hàng và xử lý các yêu cầu liên
            quan đến sản phẩm, dịch vụ của Thiên Nhật Minh.
            </p>
            <p>
            Thiên Nhật Minh không sử dụng thông tin khách hàng cho các mục đích khác
            ngoài phạm vi cần thiết để cung cấp, hỗ trợ và cải thiện dịch vụ, trừ
            trường hợp có sự đồng ý của khách hàng hoặc pháp luật có quy định khác.
            </p>
        </section>

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            3. Bảo mật và lưu trữ thông tin
            </h2>
            <p>
            Thiên Nhật Minh thực hiện các biện pháp phù hợp để bảo vệ thông tin
            khách hàng khỏi việc truy cập, sử dụng hoặc tiết lộ trái phép.
            </p>
            <p>
            Thông tin được lưu trữ trong khoảng thời gian cần thiết để phục vụ mục
            đích tiếp nhận, xử lý và hỗ trợ yêu cầu của khách hàng hoặc theo quy
            định pháp luật hiện hành.
            </p>
        </section>

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            4. Cung cấp thông tin cho bên thứ ba
            </h2>
            <p>
            Thiên Nhật Minh không bán hoặc trao đổi thông tin cá nhân của khách hàng
            cho bên thứ ba nhằm mục đích thương mại.
            </p>
            <p>
            Trong trường hợp cần thiết để xử lý yêu cầu của khách hàng hoặc thực
            hiện nghĩa vụ theo quy định pháp luật, thông tin có thể được cung cấp
            cho các bên có liên quan trong phạm vi cần thiết.
            </p>
        </section>

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            5. Quyền của khách hàng
            </h2>
            <p>
            Khách hàng có thể yêu cầu kiểm tra, cập nhật hoặc điều chỉnh thông tin
            cá nhân đã cung cấp cho Thiên Nhật Minh khi nhận thấy thông tin không
            chính xác hoặc cần thay đổi.
            </p>
            <p>
            Mọi yêu cầu liên quan đến thông tin cá nhân có thể được gửi đến Thiên
            Nhật Minh thông qua các thông tin liên hệ được công bố trên website.
            </p>
        </section>

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            6. Thông tin liên hệ
            </h2>
            <p>
            Công ty TNHH Thiên Nhật Minh
            </p>
            <p>
            Địa chỉ: 75 Nguyễn Cửu Đàm, Phường Tân Sơn Nhì, TP Hồ Chí Minh, Việt Nam.
            </p>
            <p>
            Hotline: +84 983 449 446
            </p>
            <p>
            Nếu có câu hỏi hoặc yêu cầu liên quan đến chính sách bảo mật, vui lòng
            liên hệ với Thiên Nhật Minh qua hotline để được hỗ trợ.
            </p>
        </section>

        </article>
      </main>

      <Footer />
    </div>
  );
}
