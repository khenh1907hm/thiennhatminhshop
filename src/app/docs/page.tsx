"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface Document {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileSize: string;
  description: string;
  productIds: string[];
  createdAt: string;
}

export default function DocsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch("/api/documents");
        const data = await res.json();
        setDocuments(data.documents || []);
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Failed to load documents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (cat: string) => {
    if (cat.includes("Catalogue")) return "menu_book";
    if (cat.includes("Datasheet")) return "table_chart";
    if (cat.includes("Manual") || cat.includes("Hướng dẫn")) return "auto_stories";
    if (cat.includes("Sơ đồ") || cat.includes("Bản vẽ")) return "architecture";
    if (cat.includes("Chứng chỉ")) return "verified";
    if (cat.includes("Phần mềm") || cat.includes("Firmware")) return "terminal";
    return "description";
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const getCategoryCount = (cat: string) => {
    if (cat === "all") return documents.length;
    return documents.filter((d) => d.category === cat).length;
  };

  return (
    <div className="min-h-screen flex flex-col fe-bg-gradient">
      <Header />

      <main className="w-[85%] mx-auto py-8 flex-grow">
        {/* Banner heading — cùng kiểu trang contact */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="flex justify-center py-2">
            <h1
              className="heading-dual text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 font-headline tracking-tight"
              data-en="Technical Documents"
            >
              <span>TÀI LIỆU KỸ THUẬT</span>
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
            Tải xuống datasheet, catalogue, hướng dẫn sử dụng và chứng chỉ
            chất lượng cho tất cả sản phẩm.
          </p>
        </div>

        {/* Two-column layout: Sidebar left + Files right */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ===== LEFT SIDEBAR: Search + Categories ===== */}
          <aside className="w-full lg:w-72 shrink-0 space-y-4">
            {/* Search */}
            <div className="bg-surface rounded-2xl p-5 border border-outline-variant shadow-sm space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-bold text-on-surface font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">
                  search
                </span>
                Tìm kiếm tài liệu
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên tài liệu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                  search
                </span>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-low/50">
                <h2 className="text-xs uppercase tracking-widest font-bold text-on-surface font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">
                    folder_open
                  </span>
                  Danh Mục Tài Liệu
                </h2>
              </div>

              <nav className="flex flex-col py-2">
                {/* All */}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`flex items-center justify-between px-5 py-2.5 mx-2 my-0.5 rounded-xl text-xs font-bold uppercase tracking-tight transition-all cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                      : "hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    Tất cả tài liệu
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      selectedCategory === "all"
                        ? "bg-white/20"
                        : "bg-surface-container-high"
                    }`}
                  >
                    {getCategoryCount("all")}
                  </span>
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between px-5 py-2.5 mx-2 my-0.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-primary/10 text-primary font-bold border border-primary/20"
                        : "hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="truncate">{cat}</span>
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 ml-2 ${
                        selectedCategory === cat
                          ? "bg-primary/20 text-primary"
                          : "bg-surface-container-high text-outline"
                      }`}
                    >
                      {getCategoryCount(cat)}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Info Banner */}
            <div className="p-5 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
              <span className="material-symbols-outlined text-3xl text-cyan-200 mb-2 animate-pulse select-none">
                cloud_download
              </span>
              <h3 className="text-sm font-bold leading-tight font-headline select-none">
                Cần tài liệu khác?
              </h3>
              <p className="text-[11px] text-blue-100 mt-1 leading-relaxed select-none">
                Liên hệ kỹ sư Thiên Nhật Minh để nhận tài liệu kỹ thuật đầy đủ
                cho dự án của bạn.
              </p>
              <a
                href="/contact"
                className="mt-3 block w-full py-2 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95 text-center"
              >
                LIÊN HỆ NGAY
              </a>
            </div>
          </aside>

          {/* ===== RIGHT: Document Files ===== */}
          <section className="flex-1 min-w-0">
            {/* Toolbar info */}
            <div className="flex items-center justify-between mb-5 px-1">
              <p className="text-sm text-on-surface-variant font-medium">
                Hiển thị{" "}
                <span className="text-primary font-bold">
                  {filteredDocs.length}
                </span>{" "}
                tài liệu
                {selectedCategory !== "all" && (
                  <span className="text-outline">
                    {" "}
                    trong &quot;{selectedCategory}&quot;
                  </span>
                )}
              </p>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">
                  autorenew
                </span>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="bg-surface rounded-2xl p-12 text-center border border-outline-variant shadow-sm space-y-3">
                <span className="material-symbols-outlined text-5xl text-outline">
                  folder_off
                </span>
                <h3 className="text-lg font-bold text-on-surface font-headline">
                  Chưa có tài liệu nào
                </h3>
                <p className="text-sm text-on-surface-variant">
                  {documents.length === 0
                    ? "Hệ thống chưa có tài liệu kỹ thuật. Vui lòng liên hệ để được hỗ trợ."
                    : "Không tìm thấy tài liệu phù hợp với bộ lọc hiện tại."}
                </p>
              </div>
            ) : (
              <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-outline uppercase tracking-wider">
                        <th className="px-6 py-4">Tên tài liệu</th>
                        <th className="px-6 py-4 w-40">Ngày cập nhật</th>
                        <th className="px-6 py-4 w-32 text-right">Tải về</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant text-sm">
                      {filteredDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-surface-container-low/60 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-on-surface text-sm line-clamp-1 group-hover:text-primary transition-colors">
                              {doc.title}
                            </div>
                            {doc.description && (
                              <div className="text-xs text-on-surface-variant line-clamp-1 mt-1">
                                {doc.description}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-[11px] text-outline">
                               <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase">{doc.category}</span>
                               {doc.fileSize && <span>• {doc.fileSize}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant text-xs">
                            {doc.createdAt ? formatDate(doc.createdAt) : ""}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                download
                              </span>
                              Tải về
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
