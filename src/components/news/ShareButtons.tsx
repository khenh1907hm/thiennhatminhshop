"use client";

import { useEffect, useState } from "react";

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(window.location.href);
  }, []);

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="mt-10 border-t border-outline-variant/60 pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-slate-800">Chia sẻ bài viết</span>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Chia sẻ lên Facebook" className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#1877f2] px-3 text-xs font-semibold text-white hover:opacity-90">
          Facebook
        </a>
        <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" aria-label="Chia sẻ lên X" className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white hover:opacity-90">
          X
        </a>
        <a href={`https://zalo.me/share?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Chia sẻ lên Zalo" className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-500 px-3 text-xs font-semibold text-white hover:opacity-90">
          Zalo
        </a>
        <button type="button" onClick={copyLink} className="inline-flex h-9 items-center gap-2 rounded-lg border border-outline-variant px-3 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary">
          <span className="material-symbols-outlined text-[16px]">link</span>
          {copied ? "Đã copy" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
