"use client";

import { useState } from "react";

const faqItems = [
  {
    question: "Tôi có cần đăng ký tài khoản để đặt hàng không?",
    answer:
      "Không. Quý khách có thể đặt hàng trực tiếp trên website mà không cần đăng ký tài khoản. Khách hàng đã đăng nhập cũng có thể thực hiện đặt hàng như bình thường.",
  },
  {
    question: "Tôi đặt hàng trên website như thế nào?",
    answer:
      "Quý khách lựa chọn sản phẩm, thêm vào giỏ hàng và điền đầy đủ thông tin đặt hàng. Sau khi gửi yêu cầu, nhân viên Thiên Nhật Minh sẽ liên hệ để xác nhận đơn hàng và tư vấn các thông tin cần thiết.",
  },
  {
    question: "Thiên Nhật Minh có những hình thức thanh toán nào?",
    answer: (
      <>
        Thiên Nhật Minh hiện hỗ trợ thanh toán bằng <strong>tiền mặt</strong>{" "}
        hoặc <strong>chuyển khoản qua PayOS</strong>. Hình thức thanh toán cụ
        thể sẽ được trao đổi và xác nhận trong quá trình xử lý đơn hàng.
      </>
    ),
  },
  {
    question: "Sau khi đặt hàng có được gọi điện xác nhận không?",
    answer:
      "Có. Sau khi quý khách gửi đơn hàng, nhân viên Thiên Nhật Minh sẽ liên hệ qua điện thoại để xác nhận thông tin sản phẩm, số lượng, thông tin giao hàng và các nội dung liên quan trước khi xử lý đơn.",
  },
  {
    question: "Thời gian giao hàng là bao lâu?",
    answer:
      "Thời gian giao hàng phụ thuộc vào sản phẩm, số lượng và địa điểm nhận hàng. Nhân viên Thiên Nhật Minh sẽ thông báo và xác nhận thời gian giao hàng cụ thể với quý khách sau khi tiếp nhận đơn hàng.",
  },
  {
    question: "Nếu sản phẩm bị lỗi hoặc hư hỏng thì phải làm gì?",
    answer:
      "Nếu sản phẩm gặp lỗi hoặc hư hỏng, quý khách vui lòng liên hệ Thiên Nhật Minh để được tiếp nhận thông tin và hỗ trợ kiểm tra, xử lý theo chính sách đổi trả và bảo hành của sản phẩm.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-[85%] max-w-4xl mx-auto py-10 md:py-14">
      <div className="text-center w-full">
        <div className="heading-dual-center justify-center">
          <h2
            className="heading-outline text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 font-headline tracking-tight"
            data-en="FAQs"
          >
            <span>CÂU HỎI THƯỜNG GẶP</span>
          </h2>
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm mx-auto">
          Những thắc mắc phổ biến khi mua hàng
          <br />
          tại Thiên Nhật Minh
        </p>
      </div>

      <div className="space-y-3">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={item.question}
              className={`overflow-hidden rounded-2xl border bg-surface transition-colors duration-300 ${
                isOpen
                  ? "border-primary/30 shadow-sm"
                  : "border-outline-variant hover:border-primary/20"
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-on-surface transition-colors hover:text-primary sm:px-6"
              >
                <span>
                  {index + 1}. {item.question}
                </span>
                <span
                  className={`material-symbols-outlined shrink-0 text-xl text-primary transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>

              <div
                id={`faq-answer-${index}`}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <p className="border-t border-outline-variant/60 px-5 pb-5 pt-4 text-sm leading-7 text-on-surface-variant sm:px-6">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
