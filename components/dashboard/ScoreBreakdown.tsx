"use client";

import { useState } from "react";
import type { ValuationResult } from "@/types/valuation";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

/** Expandable "How this score was calculated" panel — makes the engine auditable
 * rather than a black box. Shows per-category and per-metric contributions. */
export function ScoreBreakdown({ result }: { result: ValuationResult }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span className="text-sm font-semibold">
          How this score was calculated
        </span>
        <span
          className={cn(
            "text-muted transition-transform",
            open && "rotate-90",
          )}
        >
          ›
        </span>
      </button>

      {open && (
        <div className="border-t border-border px-5 py-4">
          <p className="mb-4 text-sm text-muted">
            Each category is scored 0–10 from its metrics, then combined by
            weight. Metrics that can&apos;t be computed are excluded and shown
            below.
          </p>

          <div className="space-y-4">
            {result.categories.map((cat) => (
              <div key={cat.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {cat.title}
                    <span className="ml-2 text-xs text-muted">
                      weight {Math.round(cat.weight * 100)}%
                    </span>
                  </span>
                  <span className="tabular-nums font-semibold">
                    {cat.score != null ? cat.score.toFixed(1) : "—"}
                  </span>
                </div>
                <div className="mt-2 space-y-1.5">
                  {cat.metrics.map((m) => (
                    <div
                      key={m.key}
                      className="flex items-center justify-between text-xs text-muted"
                    >
                      <span>{m.label}</span>
                      <span className="tabular-nums">
                        {m.score != null ? `${m.score}/10` : "excluded"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {result.excluded.length > 0 && (
            <p className="mt-4 border-t border-border pt-3 text-xs text-muted">
              Excluded (no usable data): {result.excluded.join(", ")}.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
