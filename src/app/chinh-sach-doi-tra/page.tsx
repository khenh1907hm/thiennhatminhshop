import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Chính sách đổi trả | Thiên Nhật Minh",
  description: "Đổi/trả hàng là một trong số những chính sách đảm bảo quyền lợi của khách hàng và quy trình này được thực hiện khi kiện hàng được hoàn về tại kho hàng của Thiên Nhật Minh.",
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
              data-en="Return Policy"
            >
              <span>CHÍNH SÁCH ĐỔI TRẢ</span>
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Thông tin về điều kiện, quy trình và các trường hợp được hỗ trợ đổi/trả sản phẩm tại Thiên Nhật Minh.
          </p>
        </div>
        <article className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6 sm:p-8 space-y-8 text-sm text-on-surface-variant leading-7">

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            1. Điều kiện đổi/trả hàng
            </h2>

            <p>
            Thiên Nhật Minh hỗ trợ tiếp nhận các yêu cầu đổi/trả hàng nhằm đảm bảo
            quyền lợi của khách hàng trong quá trình mua và sử dụng sản phẩm.
            </p>

            <p>
            Yêu cầu đổi/trả có thể được xem xét trong các trường hợp sản phẩm bị
            lỗi, hư hỏng, không đúng với thông tin đơn hàng hoặc gặp vấn đề trong
            quá trình vận chuyển.
            </p>

            <p>
            Sản phẩm được yêu cầu đổi/trả cần được giữ nguyên tình trạng phù hợp để
            Thiên Nhật Minh kiểm tra và xác định phương án xử lý.
            </p>
        </section>

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            2. Các trường hợp có thể được hỗ trợ
            </h2>

            <ul className="list-disc pl-5 space-y-2">
            <li>
                Sản phẩm có dấu hiệu lỗi hoặc không hoạt động đúng theo thông tin sản phẩm.
            </li>

            <li>
                Sản phẩm bị hư hỏng, móp méo hoặc ảnh hưởng đến tình trạng sản phẩm
                trong quá trình vận chuyển.
            </li>

            <li>
                Sản phẩm giao không đúng với sản phẩm hoặc số lượng đã được xác nhận
                trong đơn hàng.
            </li>
            </ul>

            <p>
            Tùy theo tình trạng thực tế của sản phẩm và từng trường hợp cụ thể,
            Thiên Nhật Minh sẽ kiểm tra và thông báo phương án hỗ trợ phù hợp.
            </p>
        </section>

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            3. Điều kiện tiếp nhận đổi/trả
            </h2>

            <p>
            Khi có nhu cầu đổi/trả hàng, quý khách vui lòng giữ lại sản phẩm, bao bì,
            phụ kiện và các giấy tờ liên quan đến đơn hàng để thuận tiện cho quá
            trình kiểm tra.
            </p>

            <p>
            Đối với trường hợp sản phẩm có dấu hiệu hư hỏng hoặc bị ảnh hưởng trong
            quá trình vận chuyển, quý khách nên chụp hình hoặc quay video tình trạng
            sản phẩm và kiện hàng để cung cấp cho Thiên Nhật Minh khi yêu cầu hỗ trợ.
            </p>

            <p>
            Việc đổi/trả hàng sẽ được thực hiện sau khi Thiên Nhật Minh tiếp nhận,
            kiểm tra thông tin và xác định tình trạng sản phẩm.
            </p>
        </section>

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            4. Quy trình đổi/trả hàng
            </h2>

            <p>
            <strong>Bước 1:</strong> Quý khách liên hệ với Thiên Nhật Minh để thông
            báo nhu cầu đổi/trả hàng và cung cấp thông tin đơn hàng, sản phẩm cùng
            hình ảnh hoặc video liên quan nếu cần thiết.
            </p>

            <p>
            <strong>Bước 2:</strong> Thiên Nhật Minh tiếp nhận và kiểm tra thông tin,
            tình trạng sản phẩm để xác định nguyên nhân và phương án xử lý.
            </p>

            <p>
            <strong>Bước 3:</strong> Sau khi thống nhất phương án, Thiên Nhật Minh
            hướng dẫn quý khách thực hiện các bước đổi/trả hoặc hoàn tiền theo
            trường hợp cụ thể.
            </p>
        </section>

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            5. Lưu ý khi đổi/trả hàng
            </h2>

            <p>
            Quý khách vui lòng kiểm tra sản phẩm ngay khi nhận hàng và thông báo cho
            Thiên Nhật Minh trong thời gian sớm nhất nếu phát hiện sản phẩm có vấn
            đề.
            </p>

            <p>
            Các yêu cầu đổi/trả sẽ được xem xét dựa trên tình trạng thực tế của sản
            phẩm, thông tin đơn hàng và các điều kiện áp dụng tại thời điểm mua hàng.
            </p>

            <p>
            Đối với các trường hợp sản phẩm thuộc chính sách bảo hành riêng của nhà
            sản xuất hoặc Thiên Nhật Minh, việc xử lý có thể được thực hiện theo
            chính sách bảo hành tương ứng.
            </p>
        </section>

        <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">
            6. Liên hệ hỗ trợ
            </h2>

            <p>
            Nếu quý khách có thắc mắc hoặc cần hỗ trợ liên quan đến chính sách
            đổi/trả hàng, vui lòng liên hệ với Thiên Nhật Minh để được tiếp nhận và
            hướng dẫn.
            </p>

            <p>
            <strong>Hotline:</strong> +84 983 449 446
            </p>

            <p>
            <strong>Email:</strong> ng.luan@thiennhatminh.com
            </p>

            <p>
            Thiên Nhật Minh sẽ tiếp nhận thông tin và hỗ trợ quý khách trong thời
            gian sớm nhất.
            </p>
        </section>

        </article>
      </main>

      <Footer />
    </div>
  );
}
