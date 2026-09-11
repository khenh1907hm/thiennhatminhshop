"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { PopupItem } from "@/lib/popup";

const cacheKey = (id: string, version: string) => `tnm_popup_shows_${id}_${version}`;

function getShowCount(id: string, version: string) {
  if (typeof window === "undefined") return 0;
  const n = parseInt(localStorage.getItem(cacheKey(id, version)) || "0", 10);
  return Number.isFinite(n) ? n : 0;
}

function bumpShowCount(id: string, version: string) {
  const next = getShowCount(id, version) + 1;
  localStorage.setItem(cacheKey(id, version), String(next));
  return next;
}

export default function SitePopup() {
  const pathname = usePathname();
  const [queue, setQueue] = useState<PopupItem[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [configVersion, setConfigVersion] = useState("v1");

  useEffect(() => {
    if (pathname !== "/") return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/popup", { cache: "no-store" });
        const data = await res.json();
        const version = typeof data.updatedAt === "string" ? data.updatedAt : "v1";
        const max = data.maxShowsPerPopup || 3;
        const items: PopupItem[] = Array.isArray(data.items) ? data.items : [];
        const eligible = items.filter((item) => {
          if (!item.imageUrl) return false;
          return getShowCount(item.id, version) < max;
        });

        if (cancelled || eligible.length === 0) return;

        setQueue(eligible);
        setIndex(0);
        setConfigVersion(version);
        setOpen(true);
        bumpShowCount(eligible[0].id, version);
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (pathname !== "/" || !open || queue.length === 0) return null;

  const popup = queue[index];
  if (!popup) return null;

  const close = () => {
    const next = index + 1;
    if (next < queue.length) {
      bumpShowCount(queue[next].id, configVersion);
      setIndex(next);
    } else {
      setOpen(false);
    }
  };

  const bgOn = !!popup.closeBtnBgEnabled;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <div
        className="relative flex w-full justify-center"
        style={{ maxWidth: `min(92vw, ${popup.maxWidth || 520}px)` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative inline-block max-w-full leading-none">
          <button
            type="button"
            onClick={close}
            aria-label="Đóng"
            className="absolute z-10 w-6 h-6 flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{
              left: `${popup.closeBtnX ?? 94}%`,
              top: `${popup.closeBtnY ?? 4}%`,
              transform: "translate(-50%, -50%)",
              color: popup.closeBtnColor || "#fff",
              backgroundColor: bgOn ? popup.closeBtnBg || "#1e293b" : "transparent",
              borderRadius: popup.closeBtnRounded ? "50%" : "4px",
              boxShadow: bgOn ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
            }}
          >
            <span className="material-symbols-outlined text-[16px] leading-none">close</span>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={popup.imageUrl}
            alt={popup.title || "Khuyến mãi"}
            className="block max-w-full h-auto max-h-[85vh] object-contain rounded-md shadow-xl"
          />
        </div>
      </div>
    </div>
  );
}
