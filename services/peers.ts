import "server-only";
import type { StockData } from "@/types/stock";
import { getStockData } from "./stockProvider";

/**
 * Sector peers for a stock. Phase 3: powers peer comparison + sector-relative
 * context. Uses a small curated universe grouped by sector — enough to make
 * comparison meaningful in demo mode, and a clean seam to swap in a live peers
 * endpoint (e.g. FMP /stock_peers) later.
 */
const SECTOR_UNIVERSE: Record<string, string[]> = {
  Technology: ["AAPL", "MSFT", "NVDA"],
  "Communication Services": ["GOOGL", "META"],
  "Consumer Defensive": ["KO", "PEP"],
  "Consumer Cyclical": ["F", "GM"],
};

export async function getPeers(
  self: StockData,
  limit = 4,
): Promise<StockData[]> {
  const sector = self.profile.sector;
  if (!sector) return [];

  const tickers = (SECTOR_UNIVERSE[sector] ?? [])
    .filter((t) => t !== self.profile.ticker)
    .slice(0, limit);

  const results = await Promise.all(
    tickers.map(async (t) => {
      try {
        return await getStockData(t);
      } catch {
        return null;
      }
    }),
  );

  return results.filter((r): r is StockData => r !== null);
}
