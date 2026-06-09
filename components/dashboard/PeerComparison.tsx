import Link from "next/link";
import type { VerdictKey } from "@/types/valuation";
import { Card } from "@/components/ui/Card";
import { VerdictBadge } from "./VerdictBadge";
import { formatRatio, formatPercent } from "@/utils/format";
import { cn } from "@/utils/cn";

export interface PeerRow {
  ticker: string;
  name: string;
  isSelf: boolean;
  peRatio: number | null;
  psRatio: number | null;
  netMargin: number | null;
  score: number;
  verdict: VerdictKey;
}

/** Side-by-side comparison of the stock against its sector peers. */
export function PeerComparison({
  rows,
  sector,
}: {
  rows: PeerRow[];
  sector: string | null;
}) {
  return (
    <section>
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted">
        How it compares
      </h3>
      <p className="mb-3 text-sm text-muted">
        Against {sector ? `${sector} ` : ""}peers — valuation is relative, so the
        same P/E can be cheap in one sector and rich in another.
      </p>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 text-right font-medium">P/E</th>
                <th className="px-4 py-3 text-right font-medium">P/S</th>
                <th className="px-4 py-3 text-right font-medium">Net Margin</th>
                <th className="px-4 py-3 text-right font-medium">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.ticker}
                  className={cn(
                    "border-b border-border last:border-0",
                    r.isSelf && "bg-brand-soft/50",
                  )}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/stock/${r.ticker}`}
                      className="flex items-center gap-2 hover:text-brand"
                    >
                      <span className="font-semibold">{r.ticker}</span>
                      {r.isSelf && (
                        <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white">
                          this
                        </span>
                      )}
                      <span className="hidden truncate text-muted sm:inline">
                        {r.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatRatio(r.peRatio)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatRatio(r.psRatio)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatPercent(r.netMargin)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <VerdictBadge verdict={r.verdict} score={r.score} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
