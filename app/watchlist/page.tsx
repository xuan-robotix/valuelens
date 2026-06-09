import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/services/supabase/server";
import { listWatchlistTickers } from "@/services/supabase/queries";
import { getStockData } from "@/services/stockProvider";
import { evaluate } from "@/lib/valuation/engine";
import { Card } from "@/components/ui/Card";
import { VerdictBadge } from "@/components/dashboard/VerdictBadge";
import type { VerdictKey } from "@/types/valuation";
import { formatMarketCap } from "@/utils/format";

export const metadata: Metadata = { title: "Watchlist — ValueLens" };

// Always render per-request: this page depends on the signed-in user.
export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!user || !supabase) redirect("/login?next=/watchlist");

  const tickers = await listWatchlistTickers(supabase, user.id);

  // Score each ticker. Failures are skipped rather than breaking the page.
  const rows = (
    await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const data = await getStockData(ticker);
          const valuation = evaluate(data.fundamentals);
          return {
            ticker,
            name: data.profile.name,
            marketCap: data.profile.marketCap,
            currency: data.profile.currency,
            score: valuation.score,
            verdict: valuation.verdict.key as VerdictKey,
          };
        } catch {
          return null;
        }
      }),
    )
  ).filter(Boolean) as Array<{
    ticker: string;
    name: string;
    marketCap: number | null;
    currency: string;
    score: number;
    verdict: VerdictKey;
  }>;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Your watchlist</h1>
        <p className="mt-1 text-sm text-muted">
          Verdicts refresh each time you visit.
        </p>
      </header>

      {rows.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-medium">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted">
            Add a stock from its dashboard to start tracking it.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-brand hover:underline"
          >
            Find a stock →
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Link key={r.ticker} href={`/stock/${r.ticker}`} className="block">
              <Card className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{r.ticker}</span>
                    <span className="truncate text-sm text-muted">{r.name}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    Mkt Cap {formatMarketCap(r.marketCap, r.currency)}
                  </p>
                </div>
                <VerdictBadge verdict={r.verdict} score={r.score} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
