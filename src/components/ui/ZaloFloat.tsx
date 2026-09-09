"use client";

import { usePathname } from "next/navigation";
const ZALO_PHONE = "0983449446";

export default function ZaloFloat() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const href = `https://zalo.me/${ZALO_PHONE}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat Zalo"
      className="zalo-float fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg hover:scale-105 transition-transform"
    >
      <img src="/images/icon_zalo.webp" alt="Zalo" width={56} height={56} className="block w-full h-full object-contain" />
    </a>
  );
}
