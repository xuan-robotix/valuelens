import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getTodayUsage } from "@/services/supabase/usage";
import { FMP_DAILY_LIMIT } from "@/services/fmpClient";
import { cn } from "@/utils/cn";

export const metadata: Metadata = { title: "Data usage — ValueLens" };
export const dynamic = "force-dynamic";

export default async function UsagePage() {
  const used = await getTodayUsage();
  const limit = FMP_DAILY_LIMIT;
  const known = used != null;
  const pct = known ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  const tone =
    pct >= 90 ? "expensive" : pct >= 70 ? "fair" : "attractive";
  const barColor =
    tone === "expensive"
      ? "bg-expensive"
      : tone === "fair"
        ? "bg-fair"
        : "bg-attractive";
  const textColor =
    tone === "expensive"
      ? "text-expensive"
      : tone === "fair"
        ? "text-fair"
        : "text-attractive";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Live data usage</h1>
      <p className="mt-1 text-sm text-muted">
        How many market-data requests we&apos;ve made today against the free-tier
        daily limit.
      </p>

      <Card className="mt-6 p-6">
        {known ? (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold tabular-nums">
                {used}
                <span className="text-lg text-muted"> / {limit}</span>
              </span>
              <span className={cn("text-sm font-medium", textColor)}>
                {pct}% used
              </span>
            </div>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className={cn("h-full rounded-full transition-all", barColor)}
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-muted">
              {limit - used > 0
                ? `About ${limit - used} requests left today.`
                : "Daily limit reached — live data will resume tomorrow."}
            </p>
          </>
        ) : (
          <div className="text-sm text-muted">
            <p className="font-medium text-fg">Usage tracking isn&apos;t active.</p>
            <p className="mt-2">
              This needs Supabase configured and the{" "}
              <code className="text-fg">db/usage.sql</code> migration applied.
              Until then, the app still works — it just can&apos;t show a count.
            </p>
          </div>
        )}
      </Card>

      <div className="mt-6 space-y-2 text-sm text-muted">
        <p className="font-medium text-fg">How this is counted</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Each stock view is ~4 requests; its peers and the history chart add a
            few more.
          </li>
          <li>
            Results are cached for 6 hours, so revisiting a stock within that
            window doesn&apos;t count again.
          </li>
          <li>
            It&apos;s an estimate of our own calls (FMP doesn&apos;t report usage).
            The count resets daily.
          </li>
          <li>
            If we hit the limit, ValueLens says so honestly and shows nothing
            rather than displaying made-up numbers.
          </li>
        </ul>
      </div>

      <Link href="/" className="mt-8 inline-block text-sm text-brand hover:underline">
        ← Back home
      </Link>
    </div>
  );
}
