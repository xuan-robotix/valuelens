/**
 * Bundled demo dataset.
 *
 * ValueLens works out-of-the-box with no API key: if FMP_API_KEY is unset, or a
 * live lookup fails, we serve these hand-built snapshots for a few well-known
 * tickers. This keeps the app demoable and the learning loop fast. Numbers are
 * illustrative and roughly realistic, not live.
 */

import type { StockData } from "@/types/stock";

type DemoEntry = Omit<StockData, "source" | "fetchedAt">;

const DEMO: Record<string, DemoEntry> = {
  AAPL: {
    profile: {
      ticker: "AAPL",
      name: "Apple Inc.",
      exchange: "NASDAQ",
      sector: "Technology",
      industry: "Consumer Electronics",
      description:
        "Designs and sells smartphones, computers, wearables, and a growing services business.",
      price: 231.4,
      changePercent: 1.18,
      marketCap: 3.45e12,
      currency: "USD",
    },
    fundamentals: {
      peRatio: 31.2,
      pbRatio: 48.5,
      psRatio: 8.6,
      evToEbitda: 23.1,
      dividendYield: 0.0045,
      revenueGrowth: 0.06,
      earningsGrowth: 0.1,
      netMargin: 0.25,
      returnOnEquity: 1.5,
      returnOnAssets: 0.28,
      debtToEquity: 1.45,
    },
  },
  MSFT: {
    profile: {
      ticker: "MSFT",
      name: "Microsoft Corporation",
      exchange: "NASDAQ",
      sector: "Technology",
      industry: "Software—Infrastructure",
      description:
        "Develops software, cloud (Azure), productivity tools, and gaming platforms.",
      price: 449.2,
      changePercent: -0.42,
      marketCap: 3.34e12,
      currency: "USD",
    },
    fundamentals: {
      peRatio: 36.4,
      pbRatio: 11.8,
      psRatio: 13.2,
      evToEbitda: 24.8,
      dividendYield: 0.0072,
      revenueGrowth: 0.16,
      earningsGrowth: 0.2,
      netMargin: 0.36,
      returnOnEquity: 0.39,
      returnOnAssets: 0.18,
      debtToEquity: 0.38,
    },
  },
  KO: {
    profile: {
      ticker: "KO",
      name: "The Coca-Cola Company",
      exchange: "NYSE",
      sector: "Consumer Defensive",
      industry: "Beverages—Non-Alcoholic",
      description:
        "Manufactures and markets non-alcoholic beverages worldwide.",
      price: 62.8,
      changePercent: 0.31,
      marketCap: 2.7e11,
      currency: "USD",
    },
    fundamentals: {
      peRatio: 24.1,
      pbRatio: 9.9,
      psRatio: 5.8,
      evToEbitda: 17.4,
      dividendYield: 0.031,
      revenueGrowth: 0.03,
      earningsGrowth: 0.05,
      netMargin: 0.22,
      returnOnEquity: 0.39,
      returnOnAssets: 0.1,
      debtToEquity: 1.6,
    },
  },
  NVDA: {
    profile: {
      ticker: "NVDA",
      name: "NVIDIA Corporation",
      exchange: "NASDAQ",
      sector: "Technology",
      industry: "Semiconductors",
      description:
        "Designs GPUs and accelerated-computing platforms for AI, gaming, and data centers.",
      price: 121.5,
      changePercent: 2.74,
      marketCap: 2.98e12,
      currency: "USD",
    },
    fundamentals: {
      peRatio: 64.8,
      pbRatio: 52.3,
      psRatio: 31.2,
      evToEbitda: 58.6,
      dividendYield: 0.0003,
      revenueGrowth: 1.22,
      earningsGrowth: 1.68,
      netMargin: 0.53,
      returnOnEquity: 1.15,
      returnOnAssets: 0.65,
      debtToEquity: 0.22,
    },
  },
  F: {
    profile: {
      ticker: "F",
      name: "Ford Motor Company",
      exchange: "NYSE",
      sector: "Consumer Cyclical",
      industry: "Auto Manufacturers",
      description:
        "Designs, manufactures, and sells vehicles and provides financing.",
      price: 11.2,
      changePercent: -1.05,
      marketCap: 4.45e10,
      currency: "USD",
    },
    fundamentals: {
      peRatio: 11.6,
      pbRatio: 1.0,
      psRatio: 0.25,
      evToEbitda: 11.2,
      dividendYield: 0.054,
      revenueGrowth: 0.05,
      earningsGrowth: -0.04,
      netMargin: 0.03,
      returnOnEquity: 0.09,
      returnOnAssets: 0.01,
      debtToEquity: 3.4,
    },
  },
  GOOGL: {
    profile: {
      ticker: "GOOGL",
      name: "Alphabet Inc.",
      exchange: "NASDAQ",
      sector: "Communication Services",
      industry: "Internet Content & Information",
      description:
        "Parent of Google — search, advertising, cloud, and YouTube.",
      price: 178.4,
      changePercent: 0.64,
      marketCap: 2.18e12,
      currency: "USD",
    },
    fundamentals: {
      peRatio: 24.6,
      pbRatio: 7.1,
      psRatio: 6.5,
      evToEbitda: 17.2,
      dividendYield: 0.005,
      revenueGrowth: 0.13,
      earningsGrowth: 0.31,
      netMargin: 0.27,
      returnOnEquity: 0.3,
      returnOnAssets: 0.18,
      debtToEquity: 0.08,
    },
  },
  META: {
    profile: {
      ticker: "META",
      name: "Meta Platforms, Inc.",
      exchange: "NASDAQ",
      sector: "Communication Services",
      industry: "Internet Content & Information",
      description:
        "Operates Facebook, Instagram, WhatsApp, and invests in the metaverse.",
      price: 486.1,
      changePercent: 1.42,
      marketCap: 1.24e12,
      currency: "USD",
    },
    fundamentals: {
      peRatio: 27.3,
      pbRatio: 7.4,
      psRatio: 9.1,
      evToEbitda: 18.0,
      dividendYield: 0.004,
      revenueGrowth: 0.16,
      earningsGrowth: 0.35,
      netMargin: 0.34,
      returnOnEquity: 0.3,
      returnOnAssets: 0.18,
      debtToEquity: 0.3,
    },
  },
  PEP: {
    profile: {
      ticker: "PEP",
      name: "PepsiCo, Inc.",
      exchange: "NASDAQ",
      sector: "Consumer Defensive",
      industry: "Beverages—Non-Alcoholic",
      description:
        "Global food and beverage company (Pepsi, Frito-Lay, Quaker).",
      price: 168.9,
      changePercent: -0.18,
      marketCap: 2.32e11,
      currency: "USD",
    },
    fundamentals: {
      peRatio: 23.8,
      pbRatio: 11.9,
      psRatio: 2.6,
      evToEbitda: 16.8,
      dividendYield: 0.031,
      revenueGrowth: 0.04,
      earningsGrowth: 0.06,
      netMargin: 0.1,
      returnOnEquity: 0.5,
      returnOnAssets: 0.09,
      debtToEquity: 2.1,
    },
  },
  GM: {
    profile: {
      ticker: "GM",
      name: "General Motors Company",
      exchange: "NYSE",
      sector: "Consumer Cyclical",
      industry: "Auto Manufacturers",
      description:
        "Designs, builds, and sells trucks, cars, and automobile parts.",
      price: 47.8,
      changePercent: 0.92,
      marketCap: 5.4e10,
      currency: "USD",
    },
    fundamentals: {
      peRatio: 6.1,
      pbRatio: 0.8,
      psRatio: 0.3,
      evToEbitda: 9.1,
      dividendYield: 0.012,
      revenueGrowth: 0.07,
      earningsGrowth: 0.1,
      netMargin: 0.05,
      returnOnEquity: 0.14,
      returnOnAssets: 0.03,
      debtToEquity: 1.7,
    },
  },
};

export function getDemoTicker(ticker: string): StockData | null {
  const entry = DEMO[ticker.toUpperCase()];
  if (!entry) return null;
  return { ...entry, source: "demo", fetchedAt: new Date().toISOString() };
}

export const DEMO_TICKERS = Object.keys(DEMO);
