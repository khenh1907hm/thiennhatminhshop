"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  coverImage?: string | null;
  publishedAt?: string | null;
  category?: { name: string } | null;
};

export default function HomeNewsSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news?page=1&limit=4")
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data.posts) ? data.posts : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <section className="w-[85%] max-w-[1440px] mx-auto py-4 md:py-6 ">
      <div className="relative flex flex-col items-center gap-4 mb-6">
        <div className="text-center w-full">
          <div className="heading-dual-center justify-center">
            <h2
              className="heading-dual text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 font-headline tracking-tight"
              data-en="News"
            >
              <span>TIN TỨC</span>
            </h2>
          </div>
          <p className="text-sm text-on-surface-variant mt-2">
            Cập nhật sản phẩm, dự án và kiến thức kỹ thuật từ Thiên Nhật Minh.
          </p>
        </div>
        <Link
          href="/?tab=news"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline sm:absolute sm:right-0 sm:bottom-0"
        >
          Xem tất cả
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-outline-variant bg-surface overflow-hidden animate-pulse"
            >
              <div className="aspect-[16/10] bg-slate-200/70" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-1/3 rounded-full bg-slate-200/70" />
                <div className="h-4 w-full rounded-full bg-slate-200/80" />
                <div className="h-4 w-2/3 rounded-full bg-slate-200/60" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl border border-outline-variant bg-surface p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">newspaper</span>
          <p className="text-sm font-semibold text-on-surface">Chưa có bài viết nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/news/${post.slug}`}
              className="group flex flex-col bg-surface rounded-3xl overflow-hidden border border-outline-variant shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="aspect-[16/10] bg-surface-container-low relative overflow-hidden flex items-center justify-center">
                {post.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(event) => {
                      event.currentTarget.src = "/images/main-bg.jpg";
                    }}
                  />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-outline/30">image</span>
                )}
                {post.category && (
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider">
                    {post.category.name}
                  </span>
                )}
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <span className="text-[11px] text-outline font-semibold mb-2">
                  {formatDate(post.publishedAt)}
                </span>
                <h3 className="text-base font-bold text-on-surface font-headline leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
                  {post.title}
                </h3>
                <p className="text-xs text-on-surface-variant line-clamp-2 flex-grow">
                  {post.summary || "Nhấn để xem chi tiết..."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
