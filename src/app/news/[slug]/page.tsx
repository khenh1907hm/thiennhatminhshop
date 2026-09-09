import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: true,
      author: { select: { name: true } },
    },
  });

  if (
    !post ||
    post.status !== "PUBLISHED" ||
    (post.publishedAt && post.publishedAt > new Date())
  ) {
    return null;
  }

  return post;
}

async function getSidebarData(currentPostId: string) {
  const now = new Date();
  const publishedFilter = {
    status: "PUBLISHED" as const,
    OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
  };

  const [categories, latestPosts] = await Promise.all([
    prisma.postCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            posts: { where: publishedFilter },
          },
        },
      },
    }),
    prisma.post.findMany({
      where: {
        ...publishedFilter,
        id: { not: currentPostId },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        publishedAt: true,
        createdAt: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  return { categories, latestPosts };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Không tìm thấy bài viết" };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDesc || post.summary || "",
    keywords: post.focusKeyword || "",
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDesc || post.summary || "",
      images: post.coverImage ? [post.coverImage] : [],
      type: "article",
      publishedTime: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      authors: post.author?.name ? [post.author.name] : [],
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const { categories, latestPosts } = await getSidebarData(post.id);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col fe-bg-gradient">
      <Header />

      <main className="flex-grow w-[85%] mx-auto py-8 md:py-10">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-outline mb-6">
          <Link href="/" className="hover:text-primary transition-colors shrink-0">
            Trang chủ
          </Link>
          <span className="material-symbols-outlined text-[16px] shrink-0">chevron_right</span>
          <Link href="/?tab=news" className="hover:text-primary transition-colors shrink-0">
            Tin tức
          </Link>
          <span className="material-symbols-outlined text-[16px] shrink-0">chevron_right</span>
          <span className="text-primary line-clamp-1">{post.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main article — wider */}
          <div className="flex-1 min-w-0 w-full">
            <header className="mb-6 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {post.category && (
                  <Link
                    href={`/news?categoryId=${post.category.id}`}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider"
                  >
                    {post.category.name}
                  </Link>
                )}
                <span className="text-sm text-outline font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  {formatDate(post.publishedAt || post.createdAt)}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[2.35rem] font-bold text-slate-900 font-headline leading-snug tracking-tight">
                {post.title}
              </h1>

              <div className="flex items-center gap-3 pt-1 pb-4 border-b border-outline-variant/60">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shrink-0">
                  {post.author?.name ? post.author.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">
                    {post.author?.name || "Quản trị viên"}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Tác giả bài viết</div>
                </div>
              </div>
            </header>

            <article className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-sm border border-outline-variant">
              {post.coverImage && (
                <div className="w-full rounded-xl sm:rounded-2xl overflow-hidden mb-8 bg-surface-container-low">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="block w-full h-auto object-contain"
                  />
                </div>
              )}

              {post.summary && (
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed border-l-4 border-primary pl-4 py-2 mb-8 bg-primary/5 rounded-r-xl">
                  {post.summary}
                </p>
              )}

              <div
                className="article-body"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-outline-variant/60">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">sell</span>
                    Thẻ bài viết
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/news?tag=${tag.slug}`}
                        className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold hover:bg-slate-200 transition-colors"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>

          {/* Right sidebar */}
          <aside className="w-full lg:w-80 xl:w-[22rem] shrink-0 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-low/70">
                <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">folder_open</span>
                  Danh mục
                </h2>
              </div>
              <nav className="p-2">
                <Link
                  href="/?tab=news"
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <span>Tất cả tin tức</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
                {categories.length === 0 ? (
                  <p className="px-3 py-4 text-xs text-outline">Chưa có danh mục</p>
                ) : (
                  categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/news?categoryId=${cat.id}`}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        post.categoryId === cat.id
                          ? "bg-primary/10 text-primary"
                          : "text-on-surface-variant hover:bg-primary/5 hover:text-primary"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[11px] font-bold tabular-nums text-outline bg-surface-container-low px-2 py-0.5 rounded-md ml-2 shrink-0">
                        {cat._count.posts}
                      </span>
                    </Link>
                  ))
                )}
              </nav>
            </div>

            {/* Latest posts */}
            <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-low/70">
                <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">newspaper</span>
                  Bài viết mới nhất
                </h2>
              </div>
              <div className="divide-y divide-outline-variant">
                {latestPosts.length === 0 ? (
                  <p className="px-5 py-6 text-xs text-outline">Chưa có bài viết khác</p>
                ) : (
                  latestPosts.map((item) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.slug}`}
                      className="flex gap-3 p-4 hover:bg-surface-container-low/60 transition-colors group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-low shrink-0 border border-outline-variant">
                        {item.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-outline/40 text-2xl">
                              image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {item.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            {item.category.name}
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-outline mt-1 font-medium">
                          {formatShortDate(item.publishedAt || item.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-outline-variant">
                <Link
                  href="/?tab=news"
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary hover:underline py-1"
                >
                  Xem tất cả tin tức
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
