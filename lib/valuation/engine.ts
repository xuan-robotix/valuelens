/**
 * The valuation engine — the product's opinion, in one pure function.
 *
 * Input:  Fundamentals (provider-agnostic, may contain nulls)
 * Output: ValuationResult (0–10 score, per-category breakdown, verdict, exclusions)
 *
 * No I/O, no React, no provider knowledge. Fully unit-testable.
 */

import type { Fundamentals } from "@/types/stock";
import type {
  CategoryScore,
  MetricScore,
  ValuationResult,
} from "@/types/valuation";
import { CATEGORIES, type MetricSpec } from "./thresholds";
import { buildVerdict } from "./verdict";

/** Score a single metric value against its ladder. Returns null if excluded. */
function scoreMetric(spec: MetricSpec, value: number | null): number | null {
  if (value == null || !isFinite(value)) return null;
  if (spec.excludeAtOrBelow != null && value <= spec.excludeAtOrBelow) {
    return null;
  }

  for (const [boundary, score] of spec.ladder) {
    if (spec.direction === "lowerIsBetter") {
      if (value <= boundary) return score;
    } else {
      if (value >= boundary) return score;
    }
  }
  // Ladders end in an Infinity/-Infinity catch-all, so this is unreachable.
  return null;
}

/** Average the available (non-null) sub-scores. Null if none available. */
function averageAvailable(scores: Array<number | null>): number | null {
  const present = scores.filter((s): s is number => s != null);
  if (present.length === 0) return null;
  return present.reduce((a, b) => a + b, 0) / present.length;
}

export function evaluate(fundamentals: Fundamentals): ValuationResult {
  const excluded: string[] = [];

  const categories: CategoryScore[] = CATEGORIES.map((cat) => {
    const metrics: MetricScore[] = cat.metrics.map((spec) => {
      const value =
        (fundamentals as unknown as Record<string, number | null>)[spec.key] ??
        null;
      const score = scoreMetric(spec, value);
      if (score == null) excluded.push(spec.label);
      return { key: spec.key, label: spec.label, value, score };
    });

    return {
      key: cat.key,
      title: cat.title,
      weight: cat.weight,
      score: averageAvailable(metrics.map((m) => m.score)),
      metrics,
    };
  });

  // Weighted combine, re-normalizing over categories that actually scored so a
  // single missing category doesn't silently drag the total toward zero.
  const scored = categories.filter((c) => c.score != null);
  const totalWeight = scored.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum = scored.reduce(
    (sum, c) => sum + (c.score as number) * c.weight,
    0,
  );
  const raw = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const score = Math.round(raw * 10) / 10;

  return {
    score,
    verdict: buildVerdict(score, categories),
    categories,
    excluded,
  };
}
