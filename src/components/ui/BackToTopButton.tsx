"use client";

import { useEffect, useState } from "react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Lên đầu trang"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-3 sm:bottom-24 sm:right-6 z-[60] w-11 h-11 sm:w-12 sm:h-12 rounded-full
        bg-primary/90 text-white shadow-lg shadow-primary/30
        border border-white/30 backdrop-blur-md
        flex items-center justify-center
        hover:bg-primary hover:scale-105 active:scale-95
        transition-all duration-300
        animate-back-to-top-jump"
    >
      <span className="material-symbols-outlined text-[22px]">keyboard_arrow_up</span>
    </button>
  );
}
