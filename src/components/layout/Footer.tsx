import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#0A3D62] dark:bg-black text-white w-full py-12 px-8 mt-auto border-t border-white/10">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-4">
          <Image src="/images/logo.png" alt="Thiên Nhật Minh" width={200} height={200} />
          <p className="text-slate-300 text-sm leading-relaxed">
            Đơn vị cung cấp giải pháp điện công nghiệp hàng đầu khu vực.
          </p>
          <div className="flex gap-4 text-white">
            <span className="material-symbols-outlined cursor-pointer hover:text-amber-500 transition-colors">social_leaderboard</span>
            <span className="material-symbols-outlined cursor-pointer hover:text-amber-500 transition-colors">share</span>
            <span className="material-symbols-outlined cursor-pointer hover:text-amber-500 transition-colors">mail</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold uppercase tracking-widest text-sm font-headline">CHÍNH SÁCH</h4>
          <nav className="flex flex-col gap-2">
            <a className="text-slate-300 hover:text-amber-500 transition-colors text-sm" href="#">Chính sách bảo mật</a>
            <a className="text-slate-300 hover:text-amber-500 transition-colors text-sm" href="#">Điều khoản dịch vụ</a>
            <a className="text-slate-300 hover:text-amber-500 transition-colors text-sm" href="#">Chính sách thanh toán</a>
            <a className="text-slate-300 hover:text-amber-500 transition-colors text-sm" href="#">Bảo mật thông tin</a>
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold uppercase tracking-widest text-sm font-headline">DỊCH VỤ</h4>
          <nav className="flex flex-col gap-2">
            <a className="text-slate-300 hover:text-amber-500 transition-colors text-sm" href="#">Hướng dẫn mua hàng</a>
            <a className="text-slate-300 hover:text-amber-500 transition-colors text-sm" href="#">Bảo hành &amp; Đổi trả</a>
            <a className="text-slate-300 hover:text-amber-500 transition-colors text-sm" href="#">Tư vấn kỹ thuật</a>
            <a className="text-slate-300 hover:text-amber-500 transition-colors text-sm" href="#">Vận chuyển tận nơi</a>
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold uppercase tracking-widest text-sm font-headline">LIÊN HỆ</h4>
          <p className="text-slate-300 text-sm flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-500 text-sm mt-1">location_on</span>
            75 Nguyễn Cửu Đàm, Phường Tân Sơn Nhì, TP. Hồ Chí Minh
          </p>
          <p className="text-slate-300 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-sm">call</span>
            Hotline: +84 983 449 446
          </p>
          <p className="text-slate-300 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-sm">mail</span>
            Email: ng.luan@thienhatminh.com
          </p>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto border-t border-white/10 mt-12 pt-8 text-center text-slate-400 text-xs">
        © 2026 THIENNHATMINH.ECO. Precision Power Engineering. All rights reserved.
      </div>
    </footer>
  );
}
