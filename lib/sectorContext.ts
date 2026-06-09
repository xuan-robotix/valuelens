/**
 * Sector-relative context (Phase 3). Pure functions: given a stock and its
 * sector peers, compute the median for each metric and describe where the stock
 * sits relative to it ("18% below sector", colored good/bad).
 *
 * This is the honest, lightweight version of "sector-relative scoring": we don't
 * yet re-weight the engine by sector, but we surface the comparison so the user
 * sees a P/E of 31 differently in a cheap sector vs. an expensive one.
 */

import type { Fundamentals } from "@/types/stock";

/** Which direction is "better" for each metric (mirrors the scoring engine). */
export const METRIC_DIRECTION: Record<string, "lower" | "higher"> = {
  peRatio: "lower",
  pbRatio: "lower",
  psRatio: "lower",
  evToEbitda: "lower",
  dividendYield: "higher",
  revenueGrowth: "higher",
  earningsGrowth: "higher",
  netMargin: "higher",
  returnOnEquity: "higher",
  returnOnAssets: "higher",
  debtToEquity: "lower",
};

export function median(nums: number[]): number | null {
  const xs = nums.filter((n) => isFinite(n)).sort((a, b) => a - b);
  if (xs.length === 0) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
}

/** Median of each metric across a group (self + peers). */
export function computeMedians(
  group: Fundamentals[],
): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  for (const key of Object.keys(METRIC_DIRECTION)) {
    const vals = group
      .map((f) => (f as unknown as Record<string, number | null>)[key])
      .filter((v): v is number => typeof v === "number" && isFinite(v));
    out[key] = median(vals);
  }
  return out;
}

export interface MetricContext {
  text: string;
  tone: "good" | "bad" | "neutral";
}

/** Describe each of the stock's metrics relative to the sector median. */
export function buildContexts(
  self: Fundamentals,
  medians: Record<string, number | null>,
): Record<string, MetricContext> {
  const out: Record<string, MetricContext> = {};

  for (const [key, dir] of Object.entries(METRIC_DIRECTION)) {
    const value = (self as unknown as Record<string, number | null>)[key];
    const med = medians[key];
    if (typeof value !== "number" || !isFinite(value) || med == null || med === 0) {
      continue;
    }

    const relDiff = (value - med) / Math.abs(med);
    const pct = Math.abs(relDiff) * 100;

    if (pct < 3) {
      out[key] = { text: "in line with sector", tone: "neutral" };
      continue;
    }

    const above = value > med;
    const betterWhenLower = dir === "lower";
    const isGood = above ? !betterWhenLower : betterWhenLower;

    out[key] = {
      text: `${pct.toFixed(0)}% ${above ? "above" : "below"} sector`,
      tone: isGood ? "good" : "bad",
    };
  }

  return out;
}
