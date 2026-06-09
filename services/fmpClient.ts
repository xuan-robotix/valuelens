import "server-only";

/** Shared FMP (stable API) constants, errors, and fetch helper. */

export const FMP_BASE = "https://financialmodelingprep.com/stable";
export const SIX_HOURS = 60 * 60 * 6;

/** Free-tier daily request cap (used only to contextualize the usage meter). */
export const FMP_DAILY_LIMIT = 250;

/** Thrown when live data can't be retrieved — so we NEVER substitute fake/demo
 * numbers while a real key is configured. `reason` tailors the user message. */
export class LiveDataUnavailableError extends Error {
  reason: "rate_limit" | "error";
  constructor(reason: "rate_limit" | "error" = "error") {
    super(
      reason === "rate_limit"
        ? "Live market data limit reached."
        : "Live market data is temporarily unavailable.",
    );
    this.name = "LiveDataUnavailableError";
    this.reason = reason;
  }
}

/**
 * Fetch + parse an FMP endpoint. Caches for 6h (quota-friendly) and detects
 * FMP's error shapes: HTTP 429, a non-JSON body, or a `{ "Error Message": … }`
 * object. Rate-limit-ish messages map to a `rate_limit` reason.
 */
export async function fetchFmpJson(url: string): Promise<unknown> {
  const res = await fetch(url, { next: { revalidate: SIX_HOURS } });

  if (res.status === 429) throw new LiveDataUnavailableError("rate_limit");
  if (!res.ok) throw new LiveDataUnavailableError("error");

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    // FMP returns plain-text messages for some plan/limit errors.
    throw new LiveDataUnavailableError(/limit/i.test(text) ? "rate_limit" : "error");
  }

  if (
    json &&
    typeof json === "object" &&
    !Array.isArray(json) &&
    "Error Message" in (json as Record<string, unknown>)
  ) {
    const msg = String((json as Record<string, unknown>)["Error Message"]);
    throw new LiveDataUnavailableError(/limit/i.test(msg) ? "rate_limit" : "error");
  }

  return json;
}
