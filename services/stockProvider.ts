/**
 * Data service: the only module that talks to external stock APIs.
 *
 * Design notes:
 *  - Provider-agnostic: callers get a normalized StockData and never see FMP.
 *  - Key-safe: this runs server-side only; FMP_API_KEY never reaches the client.
 *  - Graceful: with no key (or on failure) it falls back to the bundled demo set,
 *    so the app always works. Swapping providers means editing only this file.
 */

import "server-only";
import type { StockData } from "@/types/stock";
import { normalizeFmp } from "./normalize";
import { getDemoTicker } from "./demoData";

const FMP_BASE = "https://financialmodelingprep.com/api/v3";

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

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { next: { revalidate: 60 * 30 } }); // 30-min cache
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  return res.json();
}

function firstOf<T>(value: unknown): T | undefined {
  return Array.isArray(value) ? (value[0] as T) : (value as T | undefined);
}

async function fetchFromFmp(
  ticker: string,
  apiKey: string,
): Promise<StockData | null> {
  const q = `apikey=${apiKey}`;
  const [profileRaw, ratiosRaw, growthRaw] = await Promise.all([
    fetchJson(`${FMP_BASE}/profile/${ticker}?${q}`),
    fetchJson(`${FMP_BASE}/ratios-ttm/${ticker}?${q}`),
    fetchJson(`${FMP_BASE}/financial-growth/${ticker}?period=annual&limit=1&${q}`),
  ]);

  const profile = firstOf<Record<string, never>>(profileRaw);
  if (!profile || Object.keys(profile).length === 0) return null; // unknown ticker

  return normalizeFmp(
    ticker,
    profile,
    firstOf(ratiosRaw),
    firstOf(growthRaw),
  );
}

/**
 * Primary entry point. Returns normalized StockData or throws
 * TickerNotFoundError. Falls back to demo data when no key is configured or the
 * live call fails for any reason.
 */
export async function getStockData(ticker: string): Promise<StockData> {
  const apiKey = process.env.FMP_API_KEY;

  if (apiKey) {
    try {
      const live = await fetchFromFmp(ticker, apiKey);
      if (live) return live;
      // Live provider returned nothing — try demo before giving up.
      const demo = getDemoTicker(ticker);
      if (demo) return demo;
      throw new TickerNotFoundError(ticker);
    } catch (err) {
      if (err instanceof TickerNotFoundError) throw err;
      // Network/upstream error: degrade to demo if we have it.
      const demo = getDemoTicker(ticker);
      if (demo) return demo;
      throw new TickerNotFoundError(ticker);
    }
  }

  // No key configured — demo mode.
  const demo = getDemoTicker(ticker);
  if (demo) return demo;
  throw new TickerNotFoundError(ticker);
}
