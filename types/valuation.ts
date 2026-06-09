/** Valuation scoring types — output of the pure engine in lib/valuation. */

export type VerdictKey = "expensive" | "fair" | "attractive";
export type CategoryKey = "valuation" | "growth" | "profitability" | "health";

/** A single metric's contribution to its category. */
export interface MetricScore {
  key: string;
  label: string;
  value: number | null;
  /** 0–10 sub-score, or null if the metric was excluded (missing/N/A). */
  score: number | null;
}

/** One scored category (e.g. Valuation), with its constituent metric scores. */
export interface CategoryScore {
  key: CategoryKey;
  title: string;
  weight: number; // 0–1
  /** 0–10 average over available metrics, or null if none were available. */
  score: number | null;
  metrics: MetricScore[];
}

export interface Verdict {
  key: VerdictKey;
  label: string;
  explanation: string;
}

/** The complete result of scoring a stock. */
export interface ValuationResult {
  /** Final 0–10 score, rounded to one decimal. */
  score: number;
  verdict: Verdict;
  categories: CategoryScore[];
  /** Human-readable labels of metrics that were excluded from scoring. */
  excluded: string[];
}
