"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";

interface TechnicalDoc {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileSize?: string;
  description?: string;
  productIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  brand?: string;
}

export default function AdminDocumentsPage() {
  const { showNotification } = useNotification();
  const [documents, setDocuments] = useState<TechnicalDoc[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modals
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<TechnicalDoc | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formFileUrl, setFormFileUrl] = useState("");
  const [formFileSize, setFormFileSize] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSelectedProducts, setFormSelectedProducts] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category management modal state
  const [newCatInput, setNewCatInput] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/documents");
      const data = await res.json();
      if (data.documents) setDocuments(data.documents);
      if (data.categories) setCategories(data.categories);
      if (data.products) setProducts(data.products);
    } catch (error) {
      console.error(error);
      showNotification("Lỗi tải dữ liệu tài liệu kỹ thuật", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingDoc(null);
    setFormTitle("");
    setFormCategory(categories[0] || "Catalogue & Brochure");
    setFormFileUrl("");
    setFormFileSize("");
    setFormDescription("");
    setFormSelectedProducts([]);
    setIsDocModalOpen(true);
  };

  const openEditModal = (doc: TechnicalDoc) => {
    setEditingDoc(doc);
    setFormTitle(doc.title);
    setFormCategory(doc.category || categories[0] || "");
    setFormFileUrl(doc.fileUrl);
    setFormFileSize(doc.fileSize || "");
    setFormDescription(doc.description || "");
    setFormSelectedProducts(doc.productIds || []);
    setIsDocModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      showNotification("Vui lòng chọn file định dạng PDF", "warning");
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setFormFileUrl(data.url);
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
        setFormFileSize(`${sizeInMb} MB`);
        if (!formTitle) {
          setFormTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
        showNotification("Tải file PDF thành công", "success");
      } else {
        throw new Error(data.error || "Upload thất bại");
      }
    } catch (error: any) {
      console.error(error);
      showNotification(error.message || "Lỗi tải file lên", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formFileUrl.trim()) {
      showNotification("Vui lòng nhập tên tài liệu và tải lên file PDF", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: editingDoc?.id,
        title: formTitle,
        category: formCategory,
        fileUrl: formFileUrl,
        fileSize: formFileSize || "PDF",
        description: formDescription,
        productIds: formSelectedProducts,
      };

      const res = await fetch("/api/admin/documents", {
        method: editingDoc ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi xử lý tài liệu");

      showNotification(
        editingDoc ? "Cập nhật tài liệu thành công" : "Thêm tài liệu mới thành công",
        "success"
      );
      setIsDocModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error(error);
      showNotification(error.message || "Lỗi lưu tài liệu", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDoc = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài liệu "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/documents?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Lỗi khi xóa");

      showNotification("Đã xóa tài liệu thành công", "success");
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error(error);
      showNotification("Không thể xóa tài liệu", "error");
    }
  };

  // Category management
  const handleAddCategory = async () => {
    if (!newCatInput.trim()) return;
    if (categories.includes(newCatInput.trim())) {
      showNotification("Danh mục này đã tồn tại", "warning");
      return;
    }
    const nextCats = [...categories, newCatInput.trim()];
    try {
      const res = await fetch("/api/admin/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_categories", categories: nextCats }),
      });
      if (res.ok) {
        setCategories(nextCats);
        setNewCatInput("");
        showNotification("Đã thêm danh mục mới", "success");
      }
    } catch (err) {
      showNotification("Lỗi lưu danh mục", "error");
    }
  };

  const handleDeleteCategory = async (catToDelete: string) => {
    if (!confirm(`Xóa danh mục "${catToDelete}"?`)) return;
    const nextCats = categories.filter((c) => c !== catToDelete);
    try {
      const res = await fetch("/api/admin/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_categories", categories: nextCats }),
      });
      if (res.ok) {
        setCategories(nextCats);
        showNotification("Đã xóa danh mục", "success");
      }
    } catch (err) {
      showNotification("Lỗi xóa danh mục", "error");
    }
  };

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === "ALL" || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getProductName = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    return prod ? `${prod.name} (${prod.sku})` : prodId;
  };

  // Count docs per category
  const getCatCount = (cat: string) => documents.filter((d) => d.category === cat).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-28px">description</span>
            <h1 className="text-2xl font-bold text-on-surface font-headline">
              Tài liệu kỹ thuật
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Quản lý kho tài liệu kỹ thuật, bảng thông số (Datasheet), Catalogue và liên kết trực tiếp với sản phẩm.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-bold rounded-xl text-sm shadow-md shadow-primary/20 transition-all active:scale-98"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm tài liệu mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-on-surface-variant uppercase">Tổng tài liệu</span>
            <p className="text-xl font-bold text-on-surface font-headline">{documents.length}</p>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">category</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-on-surface-variant uppercase">Danh mục</span>
            <p className="text-xl font-bold text-on-surface font-headline">{categories.length}</p>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">link</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-on-surface-variant uppercase">Đã nối SP</span>
            <p className="text-xl font-bold text-on-surface font-headline">
              {documents.filter((d) => d.productIds && d.productIds.length > 0).length}
            </p>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">inventory_2</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-on-surface-variant uppercase">Sản phẩm</span>
            <p className="text-xl font-bold text-on-surface font-headline">{products.length}</p>
          </div>
        </div>
      </div>

      {/* Two-column layout: Left = Categories, Right = Document list */}
      <div className="flex gap-6 items-start">
        {/* LEFT: Category Sidebar */}
        <div className="w-64 shrink-0 bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-on-surface font-headline flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">folder</span>
                Danh mục
              </h2>
              <button
                onClick={() => setIsCatModalOpen(true)}
                className="p-1 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="Quản lý danh mục"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
              </button>
            </div>
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm tài liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Category list */}
          <div className="p-2 space-y-0.5 max-h-[calc(100vh-400px)] overflow-y-auto">
            {/* All */}
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === "ALL"
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">folder_open</span>
                Tất cả tài liệu
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                selectedCategory === "ALL"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}>
                {documents.length}
              </span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="material-symbols-outlined text-[16px]">
                    {selectedCategory === cat ? "folder_open" : "folder"}
                  </span>
                  <span className="truncate">{cat}</span>
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                  selectedCategory === cat
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}>
                  {getCatCount(cat)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Document List */}
        <div className="flex-1 min-w-0 bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl animate-spin text-primary">
                progress_activity
              </span>
              <p className="mt-2 text-sm font-medium">Đang tải kho tài liệu...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl text-outline mb-2">
                folder_off
              </span>
              <h3 className="text-base font-bold text-on-surface">
                {selectedCategory !== "ALL"
                  ? `Chưa có tài liệu nào trong "${selectedCategory}"`
                  : "Không tìm thấy tài liệu kỹ thuật nào"}
              </h3>
              <p className="text-xs mt-1">Hãy bấm &quot;Thêm tài liệu mới&quot; để tải tài liệu PDF đầu tiên lên hệ thống.</p>
              <button
                onClick={openCreateModal}
                className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Thêm tài liệu ngay
              </button>
            </div>
          ) : (
            <>
              {/* List header */}
              <div className="px-5 py-3 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {selectedCategory === "ALL" ? "Tất cả" : selectedCategory} — {filteredDocs.length} tài liệu
                </span>
              </div>

              {/* File cards */}
              <div className="divide-y divide-outline-variant/50">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-surface-container-low/50 transition-colors group"
                  >
                    {/* PDF Icon */}
                    <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-sm text-on-surface hover:text-primary transition-colors truncate"
                          title="Nhấp để xem tài liệu PDF"
                        >
                          {doc.title}
                        </a>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                          {doc.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-on-surface-variant">
                        {doc.fileSize && (
                          <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px]">hard_drive</span>
                            {doc.fileSize}
                          </span>
                        )}
                        {doc.productIds && doc.productIds.length > 0 && (
                          <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                            <span className="material-symbols-outlined text-[12px]">link</span>
                            {doc.productIds.length} sản phẩm
                          </span>
                        )}
                        {doc.description && (
                          <span className="truncate max-w-[200px]">{doc.description}</span>
                        )}
                      </div>
                      {/* Linked products badges */}
                      {doc.productIds && doc.productIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {doc.productIds.slice(0, 3).map((pid) => (
                            <Link
                              key={pid}
                              href={`/admin/products/${pid}`}
                              className="text-[10px] font-medium bg-surface-container px-1.5 py-0.5 rounded hover:bg-primary/10 hover:text-primary transition-colors truncate max-w-[180px]"
                              title={getProductName(pid)}
                            >
                              🔗 {getProductName(pid)}
                            </Link>
                          ))}
                          {doc.productIds.length > 3 && (
                            <span className="text-[10px] text-outline font-medium">
                              +{doc.productIds.length - 3} thêm
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Mở file PDF"
                      >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      </a>
                      <button
                        onClick={() => openEditModal(doc)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Sửa tài liệu"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc.id, doc.title)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa tài liệu"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL: Thêm / Sửa Tài liệu */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface w-full max-w-xl rounded-2xl border border-outline-variant shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h3 className="text-lg font-bold text-on-surface font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  {editingDoc ? "edit_document" : "post_add"}
                </span>
                {editingDoc ? "Chỉnh sửa tài liệu kỹ thuật" : "Thêm tài liệu kỹ thuật mới"}
              </h3>
              <button
                onClick={() => setIsDocModalOpen(false)}
                className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitDoc} className="space-y-4">
              {/* Tên tài liệu */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  Tên tài liệu kỹ thuật <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Catalogue Biến tần Schneider ATV310"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              {/* Danh mục tài liệu */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  Danh mục tài liệu <span className="text-red-500">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* File PDF Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  Tệp tài liệu (PDF) <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-outline-variant hover:border-primary rounded-xl p-4 transition-colors bg-surface-container-lowest">
                  {formFileUrl ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-rose-500 text-2xl">picture_as_pdf</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-on-surface truncate">{formFileUrl.split("/").pop()}</p>
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            {formFileSize || "PDF đã sẵn sàng"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <label className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                          Đổi file
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormFileUrl("");
                            setFormFileSize("");
                          }}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                          title="Gỡ file"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer py-3">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <span className={`material-symbols-outlined text-4xl mb-1 ${isUploading ? "text-primary animate-bounce" : "text-outline"}`}>
                        {isUploading ? "cloud_sync" : "upload_file"}
                      </span>
                      <span className="text-xs font-bold text-on-surface">
                        {isUploading ? "Đang tải file lên hệ thống..." : "Nhấp để tải file PDF từ máy tính"}
                      </span>
                      <span className="text-[11px] text-on-surface-variant mt-0.5">
                        Hỗ trợ định dạng .pdf (Datasheet, Bản vẽ, Sách hướng dẫn)
                      </span>
                    </label>
                  )}
                </div>

                {/* Hoặc nhập URL thủ công */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-on-surface-variant shrink-0">Hoặc URL trực tiếp:</span>
                  <input
                    type="text"
                    placeholder="https://... hoặc /uploads/file.pdf"
                    value={formFileUrl}
                    onChange={(e) => setFormFileUrl(e.target.value)}
                    className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-2.5 py-1 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Nối với Sản phẩm */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  Liên kết với sản phẩm (Tùy chọn)
                </label>
                <p className="text-[11px] text-on-surface-variant mb-2">
                  Tài liệu này sẽ tự động xuất hiện trong mục &quot;Tài liệu kỹ thuật&quot; tại trang chi tiết của các sản phẩm được chọn:
                </p>
                <div className="max-h-40 overflow-y-auto border border-outline-variant rounded-xl p-2 bg-surface-container-lowest space-y-1.5">
                  {products.length === 0 ? (
                    <p className="text-xs text-outline p-2">Chưa có sản phẩm nào trong hệ thống</p>
                  ) : (
                    products.map((prod) => {
                      const isChecked = formSelectedProducts.includes(prod.id);
                      return (
                        <label
                          key={prod.id}
                          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            isChecked ? "bg-primary/10 text-primary font-semibold" : "hover:bg-surface-container-low text-on-surface"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormSelectedProducts([...formSelectedProducts, prod.id]);
                              } else {
                                setFormSelectedProducts(formSelectedProducts.filter((id) => id !== prod.id));
                              }
                            }}
                            className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4"
                          />
                          <span className="truncate flex-1">{prod.name}</span>
                          <span className="text-[10px] text-outline font-mono shrink-0">{prod.sku}</span>
                        </label>
                      );
                    })
                  )}
                </div>
                {formSelectedProducts.length > 0 && (
                  <p className="text-[11px] text-primary font-medium mt-1">
                    Đã chọn {formSelectedProducts.length} sản phẩm liên kết.
                  </p>
                )}
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                  Mô tả / Ghi chú (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm về phiên bản tài liệu hoặc hướng dẫn..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 bg-surface-container-high text-on-surface font-semibold rounded-xl text-xs hover:bg-surface-container-highest transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-6 py-2 bg-primary text-on-primary font-bold rounded-xl text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : editingDoc ? "Cập nhật tài liệu" : "Lưu tài liệu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Quản lý Danh mục Tài liệu */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-2xl border border-outline-variant shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h3 className="text-base font-bold text-on-surface font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">folder</span>
                Quản lý Danh mục tài liệu kỹ thuật
              </h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="p-1 text-on-surface-variant hover:bg-surface-container-high rounded-lg"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Thêm danh mục mới */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tên danh mục mới..."
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
              />
              <button
                onClick={handleAddCategory}
                className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shrink-0"
              >
                Thêm
              </button>
            </div>

            {/* Danh sách danh mục */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-semibold text-on-surface"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="material-symbols-outlined text-[16px] text-primary">folder</span>
                    <span className="truncate">{cat}</span>
                    <span className="text-[10px] text-outline font-normal">({getCatCount(cat)} tài liệu)</span>
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg transition-colors"
                    title="Xóa danh mục"
                  >
                    <span className="material-symbols-outlined text-[16px] block">delete</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-outline-variant flex justify-end">
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="px-4 py-1.5 bg-surface-container-high text-on-surface text-xs font-semibold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
