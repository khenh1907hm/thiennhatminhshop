export interface SpecItem {
  label: string;
  value: string;
}

export interface SpecGroup {
  category?: string;
  items: SpecItem[];
}

export const formatSpecValue = (val: any): string => {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (Array.isArray(val)) {
    return val
      .map((v) => {
        if (typeof v === "object" && v !== null) {
          return v.value || v.label || JSON.stringify(v);
        }
        return String(v);
      })
      .join(", ");
  }
  if (typeof val === "object") {
    if ("value" in val) return String(val.value);
    if ("label" in val) return String(val.label);
    return JSON.stringify(val);
  }
  return String(val);
};

export const parseSpecs = (specs: any): SpecGroup[] => {
  if (!specs) return [];

  let raw = specs;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [{ items: [{ label: "Thông số", value: raw }] }];
    }
  }

  if (Array.isArray(raw)) {
    const items: SpecItem[] = [];
    for (const item of raw) {
      if (typeof item === "string" || typeof item === "number") {
        items.push({ label: "", value: String(item) });
      } else if (typeof item === "object" && item !== null) {
        const label = item.label || item.key || item.name || item.title || "";
        const value = formatSpecValue(item.value ?? item.val ?? item.text ?? "");
        if (label || value) {
          items.push({ label, value });
        }
      }
    }
    return items.length > 0 ? [{ items }] : [];
  }

  if (typeof raw === "object" && raw !== null) {
    // 1. Check for category1/specs1, category2/specs2 pattern
    const hasCategoryPattern = Object.keys(raw).some(
      (k) => /^category\d+$/i.test(k) || /^specs\d+$/i.test(k)
    );

    if (hasCategoryPattern) {
      const groups: SpecGroup[] = [];
      const catNumbers = new Set<string>();
      Object.keys(raw).forEach((k) => {
        const match = k.match(/^(?:category|specs)(\d+)$/i);
        if (match) catNumbers.add(match[1]);
      });

      const sortedNums = Array.from(catNumbers).sort((a, b) => Number(a) - Number(b));
      for (const num of sortedNums) {
        const categoryName = raw[`category${num}`] || raw[`Category${num}`] || "";
        const rawList = raw[`specs${num}`] || raw[`Specs${num}`] || [];
        const items: SpecItem[] = [];

        if (Array.isArray(rawList)) {
          for (const it of rawList) {
            if (typeof it === "object" && it !== null) {
              items.push({
                label: it.label || it.key || it.name || "",
                value: formatSpecValue(it.value ?? "")
              });
            } else {
              items.push({ label: "", value: formatSpecValue(it) });
            }
          }
        } else if (typeof rawList === "object" && rawList !== null) {
          for (const [k, v] of Object.entries(rawList)) {
            items.push({ label: k, value: formatSpecValue(v) });
          }
        }

        if (items.length > 0) {
          groups.push({ category: categoryName, items });
        }
      }
      if (groups.length > 0) return groups;
    }

    // 2. Check if object values are arrays (e.g. { "Khung": [...], "Động cơ": [...] })
    const entries = Object.entries(raw);
    const hasArrayValues = entries.some(([_, v]) => Array.isArray(v));
    if (hasArrayValues) {
      const groups: SpecGroup[] = [];
      for (const [cat, val] of entries) {
        if (Array.isArray(val)) {
          const items: SpecItem[] = val.map((it) => {
            if (typeof it === "object" && it !== null) {
              return {
                label: it.label || it.key || it.name || "",
                value: formatSpecValue(it.value ?? "")
              };
            }
            return { label: "", value: formatSpecValue(it) };
          });
          if (items.length > 0) {
            groups.push({ category: cat, items });
          }
        } else if (typeof val === "object" && val !== null) {
          const items = Object.entries(val).map(([k, v]) => ({
            label: k,
            value: formatSpecValue(v)
          }));
          if (items.length > 0) {
            groups.push({ category: cat, items });
          }
        } else {
          groups.push({ items: [{ label: cat, value: formatSpecValue(val) }] });
        }
      }
      if (groups.length > 0) return groups;
    }

    // 3. Flat object: { "Điện áp": "220V", "Công suất": "10kVA" }
    const flatItems: SpecItem[] = [];
    for (const [key, value] of entries) {
      flatItems.push({
        label: key,
        value: formatSpecValue(value)
      });
    }
    return flatItems.length > 0 ? [{ items: flatItems }] : [];
  }

  return [];
};
