/** Display formatting helpers. All return a string ready to render. */

const DASH = "—";

/** A plain ratio like P/E: "28.4". */
export function formatRatio(value: number | null | undefined): string {
  if (value == null || !isFinite(value)) return DASH;
  return value.toFixed(1);
}

/** A fraction rendered as a percentage: 0.153 -> "15.3%". */
export function formatPercent(value: number | null | undefined): string {
  if (value == null || !isFinite(value)) return DASH;
  return `${(value * 100).toFixed(1)}%`;
}

/** A generic number with thousands separators. */
export function formatNumber(value: number | null | undefined): string {
  if (value == null || !isFinite(value)) return DASH;
  return new Intl.NumberFormat("en-US").format(value);
}

/** Currency with sensible precision: 231.4 -> "$231.40". */
export function formatCurrency(
  value: number | null | undefined,
  currency = "USD",
): string {
  if (value == null || !isFinite(value)) return DASH;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Large numbers as compact market caps: 3.21e12 -> "$3.21T". */
export function formatMarketCap(
  value: number | null | undefined,
  currency = "USD",
): string {
  if (value == null || !isFinite(value)) return DASH;
  const symbol = currency === "USD" ? "$" : "";
  const abs = Math.abs(value);
  const units: Array<[number, string]> = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [size, suffix] of units) {
    if (abs >= size) return `${symbol}${(value / size).toFixed(2)}${suffix}`;
  }
  return `${symbol}${value.toFixed(0)}`;
}

/** Signed percentage for day change: 0.0123 -> "+1.23%". */
export function formatChange(value: number | null | undefined): string {
  if (value == null || !isFinite(value)) return DASH;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/** Dispatch on a DisplayMetric `format` tag. */
export function formatByKind(
  value: number | null | undefined,
  kind: "ratio" | "percent" | "currency" | "number",
  currency = "USD",
): string {
  switch (kind) {
    case "percent":
      return formatPercent(value);
    case "currency":
      return formatCurrency(value, currency);
    case "number":
      return formatNumber(value);
    case "ratio":
    default:
      return formatRatio(value);
  }
}
