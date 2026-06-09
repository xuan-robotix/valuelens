import type { VerdictKey } from "@/types/valuation";
import { VERDICT_STYLES } from "@/lib/verdictStyles";
import { cn } from "@/utils/cn";

const LABELS: Record<VerdictKey, string> = {
  attractive: "Attractive",
  fair: "Fairly Valued",
  expensive: "Expensive",
};

/** Compact colored verdict pill used in watchlist & saved lists. */
export function VerdictBadge({
  verdict,
  score,
}: {
  verdict: VerdictKey;
  score?: number;
}) {
  const s = VERDICT_STYLES[verdict];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        s.bg,
        s.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {LABELS[verdict]}
      {score != null && <span className="tabular-nums opacity-80">{score.toFixed(1)}</span>}
    </span>
  );
}
