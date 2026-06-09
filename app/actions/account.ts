"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/services/supabase/server";
import {
  toggleWatchlistItem,
  insertSavedAnalysis,
  deleteSavedAnalysis,
} from "@/services/supabase/queries";
import { getStockData } from "@/services/stockProvider";
import { evaluate } from "@/lib/valuation/engine";

/**
 * Server actions for account features. Each one re-derives data server-side and
 * relies on RLS — the client never supplies trusted values like the user id.
 */

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}

export async function toggleWatchlist(ticker: string): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/stock/${ticker}`);

  await toggleWatchlistItem(supabase, user.id, ticker);
  revalidatePath(`/stock/${ticker.toUpperCase()}`);
  revalidatePath("/watchlist");
}

/** Save a fresh snapshot of the current valuation for a ticker. */
export async function saveAnalysis(ticker: string): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/stock/${ticker}`);

  // Re-fetch + re-score server-side rather than trusting client-sent numbers.
  const data = await getStockData(ticker);
  const valuation = evaluate(data.fundamentals);

  await insertSavedAnalysis(supabase, user.id, {
    ticker: data.profile.ticker,
    score: valuation.score,
    verdict: valuation.verdict.key,
    metrics: data.fundamentals,
    scoreBreakdown: valuation.categories,
  });

  revalidatePath("/saved");
}

export async function removeSavedAnalysis(id: string): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await deleteSavedAnalysis(supabase, id);
  revalidatePath("/saved");
}
