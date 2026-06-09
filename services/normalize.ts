/**
 * Normalizes raw Financial Modeling Prep (FMP) responses into our internal
 * StockData shape. This is the single seam that isolates provider quirks
 * (field naming, percentage vs. fraction conventions) from the rest of the app.
 */

import type { Fundamentals, StockData } from "@/types/stock";

/* FMP returns most ratios already computed. Field names vary slightly across
 * their endpoints/versions, so we read defensively with fallbacks. */

interface FmpProfile {
  symbol?: string;
  companyName?: string;
  exchangeShortName?: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  description?: string;
  price?: number;
  changePercentage?: number;
  changes?: number;
  mktCap?: number;
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
  growth: FmpRecord | undefined,
): StockData {
  const fundamentals: Fundamentals = {
    peRatio: pick(ratios, "peRatioTTM", "priceEarningsRatioTTM"),
    pbRatio: pick(ratios, "priceToBookRatioTTM", "pbRatioTTM"),
    psRatio: pick(ratios, "priceToSalesRatioTTM", "priceSalesRatioTTM"),
    evToEbitda: pick(
      ratios,
      "enterpriseValueMultipleTTM",
      "evToEbitdaTTM",
      "enterpriseValueOverEBITDATTM",
    ),
    dividendYield: pick(ratios, "dividendYielTTM", "dividendYieldTTM"),
    revenueGrowth: pick(growth, "revenueGrowth", "growthRevenue"),
    earningsGrowth: pick(
      growth,
      "epsgrowth",
      "growthEPS",
      "netIncomeGrowth",
      "growthNetIncome",
    ),
    netMargin: pick(ratios, "netProfitMarginTTM", "netIncomePerShareTTM"),
    returnOnEquity: pick(ratios, "returnOnEquityTTM", "roeTTM"),
    returnOnAssets: pick(ratios, "returnOnAssetsTTM", "roaTTM"),
    debtToEquity: pick(ratios, "debtEquityRatioTTM", "debtToEquityTTM"),
  };

  return {
    profile: {
      ticker: (profile?.symbol ?? ticker).toUpperCase(),
      name: profile?.companyName ?? ticker.toUpperCase(),
      exchange: profile?.exchangeShortName ?? profile?.exchange ?? "—",
      sector: profile?.sector ?? null,
      industry: profile?.industry ?? null,
      description: profile?.description ?? null,
      price: profile?.price ?? null,
      changePercent: profile?.changePercentage ?? null,
      marketCap: profile?.mktCap ?? profile?.marketCap ?? null,
      currency: profile?.currency ?? "USD",
    },
    fundamentals,
    source: "live",
    fetchedAt: new Date().toISOString(),
  };
}
