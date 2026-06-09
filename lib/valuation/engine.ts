/**
 * The valuation engine — the product's opinion, in one pure function.
 *
 * Input:  Fundamentals (provider-agnostic, may contain nulls)
 *         + optional sector peers' Fundamentals
 * Output: ValuationResult (0–10 score, per-category breakdown, verdict, exclusions)
 *
 * Scoring: each metric gets an ABSOLUTE score (threshold ladder) and, when peers
 * are supplied, a SECTOR-RELATIVE score (its percentile rank within the sector).
 * The two are blended 50/50 — so a stock is judged both on whether it's cheap in
 * absolute terms and whether it's cheap *for its sector*. With no peers, it's
 * pure-absolute and identical to before.
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

/** Max weight of the sector-relative component (reached at >= 3 peers). Below
 * that it's scaled down — a "better than one peer" signal is too thin to trust
 * fully, so the absolute score stays the anchor. */
const MAX_RELATIVE_WEIGHT = 0.5;
const FULL_CONFIDENCE_PEERS = 3;

function read(f: Fundamentals, key: string): number | null {
  const v = (f as unknown as Record<string, number | null>)[key];
  return typeof v === "number" && isFinite(v) ? v : null;
}

/** Score a single metric value against its absolute ladder. Null if excluded. */
function absoluteScore(spec: MetricSpec, value: number | null): number | null {
  if (value == null) return null;
  if (spec.excludeAtOrBelow != null && value <= spec.excludeAtOrBelow) {
    return null;
  }
  for (const [boundary, score] of spec.ladder) {
    if (spec.direction === "lowerIsBetter") {
      if (value <= boundary) return score;
    } else if (value >= boundary) {
      return score;
    }
  }
  return null; // unreachable: ladders end in ±Infinity
}

/**
 * Sector-relative percentile score: where `value` ranks within the sector group
 * (0 = worst, 10 = best for this metric's direction). Ties get half credit.
 * Needs at least one peer (group size ≥ 2); otherwise null.
 */
function relativeScore(
  value: number,
  groupValues: number[],
  direction: MetricSpec["direction"],
): number | null {
  const vals = groupValues.filter((v) => isFinite(v));
  if (vals.length < 2) return null;

  const others = vals.length - 1;
  let worse = 0;
  let equal = 0;
  for (const v of vals) {
    const isWorse =
      direction === "lowerIsBetter" ? v > value : v < value;
    if (isWorse) worse++;
    else if (v === value) equal++;
  }
  equal = Math.max(0, equal - 1); // exclude self
  return ((worse + 0.5 * equal) / others) * 10;
}

function averageAvailable(scores: Array<number | null>): number | null {
  const present = scores.filter((s): s is number => s != null);
  if (present.length === 0) return null;
  return present.reduce((a, b) => a + b, 0) / present.length;
}

export function evaluate(
  fundamentals: Fundamentals,
  opts: { peers?: Fundamentals[] } = {},
): ValuationResult {
  const peers = opts.peers ?? [];
  const excluded: string[] = [];
  let anyRelative = false;

  // Confidence-scaled weight: tiny peer groups tilt gently, larger ones fully.
  const relWeight =
    MAX_RELATIVE_WEIGHT * Math.min(1, peers.length / FULL_CONFIDENCE_PEERS);

  const categories: CategoryScore[] = CATEGORIES.map((cat) => {
    const metrics: MetricScore[] = cat.metrics.map((spec) => {
      const value = read(fundamentals, spec.key);
      const absolute = absoluteScore(spec, value);

      let relative: number | null = null;
      if (absolute != null && value != null && peers.length > 0) {
        const peerValues = peers
          .map((p) => read(p, spec.key))
          .filter((v): v is number => v != null);
        relative = relativeScore(value, [value, ...peerValues], spec.direction);
        if (relative != null) anyRelative = true;
      }

      // Blend, or fall back to whichever exists.
      let score: number | null;
      if (absolute != null && relative != null) {
        score = absolute * (1 - relWeight) + relative * relWeight;
      } else {
        score = absolute;
      }

      if (score == null) excluded.push(spec.label);
      return { key: spec.key, label: spec.label, value, score, absolute, relative };
    });

    return {
      key: cat.key,
      title: cat.title,
      weight: cat.weight,
      score: averageAvailable(metrics.map((m) => m.score)),
      metrics,
    };
  });

  // Weighted combine, re-normalizing over categories that actually scored.
  const scored = categories.filter((c) => c.score != null);
  const totalWeight = scored.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum = scored.reduce(
    (sum, c) => sum + (c.score as number) * c.weight,
    0,
  );
  const raw = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const score = Math.round(raw * 10) / 10;

  const verdict = buildVerdict(score, categories);
  if (anyRelative) {
    verdict.explanation += " Scores are adjusted for how it compares to its sector.";
  }

  return { score, verdict, categories, excluded, sectorAdjusted: anyRelative };
}
