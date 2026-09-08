"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";
import { parseSpecs } from "@/lib/specs";
import {
  applyPromotion,
  formatPrice,
  formatVndInput,
  parseVndInput,
  type PromoLike,
} from "@/lib/formatPrice";
import SpecsTableEditor from "@/components/admin/SpecsTableEditor";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [availableDocs, setAvailableDocs] = useState<any[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoLike | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoMsg, setPromoMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    brand: "",
    categoryId: "",
    price: "",
    stock: "0",
    description: "",
    isFeatured: false,
  });

  const [images, setImages] = useState<string[]>([""]);
  
  const [specs, setSpecs] = useState<{key: string, value: string}[]>([{key: "", value: ""}]);
  const [docs, setDocs] = useState<{name: string, url: string}[]>([{name: "", url: ""}]);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));

    fetch('/api/admin/brands')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBrands(data);
      })
      .catch(err => console.error(err));

    fetch('/api/admin/documents')
      .then(res => res.json())
      .then(data => {
        if (data.documents && Array.isArray(data.documents)) {
          setAvailableDocs(data.documents);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        
        const base =
          data.originalPrice != null && Number(data.originalPrice) > 0
            ? Number(data.originalPrice)
            : Number(data.price) || 0;

        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          sku: data.sku || "",
          brand: data.brand || "",
          categoryId: data.categoryId || "",
          price: base ? formatVndInput(String(Math.round(base))) : "",
          stock: data.stock ? String(data.stock) : "0",
          description: data.description || "",
          isFeatured: data.isFeatured || false,
        });

        if (data.discount && data.originalPrice != null) {
          setPromoMsg(`Đang có KM: ${data.discount} — nhập lại mã nếu muốn giữ/đổi`);
        }

        if (data.images && data.images.length > 0) {
          setImages(data.images);
        }

        if (data.specs) {
          const parsed = parseSpecs(data.specs);
          const flatSpecs: { key: string; value: string }[] = [];
          for (const group of parsed) {
            for (const item of group.items) {
              flatSpecs.push({
                key: item.label || group.category || "",
                value: item.value
              });
            }
          }
          if (flatSpecs.length > 0) {
            setSpecs(flatSpecs);
          }
        }

        if (data.documents) {
          if (Array.isArray(data.documents) && data.documents.length > 0) {
            setDocs(data.documents);
          }
        }
      } catch (error: any) {
        console.error(error);
        showNotification("Lỗi tải thông tin sản phẩm", "error");
        router.push("/admin/products");
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchProduct();
  }, [id, router, showNotification]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
      
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'price') {
      setFormData((prev) => ({ ...prev, price: formatVndInput(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const clearPromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoMsg(null);
  };

  const validatePromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      clearPromo();
      return;
    }
    setValidatingPromo(true);
    setPromoMsg(null);
    try {
      const res = await fetch(`/api/admin/promotions/validate?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mã không hợp lệ");
      setAppliedPromo({
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
      });
      setPromoCode(data.code);
      setPromoMsg(`Áp dụng ${data.code} thành công`);
      showNotification(`Đã áp dụng mã ${data.code}`, "success");
    } catch (err: any) {
      setAppliedPromo(null);
      setPromoMsg(err.message || "Mã không hợp lệ");
      showNotification(err.message || "Mã không hợp lệ", "error");
    } finally {
      setValidatingPromo(false);
    }
  };

  const basePrice = parseVndInput(formData.price);
  const priced = applyPromotion(basePrice, appliedPromo);

  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadingDocIndex, setUploadingDocIndex] = useState<number | null>(null);

  const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          uploadedUrls.push(data.url);
        } else {
          console.error("Upload failed for a file:", data.error);
        }
      }
      
      setImages(prev => [...prev.filter(url => url !== ""), ...uploadedUrls]);
      showNotification(`Tải lên thành công ${uploadedUrls.length} ảnh`, "success");
    } catch (error) {
      console.error(error);
      showNotification("Lỗi khi tải ảnh lên", "error");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };
  const addSpecField = () => setSpecs([...specs, {key: "", value: ""}]);
  const removeSpecField = (index: number) => setSpecs(specs.filter((_, i) => i !== index));

  const handleDocChange = (index: number, field: 'name' | 'url', value: string) => {
    const newDocs = [...docs];
    newDocs[index][field] = value;
    setDocs(newDocs);
  };

  const handleDocUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocIndex(index);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        handleDocChange(index, 'url', data.url);
        if (!docs[index].name) {
          handleDocChange(index, 'name', file.name);
        }
        showNotification("Tải tài liệu thành công", "success");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error(error);
      showNotification("Lỗi tải tài liệu", "error");
    } finally {
      setUploadingDocIndex(null);
    }
  };

  const addDocField = () => setDocs([...docs, {name: "", url: ""}]);
  const removeDocField = (index: number) => setDocs(docs.filter((_, i) => i !== index));

  const handleSelectFromLibrary = (docId: string) => {
    if (!docId) return;
    const selected = availableDocs.find((d) => d.id === docId);
    if (!selected) return;

    if (docs.some((d) => d.url === selected.fileUrl)) {
      showNotification("Tài liệu này đã được thêm vào sản phẩm", "warning");
      return;
    }

    const emptyIndex = docs.findIndex((d) => !d.name && !d.url);
    if (emptyIndex !== -1) {
      const newDocs = [...docs];
      newDocs[emptyIndex] = { name: selected.title, url: selected.fileUrl };
      setDocs(newDocs);
    } else {
      setDocs((prev) => [...prev, { name: selected.title, url: selected.fileUrl }]);
    }
    showNotification(`Đã đính kèm tài liệu: ${selected.title}`, "success");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedSpecs = specs.reduce((acc, curr) => {
        if (curr.key && curr.value) acc[curr.key] = curr.value;
        return acc;
      }, {} as any);

      const formattedDocs = docs.filter(d => d.name && d.url);
      const formattedImages = images.filter(img => img.trim() !== "");

      if (!basePrice || basePrice <= 0) {
        throw new Error("Vui lòng nhập giá bán hợp lệ");
      }

      const { price, originalPrice, discount } = applyPromotion(basePrice, appliedPromo);

      const payload = {
        ...formData,
        price,
        originalPrice,
        discount,
        stock: parseInt(formData.stock),
        images: formattedImages,
        specs: Object.keys(formattedSpecs).length > 0 ? formattedSpecs : null,
        documents: formattedDocs.length > 0 ? formattedDocs : null,
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      showNotification("Cập nhật sản phẩm thành công", "success");
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/products"
          className="p-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Cập nhật Sản phẩm</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Chỉnh sửa thông tin cho mã: <span className="font-mono text-primary font-bold">{formData.sku}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-on-surface font-headline border-b border-outline-variant pb-2">Thông tin cơ bản</h2>
            
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input type="text" name="name" required value={formData.name} onChange={handleNameChange} className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Đường dẫn (Slug) <span className="text-red-500">*</span></label>
                <input type="text" name="slug" required value={formData.slug} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Mã SKU <span className="text-red-500">*</span></label>
                <input type="text" name="sku" required value={formData.sku} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm uppercase" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Danh mục <span className="text-red-500">*</span></label>
                <select name="categoryId" required value={formData.categoryId} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer">
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Thương hiệu</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer"
                >
                  <option value="">-- Chọn thương hiệu --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                  {formData.brand &&
                    !brands.some(
                      (b) => b.name.toLowerCase() === formData.brand.toLowerCase()
                    ) && (
                      <option value={formData.brand}>{formData.brand}</option>
                    )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Mô tả sản phẩm <span className="text-red-500">*</span></label>
              <textarea name="description" required value={formData.description} onChange={handleChange} rows={6} className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-y" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-on-surface font-headline border-b border-outline-variant pb-2">Giá & Tồn kho</h2>
            
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="1.500.000"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:border-primary text-sm font-bold text-primary"
              />
              <p className="text-[11px] text-outline mt-1">Nhập số, tự thêm dấu chấm hàng nghìn</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Mã khuyến mãi</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setAppliedPromo(null);
                    setPromoMsg(null);
                  }}
                  placeholder="VD: SALE10"
                  className="flex-1 min-w-0 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 text-sm outline-none focus:border-primary font-mono font-bold uppercase"
                />
                <button
                  type="button"
                  onClick={validatePromo}
                  disabled={validatingPromo || !promoCode.trim()}
                  className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:opacity-50 shrink-0"
                >
                  {validatingPromo ? "..." : "Áp dụng"}
                </button>
              </div>
              {promoMsg && (
                <p className={`text-xs mt-1.5 ${appliedPromo ? "text-emerald-600" : "text-rose-600"}`}>
                  {promoMsg}
                </p>
              )}
              {appliedPromo && (
                <button type="button" onClick={clearPromo} className="text-xs text-outline hover:text-rose-600 mt-1 underline">
                  Bỏ mã khuyến mãi
                </button>
              )}
            </div>

            {basePrice > 0 && (
              <div className="rounded-xl border border-outline-variant bg-surface-container-low p-3 text-sm space-y-1">
                {priced.originalPrice != null ? (
                  <>
                    <div className="flex justify-between text-outline">
                      <span>Giá gốc</span>
                      <span className="line-through">{formatPrice(priced.originalPrice)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-primary">
                      <span>Giá sau KM {priced.discount}</span>
                      <span>{formatPrice(priced.price)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between font-bold text-primary">
                    <span>Giá bán</span>
                    <span>{formatPrice(priced.price)}</span>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Tồn kho <span className="text-red-500">*</span></label>
              <input type="number" name="stock" required min="0" value={formData.stock} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:border-primary text-sm" />
            </div>

            <label className="flex items-center gap-3 cursor-pointer mt-4 p-3 border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors">
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" />
              <div>
                <span className="block text-sm font-semibold text-on-surface">Sản phẩm nổi bật</span>
                <span className="block text-xs text-on-surface-variant">Sẽ hiển thị ngoài trang chủ</span>
              </div>
            </label>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant pb-2">
              <h2 className="text-lg font-bold text-on-surface font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">description</span>
                Tài liệu kỹ thuật & Thông số
              </h2>
              <Link
                href="/admin/documents"
                target="_blank"
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5"
              >
                Kho tài liệu
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </Link>
            </div>

            <div>
              <h3 className="text-sm font-bold text-on-surface mb-3">Thông số kỹ thuật</h3>
              <SpecsTableEditor
                specs={specs}
                onChange={handleSpecChange}
                onAdd={addSpecField}
                onRemove={removeSpecField}
              />
            </div>

            <div className="border-t border-outline-variant pt-5 space-y-4">
              <h3 className="text-sm font-bold text-on-surface">Tài liệu PDF</h3>

            {availableDocs.length > 0 && (
              <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-3 space-y-2">
                <label className="block text-xs font-bold text-blue-900">Chọn từ kho tài liệu:</label>
                <select
                  onChange={(e) => {
                    handleSelectFromLibrary(e.target.value);
                    e.target.value = "";
                  }}
                  defaultValue=""
                  className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                >
                  <option value="" disabled>-- Chọn tài liệu có sẵn ({availableDocs.length}) --</option>
                  {availableDocs.map((ad) => (
                    <option key={ad.id} value={ad.id}>[{ad.category}] {ad.title}</option>
                  ))}
                </select>
              </div>
            )}

            {docs.map((doc, i) => (
              <div key={i} className="space-y-3 p-4 bg-surface-container-lowest border border-outline-variant rounded-xl">
                <input type="text" placeholder="Tên tài liệu (vd: Hướng dẫn sử dụng)" value={doc.name} onChange={(e) => handleDocChange(i, 'name', e.target.value)} className="w-full min-w-0 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                <div className="flex gap-2 items-center justify-between">
                  {doc.url ? (
                    <span className="text-sm text-primary font-medium truncate flex-1" title={doc.url}>
                      <span className="material-symbols-outlined text-[16px] align-middle mr-1">check_circle</span>
                      Đã tải lên
                    </span>
                  ) : (
                    <span className="text-sm text-outline italic flex-1">Chưa tải file...</span>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <div className="relative flex-shrink-0">
                      <input type="file" onChange={(e) => handleDocUpload(i, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Tải tài liệu từ máy" />
                      <button type="button" className="px-3 py-1.5 bg-surface-container-high border border-outline-variant rounded-lg text-sm font-semibold hover:bg-surface-container-highest transition-colors flex items-center gap-1 whitespace-nowrap">
                        <span className="material-symbols-outlined text-[18px]">upload</span>
                        {uploadingDocIndex === i ? 'Đang...' : (doc.url ? 'Đổi' : 'Tải lên')}
                      </button>
                    </div>
                    <button type="button" onClick={() => removeDocField(i)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg bg-white border border-outline-variant flex-shrink-0" title="Xóa tài liệu">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addDocField} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-[16px]">add</span> Thêm tài liệu thủ công
            </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant pb-2">
              <div>
                <h2 className="text-lg font-bold text-on-surface font-headline">Thư viện ảnh sản phẩm</h2>
                <p className="text-sm text-on-surface-variant mt-1">Ảnh đầu tiên sẽ được chọn làm ảnh đại diện cho sản phẩm.</p>
              </div>
              <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {images.filter(img => img !== "").length} ảnh
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-4">
              {images.filter(img => img !== "").map((img, i) => (
                <div key={i} className={`relative group aspect-square rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${i === 0 ? 'border-4 border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-2 border-outline-variant bg-surface-container-lowest'}`}>
                  <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                  
                  {i === 0 && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary/90 to-transparent pt-1.5 pb-4 px-2">
                      <span className="text-xs font-bold text-on-primary flex items-center justify-center gap-1 drop-shadow-md">
                        <span className="material-symbols-outlined text-[14px]">star</span> Ảnh đại diện
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    {i !== 0 && (
                      <button 
                        type="button" 
                        onClick={() => {
                          const newImages = [...images];
                          const temp = newImages[0];
                          newImages[0] = newImages[i];
                          newImages[i] = temp;
                          setImages(newImages);
                        }}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-lg hover:bg-primary/90 hover:scale-105 transition-all"
                      >
                        Đặt làm đại diện
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={() => setImages(prev => prev.filter(url => url !== img))}
                      className="p-2 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 hover:scale-110 transition-all"
                      title="Xóa ảnh"
                    >
                      <span className="material-symbols-outlined text-[18px] block">delete</span>
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="relative aspect-square rounded-xl border-2 border-dashed border-outline hover:border-primary transition-colors bg-surface-container-lowest hover:bg-surface-container-low flex flex-col items-center justify-center cursor-pointer group">
                <input type="file" multiple accept="image/*" onChange={handleMultiImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Chọn nhiều ảnh" disabled={isUploadingImages} />
                <span className={`material-symbols-outlined text-4xl mb-2 ${isUploadingImages ? 'text-primary animate-pulse' : 'text-outline-variant group-hover:text-primary transition-colors'}`}>
                  {isUploadingImages ? 'cloud_sync' : 'add_photo_alternate'}
                </span>
                <span className="text-sm font-semibold text-on-surface-variant text-center px-2 group-hover:text-primary transition-colors">
                  {isUploadingImages ? 'Đang tải...' : 'Tải lên nhiều ảnh'}
                </span>
                <span className="text-xs text-outline mt-1 hidden sm:block">Kéo thả hoặc click</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex justify-end gap-3 p-4 bg-surface rounded-2xl border border-outline-variant shadow-sm sticky bottom-4 z-10">
          <Link href="/admin/products" className="px-6 py-2.5 bg-surface-container-high text-on-surface font-semibold rounded-xl text-sm hover:bg-outline-variant/30 transition-colors">
            Hủy
          </Link>
          <button type="submit" disabled={loading} className="px-8 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50">
            {loading ? "Đang lưu..." : "Cập nhật Sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
}
