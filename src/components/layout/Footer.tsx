import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#123b67] via-[#15558a] to-[#087f9b] text-white w-full py-12 px-8 mt-auto border-t border-cyan-200/20">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold uppercase tracking-widest text-sm font-headline">
            THÔNG TIN LIÊN HỆ
          </h4>
          <div className="space-y-2 text-blue-100 text-sm leading-relaxed">
            <p className="font-bold text-white">CÔNG TY TNHH THIÊN NHẬT MINH</p>
            <p>Địa chỉ: 75 Nguyễn Cửu Đàm, Phường Tân Sơn Nhì, TP. Hồ Chí Minh</p>
            <p>Điện Thoại: +84 983 449 446</p>
            <p>Email: ng.luan@thiennhatminh.com</p>
            <p>Giấy chứng đăng ký doanh nghiệp số: 0303 590 774</p>
            <p>Nơi cấp: Sở Kế Hoạch và Đầu Tư Tp. HCM</p>
            <p>Đăng ký lần đầu: 17/12/2004</p>
            <p>Đăng ký thay đổi lần 8: 16/01/2025</p>
          </div>
          <a
            href="https://online.gov.vn/Home/WebDetails/84598?AspxAutoDetectCookieSupport=1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit rounded-lg  transition-transform hover:scale-105"
            aria-label="Đã thông báo Bộ Công Thương"
          >
            <Image
              src="/images/logo xác thực.png"
              alt="Đã thông báo Bộ Công Thương"
              width={180}
              height={60}
              className="h-auto w-44"
            />
          </a>
          <div className="flex gap-4 text-white">
            <span className="material-symbols-outlined cursor-pointer hover:text-cyan-200 transition-colors">social_leaderboard</span>
            <span className="material-symbols-outlined cursor-pointer hover:text-cyan-200 transition-colors">share</span>
            <span className="material-symbols-outlined cursor-pointer hover:text-cyan-200 transition-colors">mail</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold uppercase tracking-widest text-sm font-headline">GIỚI THIỆU</h4>
          <nav className="flex flex-col gap-2">
            <a className="text-blue-100 hover:text-cyan-200 transition-colors text-sm" href="https://www.thiennhatminh.com/gioi-thieu">Về chúng tôi</a>
            <a className="text-blue-100 hover:text-cyan-200 transition-colors text-sm" href="https://www.thiennhatminh.com/tuyen-dung">Tuyển dụng</a>
            <a className="text-blue-100 hover:text-cyan-200 transition-colors text-sm" href="https://www.thiennhatminh.com/dich-vu">Các dịch vụ</a>
            <a className="text-blue-100 hover:text-cyan-200 transition-colors text-sm" href="https://www.thiennhatminh.com/lien-he">Liên hệ</a>
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold uppercase tracking-widest text-sm font-headline">CHÍNH SÁCH</h4>
          <nav className="flex flex-col gap-2">
            <a className="text-blue-100 hover:text-cyan-200 transition-colors text-sm" href="/chinh-sach-bao-mat">Chính sách bảo mật</a>
            <Link className="text-blue-100 hover:text-cyan-200 transition-colors text-sm" href="/chinh-sach-bao-hanh">Chính sách bảo hành</Link>
            <a className="text-blue-100 hover:text-cyan-200 transition-colors text-sm" href="/huong-dan-mua-hang">Hướng dẫn mua hàng</a>
            <a className="text-blue-100 hover:text-cyan-200 transition-colors text-sm" href="/chinh-sach-doi-tra">Chính sách đổi trả</a>
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold uppercase tracking-widest text-sm font-headline">LIÊN HỆ</h4>
          <p className="text-blue-100 text-sm flex items-start gap-2">
            <span className="material-symbols-outlined text-cyan-200 text-sm mt-1">location_on</span>
            75 Nguyễn Cửu Đàm, Phường Tân Sơn Nhì, TP. Hồ Chí Minh
          </p>
          <p className="text-blue-100 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-200 text-sm">call</span>
            Hotline: +84 983 449 446
          </p>
          <p className="text-blue-100 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-200 text-sm">mail</span>
            Email: ng.luan@thienhatminh.com
          </p>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto border-t border-white/15 mt-12 pt-8 text-center text-blue-100/70 text-xs">
        © 2026 THIENNHATMINH.ECO. Precision Power Engineering. All rights reserved.
      </div>
    </footer>
  );
}
