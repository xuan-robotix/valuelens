import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/services/supabase/server";
import { listSavedAnalyses } from "@/services/supabase/queries";
import { removeSavedAnalysis } from "@/app/actions/account";
import { Card } from "@/components/ui/Card";
import { VerdictBadge } from "@/components/dashboard/VerdictBadge";
import type { VerdictKey } from "@/types/valuation";

export const metadata: Metadata = { title: "Saved analyses — ValueLens" };

// Always render per-request: this page depends on the signed-in user.
export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function SavedPage() {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!user || !supabase) redirect("/login?next=/saved");

  const analyses = await listSavedAnalyses(supabase, user.id);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Saved analyses</h1>
        <p className="mt-1 text-sm text-muted">
          Snapshots of valuations at the moment you saved them.
        </p>
      </header>

      {analyses.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-medium">No saved analyses yet</p>
          <p className="mt-1 text-sm text-muted">
            Open any stock and tap &ldquo;Save analysis&rdquo; to keep a snapshot.
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
          {analyses.map((a) => (
            <Card
              key={a.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <Link
                href={`/stock/${a.ticker}`}
                className="flex min-w-0 items-center gap-3"
              >
                <span className="font-semibold">{a.ticker}</span>
                <VerdictBadge
                  verdict={a.verdict as VerdictKey}
                  score={Number(a.score)}
                />
                <span className="text-xs text-muted">
                  saved {formatDate(a.created_at)}
                </span>
              </Link>
              <form action={removeSavedAnalysis.bind(null, a.id)}>
                <button
                  type="submit"
                  className="text-sm text-muted transition-colors hover:text-expensive"
                  aria-label={`Remove saved analysis for ${a.ticker}`}
                >
                  Remove
                </button>
              </form>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
