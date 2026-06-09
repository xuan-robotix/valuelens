/** Maps a final score + category context into a verdict with a plain-English
 * explanation that references the actual drivers. Pure, no I/O. */

import type { CategoryScore, Verdict, VerdictKey } from "@/types/valuation";
import { VERDICT_BANDS } from "./thresholds";

function bandFor(score: number): VerdictKey {
  if (score >= VERDICT_BANDS.attractive.min) return "attractive";
  if (score >= VERDICT_BANDS.fair.min) return "fair";
  return "expensive";
}

const LABELS: Record<VerdictKey, string> = {
  expensive: "Expensive",
  fair: "Fairly Valued",
  attractive: "Attractive Valuation",
};

/** Pick the strongest and weakest scored categories to color the explanation. */
function describeDrivers(categories: CategoryScore[]): {
  strongest?: CategoryScore;
  weakest?: CategoryScore;
} {
  const scored = categories.filter((c) => c.score != null);
  if (scored.length === 0) return {};
  const sorted = [...scored].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return { strongest: sorted[0], weakest: sorted[sorted.length - 1] };
}

const PHRASE: Record<VerdictKey, string> = {
  expensive:
    "The market is pricing in a lot. By these fundamental measures, the price isn't currently justified.",
  fair: "Price and fundamentals look roughly in balance — no obvious bargain or warning here.",
  attractive:
    "Fundamentals look strong relative to the price by these measures. Worth a closer look.",
};

export function buildVerdict(
  score: number,
  categories: CategoryScore[],
): Verdict {
  const key = bandFor(score);
  const { strongest, weakest } = describeDrivers(categories);

  let detail = "";
  if (strongest && weakest && strongest.key !== weakest.key) {
    detail = ` ${strongest.title} is the bright spot, while ${weakest.title.toLowerCase()} weighs it down most.`;
  } else if (strongest) {
    detail = ` ${strongest.title} is the main driver of this result.`;
  }

  return {
    key,
    label: LABELS[key],
    explanation: PHRASE[key] + detail,
  };
}
