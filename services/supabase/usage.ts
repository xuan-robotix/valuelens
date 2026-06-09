import "server-only";
import { createClient } from "./server";
import { isSupabaseConfigured } from "./config";
import { SIX_HOURS } from "../fmpClient";

/**
 * Usage metering. Because FMP gives us no quota info, we count the live fetches
 * we make ourselves and store the daily tally in Supabase. All functions no-op
 * (or return null) when Supabase isn't configured or the usage SQL hasn't been
 * run yet — the app keeps working either way.
 */

/**
 * Record that we're about to fetch `key` made of `endpointCount` FMP calls.
 * Counts only when the per-key marker is stale (i.e. it'd be a real network hit,
 * not a cache serve), so the tally tracks actual quota consumption.
 */
export async function registerFetch(
  key: string,
  endpointCount: number,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = await createClient();
    if (!supabase) return;
    const { data: isNew } = await supabase.rpc("mark_fetch", {
      k: key,
      ttl_seconds: SIX_HOURS,
    });
    if (isNew) {
      await supabase.rpc("bump_api_usage", { n: endpointCount });
    }
  } catch {
    // Usage SQL not applied yet, or no request context — ignore.
  }
}

/** Today's estimated FMP request count, or null if tracking is unavailable. */
export async function getTodayUsage(): Promise<number | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    if (!supabase) return null;
    const { data, error } = await supabase.rpc("today_api_usage");
    if (error) return null;
    return typeof data === "number" ? data : null;
  } catch {
    return null;
  }
}
