import type { Metadata } from "next";
import Link from "next/link";
import {
  getStockData,
  sanitizeTicker,
  TickerNotFoundError,
} from "@/services/stockProvider";
import { evaluate } from "@/lib/valuation/engine";
import { buildMetricGroups } from "@/lib/presentMetrics";
import { CompanyHeader } from "@/components/dashboard/CompanyHeader";
import { VerdictCard } from "@/components/dashboard/VerdictCard";
import { MetricGroup } from "@/components/dashboard/MetricGroup";
import { ScoreBreakdown } from "@/components/dashboard/ScoreBreakdown";
import {
  PeerComparison,
  type PeerRow,
} from "@/components/dashboard/PeerComparison";
import { Card } from "@/components/ui/Card";
import { SearchBar } from "@/components/search/SearchBar";
import { SaveActions } from "@/components/dashboard/SaveActions";
import { isSupabaseConfigured } from "@/services/supabase/config";
import { createClient } from "@/services/supabase/server";
import { isInWatchlist } from "@/services/supabase/queries";
import { getPeers } from "@/services/peers";
import { computeMedians, buildContexts } from "@/lib/sectorContext";
import type { VerdictKey } from "@/types/valuation";

type Params = { params: Promise<{ ticker: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { ticker } = await params;
  const t = sanitizeTicker(ticker) ?? ticker.toUpperCase();
  return {
    title: `${t} valuation — ValueLens`,
    description: `Is ${t} cheap, fairly valued, or expensive? A fundamentals-based valuation verdict from ValueLens.`,
  };
}

export default async function StockPage({ params }: Params) {
  const { ticker: raw } = await params;
  const ticker = sanitizeTicker(raw ?? "");

  if (!ticker) {
    return (
      <ErrorState
        title="That doesn't look like a ticker"
        message="Tickers are 1–6 letters, like AAPL or MSFT. Try another symbol."
      />
    );
  }

  let data;
  try {
    data = await getStockData(ticker);
  } catch (err) {
    const message =
      err instanceof TickerNotFoundError
        ? `We couldn't find fundamentals for "${ticker}". Check the symbol and try again.`
        : "Something went wrong fetching this stock. Please try again in a moment.";
    return <ErrorState title="No data to show" message={message} />;
  }

  const valuation = evaluate(data.fundamentals);
  const groups = buildMetricGroups(data.fundamentals);
  const currency = data.profile.currency;

  // Account state (only when Supabase is configured).
  const authEnabled = isSupabaseConfigured();
  let isAuthed = false;
  let watched = false;
  if (authEnabled) {
    const supabase = await createClient();
    const user = supabase ? (await supabase.auth.getUser()).data.user : null;
    isAuthed = Boolean(user);
    if (user) watched = await isInWatchlist(supabase!, user.id, data.profile.ticker);
  }

  // If essentially nothing could be scored, don't show a misleading verdict.
  const scoredCategories = valuation.categories.filter((c) => c.score != null);
  const hasUsableData = scoredCategories.length > 0;

  // Phase 3: sector peers → relative context on metrics + comparison table.
  const peers = hasUsableData ? await getPeers(data) : [];
  const medians = computeMedians([
    data.fundamentals,
    ...peers.map((p) => p.fundamentals),
  ]);
  const contexts =
    peers.length > 0 ? buildContexts(data.fundamentals, medians) : undefined;

  const comparisonRows: PeerRow[] =
    peers.length > 0
      ? [data, ...peers].map((s) => {
          const v = evaluate(s.fundamentals);
          return {
            ticker: s.profile.ticker,
            name: s.profile.name,
            isSelf: s.profile.ticker === data.profile.ticker,
            peRatio: s.fundamentals.peRatio,
            psRatio: s.fundamentals.psRatio,
            netMargin: s.fundamentals.netMargin,
            score: v.score,
            verdict: v.verdict.key as VerdictKey,
          };
        })
      : [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="vl-rise space-y-8">
        <div className="space-y-4">
          <CompanyHeader profile={data.profile} />
          {authEnabled && (
            <SaveActions
              ticker={data.profile.ticker}
              isAuthed={isAuthed}
              initialWatched={watched}
            />
          )}
        </div>

        {hasUsableData ? (
          <VerdictCard result={valuation} />
        ) : (
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Valuation unavailable</h2>
            <p className="mt-2 text-sm text-muted">
              We don&apos;t have enough fundamental data to score{" "}
              {data.profile.ticker} right now. This often happens for ETFs,
              recent IPOs, or companies that don&apos;t report standard ratios.
            </p>
          </Card>
        )}

        <div className="space-y-8">
          {groups.map((g) => (
            <MetricGroup
              key={g.key}
              group={g}
              currency={currency}
              contexts={contexts}
            />
          ))}
        </div>

        {comparisonRows.length > 1 && (
          <PeerComparison rows={comparisonRows} sector={data.profile.sector} />
        )}

        {hasUsableData && <ScoreBreakdown result={valuation} />}

        {data.source === "demo" && (
          <p className="text-center text-xs text-muted">
            Showing bundled demo data (no live API key configured).
          </p>
        )}
      </div>
    </div>
  );
}

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-muted">{message}</p>
      <div className="mt-6 w-full max-w-md">
        <SearchBar size="hero" autoFocus />
      </div>
      <Link href="/" className="mt-4 text-sm text-brand hover:underline">
        ← Back home
      </Link>
    </div>
  );
}
