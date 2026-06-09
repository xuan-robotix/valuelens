import "server-only";
import type { ValuationHistoryPoint } from "@/types/stock";
import { FMP_BASE, fetchFmpJson } from "./fmpClient";
import { registerFetch } from "./supabase/usage";

/**
 * Historical annual valuation ratios for the trend chart. Live-only — there is
 * no real history for demo data, and we won't fabricate it, so demo mode returns
 * null and the chart simply doesn't render. Free tier caps the series at 5 years.
 *
 * Non-critical: any failure (including hitting the quota) returns null rather
 * than throwing, so a missing chart never breaks the dashboard.
 */
export async function getValuationHistory(
  ticker: string,
): Promise<ValuationHistoryPoint[] | null> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) return null;

  try {
    await registerFetch(`hist:${ticker}`, 1);
    const raw = await fetchFmpJson(
      `${FMP_BASE}/ratios?symbol=${ticker}&period=annual&limit=5&apikey=${apiKey}`,
    );
    if (!Array.isArray(raw) || raw.length === 0) return null;

    const points: ValuationHistoryPoint[] = raw
      .map((r: Record<string, unknown>) => ({
        year: String(r.date ?? "").slice(0, 4),
        peRatio: numOrNull(r.priceToEarningsRatio),
        psRatio: numOrNull(r.priceToSalesRatio),
      }))
      .filter((p) => p.year)
      .reverse(); // oldest → newest

    return points.length >= 2 ? points : null;
  } catch {
    return null;
  }
}

function numOrNull(v: unknown): number | null {
  return typeof v === "number" && isFinite(v) ? v : null;
}
