"use client";

const CUSTOMERS = [
  { src: "/images/customer_1.svg", alt: "Khách hàng 1" },
  { src: "/images/customer_2.jpg", alt: "Khách hàng 2" },
  { src: "/images/customer_3.png", alt: "Khách hàng 3" },
  { src: "/images/customer_4.png", alt: "Khách hàng 4" },
  { src: "/images/customer_5.png", alt: "Khách hàng 5" },
  { src: "/images/customer_6.png", alt: "Khách hàng 6" },
];

export default function CustomersSection() {
  const loop = [...CUSTOMERS, ...CUSTOMERS];

  return (
    <section className="w-[85%] mx-auto py-8 md:py-12">
      <div className="text-center mb-8">
        <div className="heading-dual-center">
          <h2
            className="heading-dual text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 font-headline tracking-tight"
            data-en="Our Customers"
          >
            <span>KHÁCH HÀNG CỦA CHÚNG TÔI</span>
          </h2>
        </div>
        <p className="text-sm text-on-surface-variant mt-2 max-w-xl mx-auto">
          Những doanh nghiệp và đơn vị đã tin tưởng đồng hành cùng Thiên Nhật Minh.
        </p>
      </div>

      <div className="logo-marquee py-2">
        <div
          className="logo-marquee-track"
          style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap" }}
        >
          {loop.map((c, i) => (
            <div
              key={`${c.src}-${i}`}
              className="flex items-center justify-center w-40 h-24 shrink-0 grow-0 rounded-2xl bg-white border border-outline-variant/40 shadow-sm px-4 py-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.src}
                alt={c.alt}
                className="max-h-14 w-auto max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
