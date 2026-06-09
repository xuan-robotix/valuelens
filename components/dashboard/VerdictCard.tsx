import type { ValuationResult } from "@/types/valuation";
import { Card } from "@/components/ui/Card";
import { VERDICT_STYLES } from "@/lib/verdictStyles";
import { cn } from "@/utils/cn";

/** The headline output: big colored verdict + score + plain-English reasoning. */
export function VerdictCard({ result }: { result: ValuationResult }) {
  const s = VERDICT_STYLES[result.verdict.key];

  return (
    <Card className={cn("p-6 ring-1", s.bg, s.border, s.ring)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full", s.dot)} />
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                s.text,
              )}
            >
              Valuation Verdict
            </span>
          </div>
          <h2 className={cn("mt-1.5 text-3xl font-semibold tracking-tight", s.text)}>
            {result.verdict.label}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-fg/80">
            {result.verdict.explanation}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
          <div className="flex items-baseline gap-1">
            <span className={cn("text-5xl font-semibold tabular-nums", s.text)}>
              {result.score.toFixed(1)}
            </span>
            <span className="text-lg text-muted">/ 10</span>
          </div>
          <span className="text-xs text-muted">Valuation score</span>
        </div>
      </div>
    </Card>
  );
}
