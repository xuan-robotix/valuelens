import { NextResponse } from "next/server";
import {
  getStockData,
  sanitizeTicker,
  TickerNotFoundError,
  LiveDataUnavailableError,
} from "@/services/stockProvider";
import { evaluate } from "@/lib/valuation/engine";

/**
 * GET /api/stock/[ticker]
 * Server-side: fetches + normalizes fundamentals and runs the valuation engine.
 * The FMP key (if any) lives only here, never on the client.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker: rawTicker } = await params;
  const ticker = sanitizeTicker(rawTicker ?? "");

  if (!ticker) {
    return NextResponse.json(
      { error: "Invalid ticker. Use 1–6 letters, e.g. AAPL." },
      { status: 400 },
    );
  }

  try {
    const data = await getStockData(ticker);
    const valuation = evaluate(data.fundamentals);
    return NextResponse.json({ data, valuation });
  } catch (err) {
    if (err instanceof TickerNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof LiveDataUnavailableError) {
      return NextResponse.json(
        {
          error:
            err.reason === "rate_limit"
              ? "Live market data limit reached for today. Try again later."
              : "Live market data is temporarily unavailable. Try again shortly.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Something went wrong fetching this stock. Please try again." },
      { status: 502 },
    );
  }
}
