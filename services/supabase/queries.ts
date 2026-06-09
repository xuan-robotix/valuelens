import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SavedAnalysisRow } from "@/types/db";

type DB = SupabaseClient<Database>;

/**
 * Data access for Phase 2 features. Every function assumes RLS is on, so a
 * logged-in user only ever sees their own rows — we still pass userId where it
 * makes the query cheaper or the intent clearer.
 */

/** The user's default watchlist id, creating one if the trigger somehow didn't. */
export async function getDefaultWatchlistId(
  supabase: DB,
  userId: string,
): Promise<string> {
  const { data } = await supabase
    .from("watchlists")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (data?.id) return data.id;

  const { data: created, error } = await supabase
    .from("watchlists")
    .insert({ user_id: userId, name: "My Watchlist" })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

/** Uppercase tickers currently in the user's default watchlist. */
export async function listWatchlistTickers(
  supabase: DB,
  userId: string,
): Promise<string[]> {
  const watchlistId = await getDefaultWatchlistId(supabase, userId);
  const { data } = await supabase
    .from("watchlist_items")
    .select("ticker")
    .eq("watchlist_id", watchlistId)
    .order("added_at", { ascending: false });
  return (data ?? []).map((r) => r.ticker);
}

export async function isInWatchlist(
  supabase: DB,
  userId: string,
  ticker: string,
): Promise<boolean> {
  const tickers = await listWatchlistTickers(supabase, userId);
  return tickers.includes(ticker.toUpperCase());
}

/** Toggle membership. Returns the new state (true = now in watchlist). */
export async function toggleWatchlistItem(
  supabase: DB,
  userId: string,
  ticker: string,
): Promise<boolean> {
  const t = ticker.toUpperCase();
  const watchlistId = await getDefaultWatchlistId(supabase, userId);

  const { data: existing } = await supabase
    .from("watchlist_items")
    .select("id")
    .eq("watchlist_id", watchlistId)
    .eq("ticker", t)
    .maybeSingle();

  if (existing) {
    await supabase.from("watchlist_items").delete().eq("id", existing.id);
    return false;
  }

  await supabase
    .from("watchlist_items")
    .insert({ watchlist_id: watchlistId, ticker: t });
  return true;
}

export interface SaveAnalysisInput {
  ticker: string;
  score: number;
  verdict: string;
  metrics: unknown;
  scoreBreakdown: unknown;
}

export async function insertSavedAnalysis(
  supabase: DB,
  userId: string,
  input: SaveAnalysisInput,
): Promise<void> {
  const { error } = await supabase.from("saved_analyses").insert({
    user_id: userId,
    ticker: input.ticker.toUpperCase(),
    score: input.score,
    verdict: input.verdict,
    metrics: input.metrics,
    score_breakdown: input.scoreBreakdown,
  });
  if (error) throw error;
}

export async function listSavedAnalyses(
  supabase: DB,
  userId: string,
): Promise<SavedAnalysisRow[]> {
  const { data } = await supabase
    .from("saved_analyses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function deleteSavedAnalysis(
  supabase: DB,
  id: string,
): Promise<void> {
  await supabase.from("saved_analyses").delete().eq("id", id);
}
