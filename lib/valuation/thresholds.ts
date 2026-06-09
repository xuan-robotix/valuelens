/**
 * Scoring configuration: category weights and per-metric threshold ladders.
 *
 * This file is intentionally config-like and data-driven so the model can be
 * tuned (or, in Phase 3, made sector-relative) without touching engine logic.
 *
 * A "ladder" maps a raw metric value to a 0–10 sub-score. Each ladder is a list
 * of [boundary, score] steps evaluated in order. `direction` controls comparison:
 *   - "lowerIsBetter": value <= boundary  -> score  (cheap ratios score high)
 *   - "higherIsBetter": value >= boundary -> score  (growth/quality score high)
 */

import type { CategoryKey } from "@/types/valuation";

export type LadderDirection = "lowerIsBetter" | "higherIsBetter";

export interface MetricSpec {
  /** Field on Fundamentals. */
  key: string;
  label: string;
  direction: LadderDirection;
  /** Ordered [boundary, score] steps; first match wins. */
  ladder: Array<[number, number]>;
  /**
   * Optional guard: if the raw value is <= this, exclude the metric entirely.
   * Used for e.g. negative P/E (a loss) where the ratio is meaningless.
   */
  excludeAtOrBelow?: number;
}

export interface CategorySpec {
  key: CategoryKey;
  title: string;
  weight: number;
  metrics: MetricSpec[];
}

export const CATEGORIES: CategorySpec[] = [
  {
    key: "valuation",
    title: "Valuation",
    weight: 0.4,
    metrics: [
      {
        key: "peRatio",
        label: "P/E Ratio",
        direction: "lowerIsBetter",
        excludeAtOrBelow: 0,
        ladder: [
          [10, 10],
          [15, 8],
          [20, 6],
          [25, 5],
          [35, 3],
          [Infinity, 1],
        ],
      },
      {
        key: "pbRatio",
        label: "P/B Ratio",
        direction: "lowerIsBetter",
        excludeAtOrBelow: 0,
        ladder: [
          [1, 10],
          [2, 8],
          [3, 6],
          [5, 4],
          [8, 2],
          [Infinity, 1],
        ],
      },
      {
        key: "psRatio",
        label: "P/S Ratio",
        direction: "lowerIsBetter",
        excludeAtOrBelow: 0,
        ladder: [
          [1, 10],
          [2, 8],
          [4, 6],
          [7, 4],
          [12, 2],
          [Infinity, 1],
        ],
      },
      {
        key: "evToEbitda",
        label: "EV / EBITDA",
        direction: "lowerIsBetter",
        excludeAtOrBelow: 0,
        ladder: [
          [8, 10],
          [12, 8],
          [16, 6],
          [22, 4],
          [30, 2],
          [Infinity, 1],
        ],
      },
    ],
  },
  {
    key: "growth",
    title: "Growth",
    weight: 0.25,
    metrics: [
      {
        key: "revenueGrowth",
        label: "Revenue Growth",
        direction: "higherIsBetter",
        ladder: [
          [0.25, 10],
          [0.15, 8],
          [0.08, 6],
          [0.03, 5],
          [0, 3],
          [-Infinity, 1],
        ],
      },
      {
        key: "earningsGrowth",
        label: "Earnings Growth",
        direction: "higherIsBetter",
        ladder: [
          [0.25, 10],
          [0.15, 8],
          [0.08, 6],
          [0.03, 5],
          [0, 3],
          [-Infinity, 1],
        ],
      },
    ],
  },
  {
    key: "profitability",
    title: "Profitability",
    weight: 0.25,
    metrics: [
      {
        key: "netMargin",
        label: "Net Margin",
        direction: "higherIsBetter",
        ladder: [
          [0.2, 10],
          [0.12, 8],
          [0.07, 6],
          [0.03, 4],
          [0, 2],
          [-Infinity, 1],
        ],
      },
      {
        key: "returnOnEquity",
        label: "Return on Equity",
        direction: "higherIsBetter",
        ladder: [
          [0.2, 10],
          [0.15, 8],
          [0.1, 6],
          [0.05, 4],
          [0, 2],
          [-Infinity, 1],
        ],
      },
      {
        key: "returnOnAssets",
        label: "Return on Assets",
        direction: "higherIsBetter",
        ladder: [
          [0.12, 10],
          [0.08, 8],
          [0.05, 6],
          [0.02, 4],
          [0, 2],
          [-Infinity, 1],
        ],
      },
    ],
  },
  {
    key: "health",
    title: "Financial Health",
    weight: 0.1,
    metrics: [
      {
        key: "debtToEquity",
        label: "Debt / Equity",
        direction: "lowerIsBetter",
        ladder: [
          [0.3, 10],
          [0.6, 8],
          [1, 6],
          [1.5, 4],
          [2.5, 2],
          [Infinity, 1],
        ],
      },
    ],
  },
];

/** Verdict bands, keyed off the final 0–10 score. */
export const VERDICT_BANDS = {
  expensive: { min: 0, max: 3.99 },
  fair: { min: 4, max: 6.99 },
  attractive: { min: 7, max: 10 },
} as const;
