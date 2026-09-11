import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://thiennhatminhshop.vercel.app").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/account/", "/cart/", "/profile/", "/login/", "/register/", "/forgot-password/", "/reset-password/", "/verify-email/", "/wishlist/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
