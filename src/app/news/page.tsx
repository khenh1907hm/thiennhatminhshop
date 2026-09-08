"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NewsList from "@/components/news/NewsList";

function NewsPageContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId") || "all";
  const tag = searchParams.get("tag") || undefined;

  return (
    <div className="min-h-screen flex flex-col fe-bg-gradient">
      <Header />
      <main className="w-[85%] mx-auto py-8 flex-grow">
        <NewsList
          initialCategoryId={categoryId}
          initialTag={tag}
          showBanner
          listBasePath="/news"
        />
      </main>
      <Footer />
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <NewsPageContent />
    </Suspense>
  );
}
