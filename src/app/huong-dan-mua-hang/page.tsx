import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Hướng dẫn mua hàng | Thiên Nhật Minh",
  description: "Cách thức mua hàng tại Thiên Nhật Minh.",
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
              data-en="Shopping Guide"
            >
              <span>HƯỚNG DẪN MUA HÀNG</span>
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Hướng dẫn chi tiết quy trình tìm kiếm, tư vấn và đặt mua sản phẩm tại Thiên Nhật Minh.
          </p>
        </div>
       <article className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6 sm:p-8 space-y-8 text-sm text-on-surface-variant leading-7">
        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            1. Tìm kiếm và lựa chọn sản phẩm
            </h2>

            <p>
            Quý khách có thể tìm kiếm sản phẩm cần mua trực tiếp trên website
            Thiên Nhật Minh bằng thanh tìm kiếm hoặc lựa chọn sản phẩm từ các danh
            mục được hiển thị trên website.
            </p>

            <p>
            Sau khi tìm được sản phẩm phù hợp, quý khách có thể xem thông tin,
            thông số kỹ thuật và các nội dung liên quan trước khi tiến hành đặt hàng.
            </p>
        </section>

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            2. Tiến hành đặt hàng
            </h2>

            <p>
            Thiên Nhật Minh hỗ trợ đặt hàng cho cả khách hàng đã đăng nhập tài khoản
            và khách hàng vãng lai không đăng nhập.
            </p>

            <p>
            Sau khi lựa chọn sản phẩm, quý khách tiến hành đặt hàng và điền đầy đủ
            các thông tin cần thiết theo biểu mẫu trên website, bao gồm thông tin
            liên hệ và thông tin giao hàng.
            </p>

            <p>
            Đối với khách hàng đã đăng nhập, quý khách có thể sử dụng thông tin tài
            khoản đã cung cấp để thuận tiện hơn trong quá trình đặt hàng. Khách hàng
            vãng lai có thể trực tiếp điền thông tin vào biểu mẫu mà không cần tạo
            tài khoản.
            </p>
        </section>

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            3. Xác nhận đơn hàng
            </h2>

            <p>
            Sau khi quý khách hoàn tất việc gửi yêu cầu đặt hàng, nhân viên Thiên
            Nhật Minh sẽ liên hệ theo thông tin quý khách đã cung cấp để xác nhận
            đơn hàng.
            </p>

            <p>
            Trong quá trình xác nhận, nhân viên sẽ trao đổi với quý khách về thông
            tin sản phẩm, số lượng, địa chỉ giao hàng, thời gian giao hàng và các
            nội dung liên quan trước khi tiến hành xử lý đơn hàng.
            </p>

            <p>
            Thời gian giao hàng cụ thể sẽ được Thiên Nhật Minh thông báo và thống
            nhất với quý khách trong quá trình xác nhận đơn hàng.
            </p>
        </section>

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            4. Phương thức thanh toán
            </h2>

            <p>
            Thiên Nhật Minh hiện hỗ trợ các phương thức thanh toán sau:
            </p>

            <ul className="list-disc pl-5 space-y-2">
            <li>
                <strong>Thanh toán bằng tiền mặt:</strong> Quý khách thanh toán trực
                tiếp bằng tiền mặt theo thỏa thuận với Thiên Nhật Minh.
            </li>

            <li>
                <strong>Thanh toán chuyển khoản:</strong> Quý khách có thể thực hiện
                thanh toán thông qua hệ thống PayOS theo thông tin thanh toán được
                cung cấp trong quá trình đặt hàng.
            </li>
            </ul>

            <p>
            Thông tin và phương thức thanh toán cụ thể sẽ được nhân viên Thiên Nhật
            Minh xác nhận với quý khách trước khi hoàn tất đơn hàng.
            </p>
        </section>

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            5. Giao hàng và hoàn tất đơn hàng
            </h2>

            <p>
            Sau khi đơn hàng được xác nhận và hoàn tất các điều kiện thanh toán theo
            thỏa thuận, Thiên Nhật Minh sẽ tiến hành xử lý và giao hàng theo thông
            tin đã thống nhất với quý khách.
            </p>

            <p>
            Thời gian giao hàng có thể thay đổi tùy theo sản phẩm, số lượng, địa chỉ
            nhận hàng và điều kiện thực tế. Nhân viên Thiên Nhật Minh sẽ thông báo
            thời gian dự kiến trong quá trình xác nhận đơn hàng.
            </p>
        </section>

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            6. Hỗ trợ và liên hệ
            </h2>

            <p>
            Trong quá trình tìm hiểu sản phẩm, đặt hàng hoặc cần hỗ trợ về đơn hàng,
            quý khách có thể liên hệ với Thiên Nhật Minh để được tư vấn và giải đáp.
            </p>

            <p>
            <strong>Hotline:</strong> +84 983 449 446
            </p>

            <p>
            <strong>Email:</strong> ng.luan@thiennhatminh.com
            </p>

            <p>
            Thiên Nhật Minh sẽ tiếp nhận và hỗ trợ các yêu cầu của quý khách trong
            thời gian sớm nhất.
            </p>
        </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
