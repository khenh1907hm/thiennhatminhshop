"use client";

import { useEffect, useState } from "react";
import { useNotification } from "@/context/NotificationContext";
import {
  defaultPopupItem,
  defaultPopupStore,
  normalizePopupStore,
  type PopupItem,
  type SitePopupStore,
} from "@/lib/popup";

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminPopupPage() {
  const { showNotification } = useNotification();
  const [store, setStore] = useState<SitePopupStore>({ ...defaultPopupStore });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<PopupItem | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/popup");
      const data = await res.json();
      setStore(normalizePopupStore(data));
    } catch {
      showNotification("Lỗi tải danh sách popup", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const persist = async (next: SitePopupStore) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/popup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error("Lưu thất bại");
      const data = await res.json();
      setStore(normalizePopupStore(data));
      showNotification("Đã lưu danh sách popup", "success");
      return true;
    } catch (err: any) {
      showNotification(err.message || "Lỗi lưu", "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setEditing(defaultPopupItem());
  };

  const openEdit = (item: PopupItem) => {
    setEditing({ ...item });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload thất bại");
      setEditing((prev) => (prev ? { ...prev, imageUrl: data.url } : prev));
      showNotification("Đã tải ảnh popup", "success");
    } catch (err: any) {
      showNotification(err.message || "Lỗi upload", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const saveItem = async () => {
    if (!editing) return;
    if (!editing.imageUrl.trim()) {
      showNotification("Vui lòng tải ảnh hoặc nhập đường dẫn ảnh", "warning");
      return;
    }

    const exists = store.items.some((i) => i.id === editing.id);
    const items = exists
      ? store.items.map((i) => (i.id === editing.id ? editing : i))
      : [...store.items, editing];

    const ok = await persist({ ...store, items });
    if (ok) setEditing(null);
  };

  const toggleEnabled = async (id: string) => {
    const items = store.items.map((i) =>
      i.id === id ? { ...i, enabled: !i.enabled } : i
    );
    await persist({ ...store, items });
  };

  const removeItem = async (id: string) => {
    if (!confirm("Xóa popup này?")) return;
    await persist({ ...store, items: store.items.filter((i) => i.id !== id) });
  };

  const onDrop = async (toIndex: number) => {
    if (dragIndex === null || dragIndex === toIndex) {
      setDragIndex(null);
      return;
    }
    const items = [...store.items];
    const [moved] = items.splice(dragIndex, 1);
    items.splice(toIndex, 0, moved);
    setDragIndex(null);
    setStore((s) => ({ ...s, items }));
    await persist({ ...store, items });
  };

  if (loading) {
    return <div className="p-8 text-slate-500">Đang tải...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Xây dựng Popup</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Danh sách theo thứ tự · kéo thả để đổi vị trí · tắt X xong mới hiện popup kế tiếp · tối đa 3 lần/popup
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm popup
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        {store.items.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Chưa có popup nào. Bấm &quot;Thêm popup&quot; để tạo.
          </div>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {store.items.map((item, index) => (
              <li
                key={item.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(index)}
                className={`flex items-center gap-3 p-4 bg-white hover:bg-surface-container-low/50 transition-colors ${
                  dragIndex === index ? "opacity-60" : ""
                }`}
              >
                <button
                  type="button"
                  className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-700"
                  title="Kéo để đổi thứ tự"
                  aria-label="Kéo"
                >
                  <span className="material-symbols-outlined">drag_indicator</span>
                </button>

                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>

                <div className="w-14 h-14 rounded-lg border border-outline-variant bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span className="material-symbols-outlined text-outline text-xl">image</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-on-surface truncate">{item.title}</div>
                  <div className="text-[11px] text-outline mt-0.5 truncate">
                    {item.startAt || item.endAt
                      ? `${item.startAt ? new Date(item.startAt).toLocaleString("vi-VN") : "…"} → ${
                          item.endAt ? new Date(item.endAt).toLocaleString("vi-VN") : "…"
                        }`
                      : "Không giới hạn thời gian"}
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0" title="Bật/tắt">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={item.enabled}
                    onChange={() => toggleEnabled(item.id)}
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-slate-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>

                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="p-2 text-slate-500 hover:text-primary rounded-lg"
                  title="Sửa"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-lg"
                  title="Xóa"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {saving && (
        <p className="text-xs text-outline text-center">Đang lưu...</p>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setEditing(null)}
            aria-label="Đóng"
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-outline-variant shadow-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-on-surface">
              {store.items.some((i) => i.id === editing.id) ? "Sửa popup" : "Thêm popup"}
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase text-outline mb-1.5">Tên</label>
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-outline mb-1.5">Ảnh</label>
              <div className="flex flex-wrap gap-2 items-center">
                <label className="px-4 py-2 rounded-xl bg-surface-container-high text-sm font-semibold cursor-pointer border border-outline-variant">
                  {uploading ? "Đang tải..." : "Tải ảnh lên"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
                {editing.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setEditing({ ...editing, imageUrl: "" })}
                    className="text-xs text-rose-600 font-semibold underline"
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>
              <input
                type="text"
                value={editing.imageUrl}
                onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                placeholder="Hoặc dán đường dẫn /uploads/..."
                className="mt-2 w-full px-3 py-2 rounded-xl border border-outline-variant text-sm outline-none focus:border-primary"
              />
              <p className="text-[11px] text-outline mt-1">
                Ảnh tự ôm sát khung — chỉ cần giới hạn max width (px) phía dưới nếu ảnh quá lớn.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-outline mb-1.5">
                Max width PC (px) — không bắt buộc chính xác
              </label>
              <input
                type="number"
                min={200}
                max={900}
                value={editing.maxWidth}
                onChange={(e) =>
                  setEditing({ ...editing, maxWidth: parseInt(e.target.value, 10) || 520 })
                }
                className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-outline mb-1.5">Bật từ</label>
                <input
                  type="datetime-local"
                  value={toLocalInput(editing.startAt)}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      startAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-outline mb-1.5">Tắt sau</label>
                <input
                  type="datetime-local"
                  value={toLocalInput(editing.endAt)}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      endAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm"
                />
              </div>
            </div>

            <div className="border-t border-outline-variant pt-3 space-y-3">
              <p className="text-xs font-bold uppercase text-outline">Nút tắt (X) — vị trí &amp; kiểu</p>

              <div>
                <div className="flex justify-between text-xs text-outline mb-1">
                  <span>Ngang (trái → phải)</span>
                  <span className="font-mono font-semibold text-on-surface">{editing.closeBtnX ?? 94}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editing.closeBtnX ?? 94}
                  onChange={(e) =>
                    setEditing({ ...editing, closeBtnX: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-slate-800"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-outline mb-1">
                  <span>Dọc (trên → dưới)</span>
                  <span className="font-mono font-semibold text-on-surface">{editing.closeBtnY ?? 4}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editing.closeBtnY ?? 4}
                  onChange={(e) =>
                    setEditing({ ...editing, closeBtnY: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs text-outline mb-1">Màu icon X</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={editing.closeBtnColor}
                    onChange={(e) => setEditing({ ...editing, closeBtnColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editing.closeBtnColor}
                    onChange={(e) => setEditing({ ...editing, closeBtnColor: e.target.value })}
                    className="flex-1 px-2 py-2 rounded-lg border text-xs font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer">
                <div>
                  <span className="text-sm font-semibold block">Background nút X</span>
                  <span className="text-[11px] text-outline">Mặc định tắt</span>
                </div>
                <input
                  type="checkbox"
                  checked={!!editing.closeBtnBgEnabled}
                  onChange={(e) =>
                    setEditing({ ...editing, closeBtnBgEnabled: e.target.checked })
                  }
                  className="w-5 h-5 rounded"
                />
              </label>

              {editing.closeBtnBgEnabled && (
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={editing.closeBtnBg}
                    onChange={(e) => setEditing({ ...editing, closeBtnBg: e.target.value })}
                    className="w-10 h-10 rounded-lg border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editing.closeBtnBg}
                    onChange={(e) => setEditing({ ...editing, closeBtnBg: e.target.value })}
                    className="flex-1 px-2 py-2 rounded-lg border text-xs font-mono"
                  />
                </div>
              )}

              <label className="flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer">
                <span className="text-sm font-semibold">Bo tròn 50%</span>
                <input
                  type="checkbox"
                  checked={editing.closeBtnRounded}
                  onChange={(e) =>
                    setEditing({ ...editing, closeBtnRounded: e.target.checked })
                  }
                  className="w-5 h-5 rounded"
                />
              </label>

              <label className="flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer">
                <span className="text-sm font-semibold">Bật popup này</span>
                <input
                  type="checkbox"
                  checked={editing.enabled}
                  onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </label>
            </div>

            {editing.imageUrl && (
              <div className="rounded-xl bg-slate-100 p-4 flex justify-center">
                <div
                  className="relative inline-block leading-none"
                  style={{ maxWidth: Math.min(editing.maxWidth || 520, 280) }}
                >
                  <span
                    className="absolute z-10 w-6 h-6 flex items-center justify-center pointer-events-none"
                    style={{
                      left: `${editing.closeBtnX ?? 94}%`,
                      top: `${editing.closeBtnY ?? 4}%`,
                      transform: "translate(-50%, -50%)",
                      color: editing.closeBtnColor,
                      backgroundColor: editing.closeBtnBgEnabled
                        ? editing.closeBtnBg
                        : "transparent",
                      borderRadius: editing.closeBtnRounded ? "50%" : "4px",
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editing.imageUrl} alt="Preview" className="block max-w-full h-auto rounded-md" />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={saveItem}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu popup"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
