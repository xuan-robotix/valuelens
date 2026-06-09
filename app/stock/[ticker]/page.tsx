import type { Metadata } from "next";
import Link from "next/link";
import {
  getStockData,
  sanitizeTicker,
  TickerNotFoundError,
  LiveDataUnavailableError,
} from "@/services/stockProvider";
import { getValuationHistory } from "@/services/history";
import { evaluate } from "@/lib/valuation/engine";
import { buildMetricGroups } from "@/lib/presentMetrics";
import { CompanyHeader } from "@/components/dashboard/CompanyHeader";
import { VerdictCard } from "@/components/dashboard/VerdictCard";
import { MetricGroup } from "@/components/dashboard/MetricGroup";
import { ValuationTrend } from "@/components/dashboard/ValuationTrend";
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
    if (err instanceof LiveDataUnavailableError) {
      return (
        <ErrorState
          title={
            err.reason === "rate_limit"
              ? "Live data limit reached"
              : "Live data unavailable"
          }
          message={
            err.reason === "rate_limit"
              ? "We've hit today's free-tier limit for market data. ValueLens won't show made-up numbers, so there's nothing to display right now — please try again later."
              : "We couldn't reach the market-data provider just now. Rather than show stale or fake figures, we're holding off — please try again shortly."
          }
        />
      );
    }
    const message =
      err instanceof TickerNotFoundError
        ? `We couldn't find fundamentals for "${ticker}". Check the symbol and try again.`
        : "Something went wrong fetching this stock. Please try again in a moment.";
    return <ErrorState title="No data to show" message={message} />;
  }

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

  // Base (absolute) score first — just to decide whether this stock is scorable.
  const baseValuation = evaluate(data.fundamentals);
  const hasUsableData = baseValuation.categories.some((c) => c.score != null);

  // Phase 4: historical valuation trend (live-only; null in demo mode).
  const history = hasUsableData ? await getValuationHistory(data.profile.ticker) : null;

  // Phase 3/5: sector peers → relative context + sector-adjusted re-scoring.
  const peers = hasUsableData ? await getPeers(data) : [];
  const peerFundamentals = peers.map((p) => p.fundamentals);

  // The headline verdict, now blended with sector-relative rank when peers exist.
  const valuation =
    peers.length > 0
      ? evaluate(data.fundamentals, { peers: peerFundamentals })
      : baseValuation;

  const medians = computeMedians([data.fundamentals, ...peerFundamentals]);
  const contexts =
    peers.length > 0 ? buildContexts(data.fundamentals, medians) : undefined;

  // Comparison rows: each member scored against the same sector group so the
  // verdicts are consistent with the headline.
  const group = [data, ...peers];
  const comparisonRows: PeerRow[] =
    peers.length > 0
      ? group.map((s) => {
          const others = group
            .filter((g) => g !== s)
            .map((g) => g.fundamentals);
          const v = evaluate(s.fundamentals, { peers: others });
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
              We couldn&apos;t get enough fundamental data to score{" "}
              {data.profile.ticker}. This happens for ETFs and funds (like VOO),
              recent IPOs, or symbols that aren&apos;t covered by the current
              (free-tier) data plan — not every ticker is included.
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

        {history && <ValuationTrend points={history} />}

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
