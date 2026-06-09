/**
 * Presenter: turns provider-agnostic Fundamentals into the grouped, labeled,
 * tooltip-annotated metrics the dashboard renders. Pure and display-only — no
 * scoring here (that's the engine's job).
 */

import type { Fundamentals, MetricGroup } from "@/types/stock";

export function buildMetricGroups(f: Fundamentals): MetricGroup[] {
  return [
    {
      key: "valuation",
      title: "Valuation",
      metrics: [
        {
          key: "peRatio",
          label: "P/E Ratio",
          value: f.peRatio,
          format: "ratio",
          help: "Price paid per dollar of annual earnings. Lower can mean cheaper.",
        },
        {
          key: "pbRatio",
          label: "P/B Ratio",
          value: f.pbRatio,
          format: "ratio",
          help: "Price relative to the company's net book value (assets minus liabilities).",
        },
        {
          key: "psRatio",
          label: "P/S Ratio",
          value: f.psRatio,
          format: "ratio",
          help: "Price relative to annual revenue. Useful when earnings are thin or negative.",
        },
        {
          key: "evToEbitda",
          label: "EV / EBITDA",
          value: f.evToEbitda,
          format: "ratio",
          help: "Whole-company value versus core operating profit. Debt-aware valuation gauge.",
        },
        {
          key: "dividendYield",
          label: "Dividend Yield",
          value: f.dividendYield,
          format: "percent",
          help: "Annual dividends as a percentage of the share price.",
        },
      ],
    },
    {
      key: "growth",
      title: "Growth",
      metrics: [
        {
          key: "revenueGrowth",
          label: "Revenue Growth",
          value: f.revenueGrowth,
          format: "percent",
          help: "Year-over-year change in sales. Growth helps justify a higher price.",
        },
        {
          key: "earningsGrowth",
          label: "Earnings Growth",
          value: f.earningsGrowth,
          format: "percent",
          help: "Year-over-year change in profits.",
        },
      ],
    },
    {
      key: "profitability",
      title: "Profitability",
      metrics: [
        {
          key: "netMargin",
          label: "Net Margin",
          value: f.netMargin,
          format: "percent",
          help: "Profit kept from each dollar of revenue after all costs.",
        },
        {
          key: "returnOnEquity",
          label: "Return on Equity",
          value: f.returnOnEquity,
          format: "percent",
          help: "Profit generated on shareholders' invested capital.",
        },
        {
          key: "returnOnAssets",
          label: "Return on Assets",
          value: f.returnOnAssets,
          format: "percent",
          help: "How efficiently the company turns its assets into profit.",
        },
        {
          key: "debtToEquity",
          label: "Debt / Equity",
          value: f.debtToEquity,
          format: "ratio",
          help: "Borrowings relative to equity. Higher means more financial leverage and risk.",
        },
      ],
    },
  ];
}
