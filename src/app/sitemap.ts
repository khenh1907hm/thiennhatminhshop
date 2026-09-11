import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const revalidate = 3600;

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://thiennhatminhshop.vercel.app").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    prisma.product.findMany({ select: { id: true, updatedAt: true } }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes = [
    "",
    "/shop",
    "/news",
    "/docs",
    "/contact",
    "/huong-dan-mua-hang",
    "/chinh-sach-bao-hanh",
    "/chinh-sach-bao-mat",
    "/chinh-sach-doi-tra",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" || path === "/shop" ? "daily" as const : "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/product/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: `${siteUrl}/news/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
