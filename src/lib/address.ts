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