"use client";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
};

export default function Pagination({
  page,
  totalPages,
  onChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  const push = (v: number | "…") => {
    if (pages[pages.length - 1] !== v) pages.push(v);
  };

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      push(i);
    } else if (pages[pages.length - 1] !== "…") {
      push("…");
    }
  }

  return (
    <div className={`mt-8 flex justify-center items-center gap-2 ${className}`}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-outline-variant text-on-surface font-bold disabled:opacity-40 hover:border-primary hover:text-primary transition-all"
        aria-label="Trang trước"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>

      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={`e-${idx}`} className="w-8 text-center text-outline text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${
              p === page
                ? "bg-primary text-white shadow-sm shadow-primary/25"
                : "bg-white border border-outline-variant text-on-surface hover:border-primary hover:text-primary"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-outline-variant text-on-surface font-bold disabled:opacity-40 hover:border-primary hover:text-primary transition-all"
        aria-label="Trang sau"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </div>
  );
}
