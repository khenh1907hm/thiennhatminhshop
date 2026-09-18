export type AddressOption = {
  code: number;
  name: string;
  districts?: AddressOption[];
  wards?: AddressOption[];
};

export function parseAddressOptions(payload: unknown): AddressOption[] {
  const source = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && "value" in payload
      ? (payload as { value: unknown }).value
      : payload;

  if (Array.isArray(source)) {
    return source.flatMap((item, index) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      const code = Number(record.code ?? record.key ?? index);
      const name = String(record.name ?? record.value ?? record.label ?? "");
      if (!name) return [];
      return [{ code, name, districts: parseAddressOptions(record.districts), wards: parseAddressOptions(record.wards) }];
    });
  }

  if (source && typeof source === "object") {
    return Object.entries(source).flatMap(([key, value]) => {
      const name = typeof value === "string" ? value : String((value as Record<string, unknown>)?.name ?? "");
      if (!name) return [];
      return [{ code: Number(key), name }];
    });
  }

  return [];
}

export function parseAddressOption(payload: unknown): AddressOption {
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  return {
    code: Number(record.code ?? record.key ?? 0),
    name: String(record.name ?? record.value ?? record.label ?? ""),
    districts: parseAddressOptions(record.districts),
    wards: parseAddressOptions(record.wards),
  };
}

const resolvedAddressCache = new Map<string, string>();

export async function resolveStoredAddress(address: string | null | undefined): Promise<string> {
  const value = address?.trim() || "";
  if (!value) return value;
  const cached = resolvedAddressCache.get(value);
  if (cached) return cached;

  const parts = value.split(",").map((part) => part.trim());
  if (parts.length < 4) return value;
  const codes = parts.slice(-3);
  if (!codes.every((code) => /^\d+$/.test(code))) return value;

  try {
    const [provinceResponse, districtResponse] = await Promise.all([
      fetch(`https://provinces.open-api.vn/api/p/${codes[2]}?depth=1`),
      fetch(`https://provinces.open-api.vn/api/d/${codes[1]}?depth=2`),
    ]);
    if (!provinceResponse.ok || !districtResponse.ok) return value;

    const province = parseAddressOption(await provinceResponse.json());
    const district = parseAddressOption(await districtResponse.json());
    const ward = district.wards?.find((item) => String(item.code) === codes[0]);
    if (!province.name || !district.name || !ward?.name) return value;

    const resolved = [...parts.slice(0, -3), ward.name, district.name, province.name].join(", ");
    resolvedAddressCache.set(value, resolved);
    return resolved;
  } catch {
    return value;
  }
}