import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";
import { VerdictCard } from "@/components/dashboard/VerdictCard";
import { Card } from "@/components/ui/Card";
import { getDemoTicker, DEMO_TICKERS } from "@/services/demoData";
import { evaluate } from "@/lib/valuation/engine";
import type { ValuationResult } from "@/types/valuation";

/** Pick the best-scoring demo stock as a live example of the payoff. Honest —
 * it's a real run of the engine, not a mockup. */
function bestExample(): { ticker: string; name: string; result: ValuationResult } {
  let best = { ticker: "AAPL", name: "Apple Inc.", result: evaluate(getDemoTicker("AAPL")!.fundamentals) };
  for (const t of DEMO_TICKERS) {
    const d = getDemoTicker(t)!;
    const result = evaluate(d.fundamentals);
    if (result.score > best.result.score) {
      best = { ticker: t, name: d.profile.name, result };
    }
  }
  return best;
}

const STEPS = [
  { n: "1", title: "Search a ticker", body: "Type any symbol — AAPL, MSFT, NVDA." },
  { n: "2", title: "See the metrics", body: "Valuation, growth, and profitability, clearly grouped." },
  { n: "3", title: "Get the verdict", body: "One score, one plain-English answer." },
];

const MEASURES = [
  { title: "Valuation", body: "P/E, P/B, P/S, EV/EBITDA — is the price reasonable?", weight: "40%" },
  { title: "Growth", body: "Revenue & earnings growth — is the business expanding?", weight: "25%" },
  { title: "Profitability", body: "Margins, ROE, ROA — is it a quality business?", weight: "25%" },
  { title: "Financial Health", body: "Debt vs. equity — how much leverage and risk?", weight: "10%" },
];

export default function Home() {
  const example = bestExample();

  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      {/* Hero */}
      <section className="flex flex-col items-center py-20 text-center sm:py-28">
        <span className="mb-5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          Fundamentals, made clear
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Type a ticker.{" "}
          <span className="text-brand">Understand it in ten seconds.</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          ValueLens turns a stock&apos;s fundamentals into a clean verdict —
          cheap, fair, or expensive — so you can make a more informed call.
        </p>
        <div className="mt-8 flex w-full justify-center">
          <SearchBar size="hero" autoFocus />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted">
          <span>Try:</span>
          {DEMO_TICKERS.map((t) => (
            <Link
              key={t}
              href={`/stock/${t}`}
              className="rounded-md border border-border bg-surface px-2 py-0.5 font-medium text-fg transition hover:border-brand hover:text-brand"
            >
              {t}
            </Link>
          ))}
        </div>
      </section>

      {/* Live example */}
      <section className="pb-16">
        <p className="mb-3 text-center text-sm text-muted">
          Here&apos;s what you get — a real verdict for{" "}
          <Link href={`/stock/${example.ticker}`} className="text-brand hover:underline">
            {example.name}
          </Link>
          :
        </p>
        <Link href={`/stock/${example.ticker}`} className="block">
          <VerdictCard result={example.result} />
        </Link>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          How it works
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <Card key={s.n} className="p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                {s.n}
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* What we measure */}
      <section className="border-t border-border py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          What we measure
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted">
          The score blends four categories. The breakdown is always shown — no
          black box.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MEASURES.map((m) => (
            <Card key={m.title} className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{m.title}</h3>
                <span className="text-xs font-medium text-muted">{m.weight}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{m.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-border py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          A lens, not a crystal ball
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          ValueLens doesn&apos;t predict prices or give advice. It makes public
          fundamentals legible, so the judgment stays yours — better informed.
        </p>
        <div className="mt-8 flex justify-center">
          <SearchBar size="hero" />
        </div>
      </section>
    </div>
  );
}
