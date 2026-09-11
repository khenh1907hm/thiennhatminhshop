export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const vietnamesePhonePattern = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

export function normalizePhone(value: unknown) {
  return String(value || "").replace(/[\s().-]/g, "");
}

export function isValidEmail(value: unknown) {
  return typeof value === "string" && value.length <= 254 && emailPattern.test(value.trim().toLowerCase());
}

export function isValidVietnamesePhone(value: unknown) {
  return vietnamesePhonePattern.test(normalizePhone(value));
}

export function parseNonNegativeMoney(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function parseNonNegativeInteger(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}
