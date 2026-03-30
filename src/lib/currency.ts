/**
 * Format an integer amount (in đồng, VND) to a display string.
 * Example: 1500000 → "1.500.000 ₫"
 */
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse a user-typed string into an integer VND amount.
 * Strips dots, commas, and currency symbols before parsing.
 * Returns NaN if the input cannot be parsed as a positive integer.
 */
export function parseVnd(input: string): number {
  const cleaned = input.replace(/[.,\s₫đ]/g, "").trim();
  const value = parseInt(cleaned, 10);
  return isNaN(value) || value <= 0 ? NaN : value;
}

/**
 * Format for display in table cells with colour prefix.
 * Returns the formatted string without the ₫ symbol for compact layouts.
 */
export function formatVndShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K`;
  }
  return amount.toString();
}
