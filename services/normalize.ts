/**
 * Normalizes raw Financial Modeling Prep (FMP) **stable API** responses into our
 * internal StockData shape. This is the single seam that isolates provider quirks
 * (which endpoint holds which field, percentage vs. fraction) from the rest of
 * the app.
 *
 * Metric sources on the stable API:
 *   - profile            → identity, price, market cap, sector
 *   - ratios-ttm         → P/E, P/B, P/S, dividend yield, net margin, debt/equity
 *   - key-metrics-ttm    → EV/EBITDA, ROE, ROA
 *   - financial-growth   → revenue & earnings growth
 */

import type { Fundamentals, StockData } from "@/types/stock";

interface FmpProfile {
  symbol?: string;
  companyName?: string;
  exchange?: string;
  exchangeFullName?: string;
  sector?: string;
  industry?: string;
  description?: string;
  price?: number;
  changePercentage?: number;
  marketCap?: number;
  currency?: string;
}

type FmpRecord = Record<string, number | undefined>;

function pick(obj: FmpRecord | undefined, ...keys: string[]): number | null {
  if (!obj) return null;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number" && isFinite(v)) return v;
  }
  return null;
}

export function normalizeFmp(
  ticker: string,
  profile: FmpProfile | undefined,
  ratios: FmpRecord | undefined,
  keyMetrics: FmpRecord | undefined,
  growth: FmpRecord | undefined,
): StockData {
  const fundamentals: Fundamentals = {
    peRatio: pick(ratios, "priceToEarningsRatioTTM"),
    pbRatio: pick(ratios, "priceToBookRatioTTM"),
    psRatio: pick(ratios, "priceToSalesRatioTTM"),
    evToEbitda: pick(keyMetrics, "evToEBITDATTM"),
    dividendYield: pick(ratios, "dividendYieldTTM"),
    revenueGrowth: pick(growth, "revenueGrowth"),
    earningsGrowth: pick(growth, "epsgrowth", "netIncomeGrowth"),
    netMargin: pick(ratios, "netProfitMarginTTM"),
    returnOnEquity: pick(keyMetrics, "returnOnEquityTTM"),
    returnOnAssets: pick(keyMetrics, "returnOnAssetsTTM"),
    debtToEquity: pick(ratios, "debtToEquityRatioTTM"),
  };

  return {
    profile: {
      ticker: (profile?.symbol ?? ticker).toUpperCase(),
      name: profile?.companyName ?? ticker.toUpperCase(),
      exchange: profile?.exchange ?? profile?.exchangeFullName ?? "—",
      sector: profile?.sector || null,
      industry: profile?.industry || null,
      description: profile?.description || null,
      price: profile?.price ?? null,
      changePercent: profile?.changePercentage ?? null,
      marketCap: profile?.marketCap ?? null,
      currency: profile?.currency ?? "USD",
    },
    fundamentals,
    source: "live",
    fetchedAt: new Date().toISOString(),
  };
}
