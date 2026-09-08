"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";

type NewsPost = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  coverImage?: string | null;
  publishedAt?: string | null;
  category?: { id: string; name: string } | null;
  author?: { name?: string | null } | null;
  tags?: { id: string; name: string; slug: string }[];
};

type NewsCategory = {
  id: string;
  name: string;
  slug: string;
};

type NewsListProps = {
  initialCategoryId?: string;
  initialTag?: string;
  showBanner?: boolean;
  listBasePath?: string;
  pageSize?: number;
};

const chipActive =
  "bg-primary text-white shadow-md shadow-primary/20 border border-primary";
const chipIdle =
  "bg-surface text-on-surface hover:bg-surface-container-low border border-outline-variant";

export default function NewsList({
  initialCategoryId = "all",
  initialTag,
  showBanner = true,
  listBasePath = "/news",
  pageSize = 12,
}: NewsListProps) {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategoryId || "all"
  );
  const [activeTag, setActiveTag] = useState<string | undefined>(initialTag);

  useEffect(() => {
    setSelectedCategory(initialCategoryId || "all");
    setPage(1);
  }, [initialCategoryId]);

  useEffect(() => {
    setActiveTag(initialTag);
    setPage(1);
  }, [initialTag]);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
        });
        if (selectedCategory !== "all") params.set("categoryId", selectedCategory);
        if (activeTag) params.set("tag", activeTag);

        const res = await fetch(`/api/news?${params}`);
        const data = await res.json();
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } catch (err) {
        console.error(err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [selectedCategory, activeTag, page, pageSize]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const clearTag = () => setActiveTag(undefined);

  return (
    <div className="space-y-8">
      {showBanner && (
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="flex justify-center py-2">
            <h1
              className="heading-dual text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 font-headline tracking-tight"
              data-en="News & Events"
            >
              <span>TIN TỨC &amp; SỰ KIỆN</span>
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
            Theo dõi tin tức công nghệ, sản phẩm mới và dự án tiêu biểu từ Thiên Nhật Minh.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory("all");
            clearTag();
            setPage(1);
          }}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
            selectedCategory === "all" && !activeTag ? chipActive : chipIdle
          }`}
        >
          Tất cả tin tức
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setSelectedCategory(cat.id);
              clearTag();
              setPage(1);
            }}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              selectedCategory === cat.id && !activeTag ? chipActive : chipIdle
            }`}
          >
            {cat.name}
          </button>
        ))}
        {activeTag && (
          <button
            type="button"
            onClick={() => {
              clearTag();
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-1.5 ${chipActive}`}
          >
            #{activeTag}
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {!loading && (
        <p className="text-sm text-on-surface-variant">
          Hiển thị <span className="font-bold text-primary">{posts.length}</span> / {total} bài viết
        </p>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            autorenew
          </span>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-surface rounded-3xl p-12 text-center shadow-sm border border-outline-variant">
          <span className="material-symbols-outlined text-5xl text-outline mb-3">newspaper</span>
          <h3 className="text-lg font-bold text-on-surface">Không tìm thấy bài viết</h3>
          <p className="text-sm text-on-surface-variant">
            Chưa có tin tức đã xuất bản trong bộ lọc này.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => (
            <Link
              href={`/news/${post.slug}`}
              key={post.id}
              className="group flex flex-col bg-surface rounded-3xl overflow-hidden border border-outline-variant shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-[16/10] bg-surface-container-low relative overflow-hidden flex items-center justify-center">
                {post.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <span className="material-symbols-outlined text-5xl text-outline/30 group-hover:scale-110 transition-transform duration-500">
                    image
                  </span>
                )}
                {post.category && (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider shadow-sm">
                    {post.category.name}
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 text-[11px] text-outline font-semibold mb-3">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {formatDate(post.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    {post.author?.name || "Admin"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-on-surface font-headline leading-snug group-hover:text-primary transition-colors mb-3 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-4 flex-grow">
                  {post.summary || "Nhấn để xem chi tiết bài viết..."}
                </p>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/15"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-outline-variant flex justify-between items-center mt-auto">
                  <span className="text-sm font-bold text-primary group-hover:underline">Đọc tiếp</span>
                  <span className="material-symbols-outlined text-primary transform group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {!showBanner && posts.length > 0 && (
        <div className="text-center">
          <Link
            href={listBasePath}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            Xem tất cả tin tức
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      )}
    </div>
  );
}
