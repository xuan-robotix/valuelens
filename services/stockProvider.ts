/**
 * Data service: the only module that talks to external stock APIs.
 *
 * Design notes:
 *  - Provider-agnostic: callers get a normalized StockData and never see FMP.
 *  - Key-safe: this runs server-side only; FMP_API_KEY never reaches the client.
 *  - Honest: demo data is served ONLY when no key is configured (and it's clearly
 *    labeled in the UI). When a key IS set but live data fails (rate limit /
 *    outage), we throw LiveDataUnavailableError rather than passing off sample
 *    numbers as real.
 */

import "server-only";
import type { StockData } from "@/types/stock";
import { normalizeFmp } from "./normalize";
import { getDemoTicker } from "./demoData";
import {
  FMP_BASE,
  fetchFmpJson,
  LiveDataUnavailableError,
} from "./fmpClient";
import { registerFetch } from "./supabase/usage";

// Re-export so existing imports (the dashboard) keep working.
export { LiveDataUnavailableError };

export class TickerNotFoundError extends Error {
  constructor(ticker: string) {
    super(`No data found for ticker "${ticker}".`);
    this.name = "TickerNotFoundError";
  }
}

/** Validate/normalize a user-supplied ticker. Returns null if obviously invalid. */
export function sanitizeTicker(raw: string): string | null {
  const t = raw.trim().toUpperCase();
  // 1–6 letters, optional .EXCHANGE suffix (e.g. BRK.B). Keep it strict & simple.
  if (!/^[A-Z]{1,6}(\.[A-Z]{1,4})?$/.test(t)) return null;
  return t;
}

function firstOf<T>(value: unknown): T | undefined {
  return Array.isArray(value) ? (value[0] as T) : (value as T | undefined);
}

/**
 * Fetch an OPTIONAL metric endpoint. The free tier blocks the ratios/metrics
 * endpoints for symbols outside its covered set (ETFs, less-common tickers),
 * returning a "Special Endpoint not supported" message. We treat that — and any
 * non-rate-limit failure — as simply "no data for this metric" (returns
 * undefined) rather than failing the whole request. Real rate limits still
 * propagate, so we stay honest about the daily cap.
 */
async function optionalFmp(url: string): Promise<unknown | undefined> {
  try {
    return await fetchFmpJson(url);
  } catch (err) {
    if (err instanceof LiveDataUnavailableError && err.reason === "rate_limit") {
      throw err;
    }
    return undefined;
  }
}

type FmpProfile = { symbol?: string };

async function fetchFromFmp(
  ticker: string,
  apiKey: string,
): Promise<StockData | null> {
  await registerFetch(`stock:${ticker}`, 4); // 4 endpoints below
  const q = `symbol=${ticker}&apikey=${apiKey}`;
  const [profileRaw, ratiosRaw, keyMetricsRaw, growthRaw] = await Promise.all([
    fetchFmpJson(`${FMP_BASE}/profile?${q}`), // required
    optionalFmp(`${FMP_BASE}/ratios-ttm?${q}`),
    optionalFmp(`${FMP_BASE}/key-metrics-ttm?${q}`),
    optionalFmp(`${FMP_BASE}/financial-growth?${q}&limit=1`),
  ]);

  // Unknown ticker → empty array (not an error).
  const profile = firstOf<FmpProfile>(profileRaw);
  if (!profile || !profile.symbol) return null;

  // Profile present but no ratios → fundamentals come back null, and the
  // dashboard shows an honest "can't value this one" card.
  return normalizeFmp(
    ticker,
    profile,
    firstOf(ratiosRaw),
    firstOf(keyMetricsRaw),
    firstOf(growthRaw),
  );
}

/**
 * Primary entry point. Returns normalized StockData, or throws:
 *  - TickerNotFoundError      — the symbol doesn't exist
 *  - LiveDataUnavailableError — live data couldn't be reached (no fake fallback)
 */
export async function getStockData(ticker: string): Promise<StockData> {
  const apiKey = process.env.FMP_API_KEY;

  if (apiKey) {
    let live: StockData | null;
    try {
      live = await fetchFromFmp(ticker, apiKey);
    } catch (err) {
      if (err instanceof LiveDataUnavailableError) throw err;
      throw new LiveDataUnavailableError("error");
    }
    if (live) return live;
    throw new TickerNotFoundError(ticker); // valid request, no such symbol
  }

  // No key configured — keyless demo mode (the UI labels this clearly).
  const demo = getDemoTicker(ticker);
  if (demo) return demo;
  throw new TickerNotFoundError(ticker);
}
