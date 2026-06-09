/**
 * Internal, provider-agnostic stock data shapes.
 *
 * Every data provider (FMP, Finnhub, the mock) is normalized into these types,
 * so the rest of the app — including the valuation engine — never knows or
 * cares which API supplied the numbers.
 */

/** Company identity, shown in the dashboard header. */
export interface CompanyProfile {
  ticker: string;
  name: string;
  exchange: string;
  sector: string | null;
  industry: string | null;
  description: string | null;
  price: number | null;
  changePercent: number | null;
  marketCap: number | null;
  currency: string;
}

/**
 * The fundamental metrics the valuation engine consumes.
 * Any field may be `null` when the provider can't supply it (e.g. P/E for a
 * company with negative earnings). The engine excludes nulls and discloses it.
 */
export interface Fundamentals {
  // Valuation
  peRatio: number | null;
  pbRatio: number | null;
  psRatio: number | null;
  evToEbitda: number | null;
  dividendYield: number | null; // as a fraction, e.g. 0.015 = 1.5%

  // Growth (YoY, as fractions)
  revenueGrowth: number | null;
  earningsGrowth: number | null;

  // Profitability (as fractions)
  netMargin: number | null;
  returnOnEquity: number | null;
  returnOnAssets: number | null;

  // Financial health
  debtToEquity: number | null;
}

/** The complete normalized payload returned by the data service. */
export interface StockData {
  profile: CompanyProfile;
  fundamentals: Fundamentals;
  /** Whether the numbers came from a live provider or the bundled demo set. */
  source: "live" | "demo";
  fetchedAt: string; // ISO timestamp
}

/** A single metric prepared for display (value + formatting + help text). */
export interface DisplayMetric {
  key: string;
  label: string;
  value: number | null;
  /** How to render the value. */
  format: "ratio" | "percent" | "currency" | "number";
  /** One-sentence plain-English explanation (tooltip). */
  help: string;
}

export type MetricGroupKey = "valuation" | "growth" | "profitability";

export interface MetricGroup {
  key: MetricGroupKey;
  title: string;
  metrics: DisplayMetric[];
}
