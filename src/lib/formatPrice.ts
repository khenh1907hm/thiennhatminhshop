/**
 * Format a number/string price to Vietnamese currency format
 * with dot separators (e.g. 1.500.000 đ)
 */
export function formatPrice(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0 đ';
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(num)) return '0 đ';
  return num.toLocaleString('vi-VN') + ' đ';
}

/** Digits only → "1.500.000" (VN thousand separators while typing) */
export function formatVndInput(value: string | number): string {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('vi-VN');
}

/** "1.500.000" or "1500000" → number */
export function parseVndInput(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

export type PromoLike = {
  code: string;
  discountType: string;
  discountValue: number | string;
};

/** Apply promotion to a base price. Returns selling price, original, and label. */
export function applyPromotion(
  basePrice: number,
  promo: PromoLike | null | undefined
): { price: number; originalPrice: number | null; discount: string | null } {
  if (!promo || !basePrice || basePrice <= 0) {
    return { price: basePrice, originalPrice: null, discount: null };
  }

  const value = typeof promo.discountValue === 'string'
    ? parseFloat(promo.discountValue)
    : Number(promo.discountValue);

  if (!value || isNaN(value)) {
    return { price: basePrice, originalPrice: null, discount: null };
  }

  let final = basePrice;
  let label = '';

  if (promo.discountType === 'PERCENTAGE') {
    final = Math.max(0, Math.round(basePrice * (1 - value / 100)));
    label = `-${value}%`;
  } else {
    // FIXED
    final = Math.max(0, Math.round(basePrice - value));
    label = `-${value.toLocaleString('vi-VN')}đ`;
  }

  if (final >= basePrice) {
    return { price: basePrice, originalPrice: null, discount: null };
  }

  return {
    price: final,
    originalPrice: basePrice,
    discount: label,
  };
}
