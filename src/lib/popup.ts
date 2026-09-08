export type PopupItem = {
  id: string;
  title: string;
  enabled: boolean;
  imageUrl: string;
  /** Chỉ là giới hạn tối đa (px) trên PC — ảnh tự ôm sát, không cố định khung */
  maxWidth: number;
  closeBtnColor: string;
  closeBtnBg: string;
  closeBtnBgEnabled: boolean;
  closeBtnRounded: boolean;
  /** Vị trí X: % từ trái (0–100) */
  closeBtnX: number;
  /** Vị trí Y: % từ trên (0–100) */
  closeBtnY: number;
  startAt: string | null;
  endAt: string | null;
};

export type SitePopupStore = {
  items: PopupItem[];
  /** Mỗi popup hiện tối đa N lần / trình duyệt */
  maxShowsPerPopup: number;
  updatedAt?: string;
};

export const defaultPopupItem = (): PopupItem => ({
  id: `popup_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  title: "Popup mới",
  enabled: true,
  imageUrl: "",
  maxWidth: 520,
  closeBtnColor: "#ffffff",
  closeBtnBg: "#1e293b",
  closeBtnBgEnabled: false,
  closeBtnRounded: true,
  closeBtnX: 94,
  closeBtnY: 4,
  startAt: null,
  endAt: null,
});

export const defaultPopupStore: SitePopupStore = {
  items: [],
  maxShowsPerPopup: 3,
};

/** Migrate old single-popup config → list */
export function normalizePopupStore(raw: unknown): SitePopupStore {
  if (!raw || typeof raw !== "object") return { ...defaultPopupStore };

  const obj = raw as Record<string, unknown>;

  if (Array.isArray(obj.items)) {
    return {
      items: obj.items.map((it, i) => {
        const item = it as Partial<PopupItem>;
        return {
          ...defaultPopupItem(),
          ...item,
          id: item.id || `popup_${i}_${Date.now()}`,
          title: item.title || `Popup ${i + 1}`,
          maxWidth: item.maxWidth || 520,
          closeBtnBgEnabled: item.closeBtnBgEnabled ?? false,
          closeBtnX: typeof item.closeBtnX === "number" ? item.closeBtnX : 94,
          closeBtnY: typeof item.closeBtnY === "number" ? item.closeBtnY : 4,
        };
      }),
      maxShowsPerPopup: Number(obj.maxShowsPerPopup) || 3,
      updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : undefined,
    };
  }

  // Legacy single popup
  if (obj.imageUrl || obj.enabled !== undefined) {
    const legacy = obj as Partial<PopupItem> & {
      desktopMaxWidth?: number;
      closeBtnBgEnabled?: boolean;
      maxShows?: number;
      updatedAt?: string;
    };
    if (!legacy.imageUrl && !legacy.enabled) {
      return { ...defaultPopupStore, updatedAt: legacy.updatedAt };
    }
    return {
      items: [
        {
          ...defaultPopupItem(),
          id: `popup_legacy_${legacy.updatedAt || "v1"}`,
          title: "Popup chính",
          enabled: !!legacy.enabled,
          imageUrl: String(legacy.imageUrl || ""),
          maxWidth: legacy.desktopMaxWidth || legacy.maxWidth || 520,
          closeBtnColor: legacy.closeBtnColor || "#ffffff",
          closeBtnBg: legacy.closeBtnBg || "#1e293b",
          closeBtnBgEnabled: legacy.closeBtnBgEnabled ?? false,
          closeBtnRounded: legacy.closeBtnRounded ?? true,
          closeBtnX: 94,
          closeBtnY: 4,
          startAt: (legacy.startAt as string) || null,
          endAt: (legacy.endAt as string) || null,
        },
      ],
      maxShowsPerPopup: legacy.maxShows || 3,
      updatedAt: legacy.updatedAt,
    };
  }

  return { ...defaultPopupStore };
}

export function isPopupInSchedule(item: PopupItem, now = new Date()) {
  if (item.startAt && new Date(item.startAt) > now) return false;
  if (item.endAt && new Date(item.endAt) < now) return false;
  return true;
}
