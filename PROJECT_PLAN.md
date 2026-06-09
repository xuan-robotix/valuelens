# ValueLens — Project Plan

> **A stock valuation analysis platform that tells you, at a glance, whether a stock looks cheap, fair, or expensive.**

**Document status:** Blueprint v1.0 · Pre-implementation
**Author:** Founding engineering & design
**Last updated:** 2026-06-09

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [User Personas](#3-user-personas)
4. [Core Features (V1)](#4-core-features-v1)
5. [Application Flow](#5-application-flow)
6. [UI / UX Design System](#6-ui--ux-design-system)
7. [Database Architecture](#7-database-architecture)
8. [API Strategy](#8-api-strategy)
9. [Valuation Engine](#9-valuation-engine)
10. [Project Architecture](#10-project-architecture)
11. [Development Roadmap](#11-development-roadmap)
12. [Launch Strategy](#12-launch-strategy)
13. [Guiding Principles & Constraints](#13-guiding-principles--constraints)

---

## 1. Executive Summary

### What the application does

ValueLens takes a single input — a stock ticker (e.g., `AAPL`) — and returns a clean, immediately legible valuation dashboard. Instead of forcing users to interpret a wall of raw financial ratios, ValueLens distills fundamentals into:

- **Key valuation metrics** (P/E, P/B, P/S, EV/EBITDA, dividend yield)
- **Growth metrics** (revenue growth, earnings growth)
- **Profitability metrics** (net margin, ROE, ROA)
- **A single valuation score** (0–10)
- **A plain-English verdict** (Expensive / Fairly Valued / Attractive) with a short explanation of *why*

### Who it is for

Retail investors who want a fast, trustworthy "first read" on a stock without subscribing to a Bloomberg terminal or wading through a 10-K. The platform spans three audiences — beginners who need plain language, intermediates who want the underlying numbers, and long-term investors who care about quality and consistency.

### Why it is useful

Financial data is abundant but **interpretation is scarce**. Most free tools (Yahoo Finance, Finviz) show numbers but leave the judgment to the user. Premium tools (Morningstar) provide judgment but behind a paywall and a steep learning curve. ValueLens occupies the gap: **opinionated, transparent, and free to start**, with a design that signals trust.

### Core value proposition

> **"Type a ticker. Understand it in ten seconds."**

ValueLens is not a financial advisor and does not predict prices. It is a **clarity layer** on top of public fundamentals — a lens, not a crystal ball. This positioning is deliberate: it keeps the legal surface small, the scope realistic, and the user promise honest.

---

## 2. Product Vision

### The long-term picture

ValueLens begins as a single-ticker valuation snapshot. Over successive iterations it becomes a **personal valuation workspace** — the place a retail investor opens first when they hear about a stock, before they buy, and periodically to monitor what they own.

The throughline across every iteration is **interpretation over raw data**. Competitors will always have more data; ValueLens wins on *making sense of it*.

### Future possibilities

| Capability | What it becomes | Why it matters |
|---|---|---|
| **Watchlists** | Save tickers; see verdicts side by side; get notified when a verdict changes | Turns a one-shot tool into a recurring habit |
| **Industry comparisons** | "Is AAPL cheap *relative to its sector*?" — peer-relative scoring | Valuation is relative; absolute P/E is misleading across industries |
| **Historical valuation tracking** | Chart a stock's score and key ratios over time | Answers "is this cheap vs. its own history?" |
| **AI-generated explanations** | Natural-language summaries of *why* a company scores the way it does, with risks | Lowers the barrier for beginners; adds depth for everyone |
| **Personalized dashboards** | Configurable metric weights, custom verdict thresholds, themed layouts | Power users tune the engine to their philosophy (value vs. growth) |

### North star

A retail investor should be able to make a **more informed** decision in **less time** using ValueLens than with any free alternative — and trust the verdict enough to act on their own judgment.

---

## 3. User Personas

### Persona A — Maya, the Beginner Investor

- **Profile:** 26, just opened a brokerage account, owns two ETFs and is curious about individual stocks.
- **Pain:** Financial jargon is intimidating. She doesn't know what a "good" P/E is.
- **How she uses ValueLens:** Types tickers she hears about (from friends, social media). Reads the **verdict and the plain-English explanation first**. The numbers are secondary — she trusts the summary.
- **What she needs:** Plain language, color-coded signals, no jargon without a tooltip, mobile-first.

### Persona B — David, the Intermediate Investor

- **Profile:** 38, has been investing for five years, reads earnings reports occasionally, holds ~15 positions.
- **Pain:** He knows the metrics but it's tedious to gather P/E, margins, and growth across multiple sources.
- **How he uses ValueLens:** Uses it as a **fast aggregator and sanity check**. He scans the metrics, agrees or disagrees with the score, and moves on. Values the score as a *second opinion*, not gospel.
- **What he needs:** Accurate numbers, transparent scoring logic (he wants to see *how* the score was computed), quick ticker switching.

### Persona C — Eleanor, the Long-Term Investor

- **Profile:** 55, buy-and-hold philosophy, focuses on quality businesses and dividends, rebalances yearly.
- **Pain:** She cares about durable profitability and reasonable valuation, not daily noise.
- **How she uses ValueLens:** Periodically checks the **profitability and consistency** of companies she owns or is considering. Will be the heaviest user of **watchlists** and **historical tracking** in later phases.
- **What she needs:** Emphasis on margins, ROE, debt, dividend yield; the ability to save and revisit; trustworthy, calm design.

> **Design implication:** The default view must satisfy Maya (lead with the verdict) without hiding what David and Eleanor want (the numbers and the methodology). Progressive disclosure resolves this: verdict on top, metrics below, methodology one click away.

---

## 4. Core Features (V1)

The MVP ships **five features**. Nothing else.

### 4.1 Ticker Search

A single, prominent search input on the landing page and persistent in the dashboard header. Accepts a ticker symbol, validates it against the data provider, and handles errors gracefully (invalid ticker, no data, rate limit).

- Autocomplete is **deferred** to a later phase to keep V1 lean.
- On submit, the app navigates to `/stock/[ticker]` and fetches data.

### 4.2 Company Information

A compact identity header for the requested stock:

- Company name, ticker, exchange
- Sector / industry
- Current price and day change
- Market capitalization
- (Optional, if cheap to fetch) a one-line business description

This grounds the user — they confirm they're looking at the right company.

### 4.3 Valuation Metrics

The core data display, organized into three labeled metric groups:

- **Valuation:** P/E, P/B, P/S, EV/EBITDA, dividend yield
- **Growth:** revenue growth (YoY), earnings growth (YoY)
- **Profitability:** net profit margin, ROE, ROA, debt-to-equity

Each metric is shown as a card with the value, a short label, and a tooltip explaining what it means in one sentence (serves Maya).

### 4.4 Scoring System

A deterministic engine (see [Section 9](#9-valuation-engine)) that converts the metrics into a **0–10 score**. The score is computed client-side or in a lightweight serverless function from the fetched metrics. Crucially, the breakdown is **transparent** — users can expand to see how each category contributed.

### 4.5 Valuation Verdict

The headline output. Maps the score to one of three verdicts with a color and a one-paragraph explanation:

| Score | Verdict | Color |
|---|---|---|
| 0–3 | **Expensive** | Red |
| 4–6 | **Fairly Valued** | Amber |
| 7–10 | **Attractive Valuation** | Green |

The explanation references the actual drivers ("Margins are strong and growth is healthy, but the P/E of 34 is well above its sector — the price already reflects a lot of optimism.").

> **Explicitly out of scope for V1:** accounts, watchlists, saved analyses, AI text, charts, comparisons. These are roadmapped, not built.

---

## 5. Application Flow

### Step-by-step

1. **User opens the app** → lands on a clean hero with a single search field and a one-line value proposition.
2. **User enters a ticker** → client validates the format, shows a loading state.
3. **Data is fetched** → a service layer calls the stock API (via a serverless route to protect the API key), normalizes the response, and caches it.
4. **Metrics are displayed** → company header renders first, then the three metric groups animate in.
5. **Score is calculated** → the valuation engine runs on the normalized metrics and produces a 0–10 score plus a per-category breakdown.
6. **Valuation verdict is shown** → the verdict card renders at the top with color, label, score, and explanation.

### User journey (Maya, first session)

```
Hears "everyone's buying NVDA"
        │
        ▼
Opens ValueLens on her phone ──► sees clean hero: "Type a ticker. Understand it in ten seconds."
        │
        ▼
Types "NVDA", taps search ──► skeleton loaders appear (feels fast, trustworthy)
        │
        ▼
Verdict card: "Expensive — 2/10" in red, with one paragraph she can actually read
        │
        ▼
Scrolls: sees P/E is very high, growth is strong ──► taps a tooltip on "P/E" to learn what it means
        │
        ▼
Understands the trade-off in ~15 seconds ──► tries "KO" next to compare
        │
        ▼
Leaves informed, not advised. (Later: prompted to create an account to save NVDA & KO.)
```

### Error & edge states (must be designed, not afterthoughts)

- **Invalid ticker:** friendly inline message, suggestion to check the symbol.
- **No fundamental data** (e.g., recent IPO, ETF): explain that valuation metrics aren't available, don't show a misleading score.
- **API rate limit / outage:** graceful fallback, serve cached data if available, clear messaging.
- **Partial data:** score around missing metrics and disclose which were excluded.

---

## 6. UI / UX Design System

**Design north star:** *Modern, premium, minimalist, trustworthy.* The aesthetic borrows the restraint of Apple, the data density discipline of Morningstar, and the speed of Finviz — without the clutter of any free finance site.

### 6.1 Color palette

The palette is **calm and neutral by default**, with color reserved almost exclusively for the verdict — so meaning, not decoration, drives the eye.

**Neutrals (the foundation)**

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#FAFAFA` | `#0B0F14` | Page background |
| `surface` | `#FFFFFF` | `#131922` | Cards |
| `border` | `#E7E9EC` | `#222A35` | Hairlines, dividers |
| `text-primary` | `#0B0F14` | `#F2F4F7` | Headlines, values |
| `text-secondary` | `#5B6470` | `#9AA4B2` | Labels, captions |

**Brand accent**

| Token | Value | Use |
|---|---|---|
| `brand` | `#2563EB` (deep blue) | Primary actions, focus rings, logo |
| `brand-soft` | `#EFF4FF` | Subtle highlights, hover states |

Deep blue communicates **trust and finance** without being a cliché green-money palette.

**Semantic / verdict colors** (the only loud colors in the product)

| Token | Value | Meaning |
|---|---|---|
| `value-attractive` | `#16A34A` (green) | Attractive valuation (7–10) |
| `value-fair` | `#F59E0B` (amber) | Fairly valued (4–6) |
| `value-expensive` | `#DC2626` (red) | Expensive (0–3) |

> **Decision:** Color is *semantic*, never aesthetic. A green stat always means "good for valuation," a red stat always means "expensive/weak." This consistency lets users read the dashboard without reading the labels — exactly Maya's need.

### 6.2 Typography

- **Primary typeface:** `Inter` (UI) — clean, neutral, excellent at small sizes, free, Vercel-friendly.
- **Numeric / tabular data:** Inter with `font-variant-numeric: tabular-nums` so columns of figures align — a small detail that reads as "premium and precise."
- **Optional display face:** `Geist` or keep Inter for a single-typeface system (simpler, recommended for V1).

**Type scale (Tailwind-aligned):**

| Role | Size / weight |
|---|---|
| Hero | `text-5xl` / `font-semibold`, tight tracking |
| Section heading | `text-2xl` / `font-semibold` |
| Card value | `text-3xl` / `font-semibold`, tabular |
| Card label | `text-sm` / `font-medium`, `text-secondary`, uppercase tracking-wide |
| Body / explanation | `text-base` / `font-normal`, relaxed line height |

### 6.3 Layout principles

1. **One primary action per screen.** Landing = search. Dashboard = read the verdict.
2. **Generous whitespace.** Premium feel comes from breathing room, not ornamentation.
3. **A 12-column responsive grid** with a max content width (~`max-w-5xl`) so the dashboard never sprawls on large monitors.
4. **Vertical hierarchy = importance.** Verdict at the top, metrics below, methodology last.
5. **Progressive disclosure.** Defaults are simple; depth is available on demand (tooltips, expandable score breakdown).

### 6.4 Component styles

- **Buttons:** solid `brand` for primary, subtle border for secondary, fully rounded-`lg`, clear focus ring (`brand`), no gradients.
- **Inputs:** large search field, `rounded-xl`, soft inner border, prominent focus state. The hero search is oversized and centered.
- **Tooltips:** small, dark, appear on hover/tap; one sentence; define every jargon term.
- **Loading:** skeleton shimmer cards (not spinners) so the layout feels stable and fast.
- **Motion:** subtle, fast (150–250ms) ease-out transitions; cards fade-and-rise on load. Motion communicates responsiveness; never decorative or slow.

### 6.5 Card design

The metric **card** is the atomic unit of the dashboard:

```
┌─────────────────────────┐
│ P/E RATIO            ⓘ  │   ← label (secondary), tooltip icon
│                         │
│ 28.4                    │   ← value (large, tabular)
│ ▲ above sector avg      │   ← optional context line, semantic color
└─────────────────────────┘
```

- `surface` background, `border` hairline, `rounded-2xl`, soft shadow (`shadow-sm`), `p-5`.
- Consistent height within a row for visual rhythm.
- The optional context line carries semantic color; the value itself stays neutral unless it *is* the verdict.

### 6.6 Dashboard design

```
┌──────────────────────────────────────────────────────────┐
│  [ValueLens]              [ search: ticker ____ ]   [☾]   │  header
├──────────────────────────────────────────────────────────┤
│  Apple Inc. · AAPL · NASDAQ          $XXX.XX  ▲ +1.2%     │  company header
│  Technology · Consumer Electronics      Mkt Cap $X.XT     │
├──────────────────────────────────────────────────────────┤
│  ╔══════════════════════════════════════════════════╗    │
│  ║  ATTRACTIVE VALUATION            Score  7.5 / 10  ║    │  verdict (green)
│  ║  Strong margins and steady growth at a reasonable ║    │
│  ║  price relative to its sector. ...                ║    │
│  ╚══════════════════════════════════════════════════╝    │
├──────────────────────────────────────────────────────────┤
│  VALUATION                                                │
│  [P/E] [P/B] [P/S] [EV/EBITDA] [Div Yield]                │  metric group
│                                                           │
│  GROWTH                                                   │
│  [Revenue YoY] [Earnings YoY]                             │
│                                                           │
│  PROFITABILITY                                            │
│  [Net Margin] [ROE] [ROA] [Debt/Equity]                  │
├──────────────────────────────────────────────────────────┤
│  ▸ How this score was calculated   (expandable)          │  methodology
└──────────────────────────────────────────────────────────┘
```

### 6.7 Mobile responsiveness

- **Mobile-first** (Maya is on her phone). Single-column stack; metric cards become a 2-up grid on small screens, 3–4-up on desktop.
- Search collapses into the header with a sticky position.
- Touch targets ≥ 44px; tooltips trigger on tap and dismiss on outside-tap.
- Verdict card remains the first thing visible above the fold on every device.

### 6.8 Dark mode

Ship **dark mode in V1** — it's cheap with Tailwind's `dark:` variants and strongly reinforces the "premium fintech" feel. The neutral-heavy palette is designed for both modes from the start (see token table).

---

## 7. Database Architecture

> **Note:** The MVP (Phase 1) is **stateless** — no login, no persistence — so the database is *not strictly required to ship V1*. These tables are defined now so the schema is ready when Phase 2 (accounts) begins, and so V1 code is written with the future shape in mind. Implemented on **Supabase / PostgreSQL** with **Row Level Security (RLS)**.

### Entity relationship overview

```
auth.users (Supabase managed)
     │ 1
     │
     ├──1───< profiles          (one profile per user)
     │
     ├──1───< watchlists        (a user has many watchlists)
     │             │ 1
     │             └──< watchlist_items   (a watchlist has many tickers)
     │
     └──1───< saved_analyses    (a user saves many analysis snapshots)
```

### 7.1 `profiles`

Extends Supabase's managed `auth.users`. Stores app-level user data.

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | FK → `auth.users.id`, on delete cascade |
| `username` | `text` | unique, nullable |
| `display_name` | `text` | nullable |
| `avatar_url` | `text` | nullable |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` |

**RLS:** a user can select/update only the row where `id = auth.uid()`.

### 7.2 `watchlists`

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `auth.users.id`, on delete cascade |
| `name` | `text` | e.g., "Tech I'm watching"; default "My Watchlist" |
| `created_at` | `timestamptz` | default `now()` |

**RLS:** rows where `user_id = auth.uid()`.

### 7.3 `watchlist_items`

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | default `gen_random_uuid()` |
| `watchlist_id` | `uuid` | FK → `watchlists.id`, on delete cascade |
| `ticker` | `text` | uppercase symbol, e.g., `AAPL` |
| `note` | `text` | optional user note |
| `added_at` | `timestamptz` | default `now()` |

Unique constraint on `(watchlist_id, ticker)` to prevent duplicates.
**RLS:** access via ownership of the parent watchlist.

### 7.4 `saved_analyses`

Stores a **snapshot** of a valuation at a point in time — the metrics and score as they were when saved. This powers "saved searches" and, later, historical tracking.

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `auth.users.id`, on delete cascade |
| `ticker` | `text` | symbol analyzed |
| `score` | `numeric(3,1)` | 0.0–10.0 |
| `verdict` | `text` | `expensive` \| `fair` \| `attractive` |
| `metrics` | `jsonb` | full normalized metric snapshot |
| `score_breakdown` | `jsonb` | per-category contributions for transparency |
| `created_at` | `timestamptz` | default `now()` |

`jsonb` keeps snapshots flexible as the metric set evolves without schema churn.
**RLS:** rows where `user_id = auth.uid()`.

### 7.5 (Optional, future) `ticker_cache`

A server-side cache to reduce API calls and cost. Not user-scoped.

| Field | Type | Notes |
|---|---|---|
| `ticker` | `text` PK | symbol |
| `data` | `jsonb` | normalized provider response |
| `fetched_at` | `timestamptz` | for TTL invalidation |

Lets multiple users share a cached fetch (e.g., everyone looking up `AAPL` today hits the cache, not the paid API).

---

## 8. API Strategy

The single biggest external dependency is the **fundamentals data provider**. V1 needs: company profile, current price, and the fundamental ratios (P/E, P/B, P/S, EV/EBITDA, margins, ROE/ROA, growth, debt). The provider must expose these *as computed ratios or as raw statements we can compute from*.

### Comparison

| Provider | Free tier | Paid entry | Fundamentals quality | Ease of implementation | Notes |
|---|---|---|---|---|---|
| **Alpha Vantage** | 25 req/day, 5/min (very tight) | ~$50/mo | Good — has `OVERVIEW` endpoint with most ratios in one call | Easy; one endpoint returns most of what V1 needs | Free tier too small for real use; rate limits are punishing |
| **Financial Modeling Prep (FMP)** | ~250 req/day | ~$22–30/mo | **Excellent** — dedicated ratios, key-metrics, profile, and growth endpoints | **Easiest** — purpose-built fundamentals endpoints, clean JSON, ratios precomputed | Best fit for a valuation tool specifically |
| **Finnhub** | 60 req/min (generous) | ~$50+/mo | Good — `/stock/metric` returns many ratios; fundamentals depth gated on paid | Easy; generous free rate limit good for development | Some fundamentals limited on free tier |
| **Polygon** | Limited fundamentals on free | ~$30+/mo | Strong on market/price data; fundamentals less ratio-ready | Moderate — more oriented to prices/aggregates than ready ratios | Overkill for V1; better when we add charts/history |

### Recommendation for V1: **Financial Modeling Prep (FMP)**

**Why:**

1. **Purpose-built for fundamentals.** FMP exposes `/profile`, `/ratios-ttm`, `/key-metrics-ttm`, and `/financial-growth` — returning P/E, P/B, P/S, EV/EBITDA, margins, ROE, ROA, debt-to-equity, and growth as **precomputed values**. That means our valuation engine consumes clean inputs instead of recomputing from raw statements — directly aligned with "avoid overengineering."
2. **Reasonable cost and a usable free tier** for development and early launch.
3. **Cleanest path to MVP** given exactly the metric set ValueLens needs.

**Implementation pattern (important for security & cost):**

- All provider calls happen **server-side** in a Next.js Route Handler / serverless function (`/app/api/stock/[ticker]`). The API key lives in a Vercel environment variable and is **never exposed to the client**.
- Responses are **normalized** into a single internal `StockData` shape so the rest of the app (and the valuation engine) is provider-agnostic. This is the key abstraction that lets us swap providers later without touching UI.
- Add **caching** (in-memory per-instance for V1, `ticker_cache` table later) with a short TTL (e.g., intraday) to stay within rate limits and control cost.

> **Provider-agnostic design is non-negotiable.** One `StockDataProvider` interface, one normalizer. If FMP's pricing or quality disappoints, swapping to Finnhub touches one module.

---

## 9. Valuation Engine

The valuation engine is the **product's opinion**. It must be simple, transparent, and defensible — not a black box.

### Design philosophy

- **Deterministic and explainable.** Every point in the score traces to a metric. Users (especially David) can see exactly why.
- **Category-based.** Four categories, each scored, then combined. This mirrors how a human analyst thinks and makes the explanation natural.
- **Sane defaults, future-tunable.** V1 uses fixed thresholds; later phases make them sector-relative and user-configurable.

### The four categories

Each category outputs a sub-score; the weighted sum produces a **0–10 total**.

| Category | Metrics used | Weight | Rationale |
|---|---|---|---|
| **Valuation** | P/E, P/B, P/S, EV/EBITDA | 40% | This is a *valuation* tool — price relative to fundamentals is the core question |
| **Growth** | Revenue growth YoY, earnings growth YoY | 25% | Growth justifies a higher price; cheap + shrinking isn't actually attractive |
| **Profitability** | Net margin, ROE, ROA | 25% | Quality of the business; high margins/returns deserve a premium |
| **Financial health (Debt)** | Debt-to-equity | 10% | A risk dampener; high leverage caps the score |

### How scoring works

Each metric is scored on a normalized **0–10 sub-scale** using thresholds, then averaged within its category, then the categories are combined by weight.

**Example: Valuation category (lower ratio = cheaper = higher score)**

```
P/E score:
  P/E < 10        → 10   (very cheap)
  10 ≤ P/E < 15   → 8
  15 ≤ P/E < 20   → 6
  20 ≤ P/E < 25   → 5
  25 ≤ P/E < 35   → 3
  P/E ≥ 35        → 1    (very expensive)
  P/E ≤ 0 (loss)  → null (excluded — disclose to user)
```

Analogous threshold ladders exist for P/B, P/S, EV/EBITDA (lower is cheaper) and are **inverted** for growth and profitability (higher is better). Debt-to-equity is a *penalty*: high D/E pulls the financial-health sub-score down.

**Combining:**

```
total = 0.40 * valuation_subscore
      + 0.25 * growth_subscore
      + 0.25 * profitability_subscore
      + 0.10 * health_subscore
```

`total` is rounded to one decimal for display, and to an integer band for the verdict.

### Why it works

- **It's relative-ish without needing a peer database in V1.** Threshold ladders encode "what's generally cheap vs. expensive." (Phase 3 upgrades these to *sector-relative* thresholds, which is where the model gets genuinely good.)
- **It's honest about gaps.** A metric that can't be computed (e.g., negative earnings → no meaningful P/E) is **excluded and disclosed**, not faked. The category re-weights over available metrics.
- **It's transparent.** The per-category and per-metric contributions are surfaced in the "How this score was calculated" panel — turning the score from an opinion you must trust into one you can audit.

### How scores translate into verdicts

| Score | Verdict | Plain-English framing |
|---|---|---|
| **0–3** | **Expensive** | "The market is pricing in a lot. Fundamentals don't currently justify the price by these measures." |
| **4–6** | **Fairly Valued** | "Price and fundamentals are roughly in balance. No obvious bargain or warning here." |
| **7–10** | **Attractive Valuation** | "Fundamentals look strong relative to the price by these measures. Worth a closer look." |

### Explicit limitations (shown to users — builds trust)

ValueLens scores **fundamentals only**. It does not account for forward guidance, management quality, moat, macro conditions, or sentiment. The verdict is a **starting point for research, not financial advice**. This disclaimer is a permanent part of the UI, not fine print.

---

## 10. Project Architecture

A pragmatic Next.js (App Router) + TypeScript + Tailwind structure. Flat enough to navigate on day one, structured enough to scale to Phase 4.

```
valuelens/
├── app/                          # Next.js App Router (pages + API routes)
│   ├── layout.tsx                # Root layout, fonts, theme provider
│   ├── page.tsx                  # Landing / hero + search
│   ├── stock/
│   │   └── [ticker]/
│   │       └── page.tsx          # The valuation dashboard
│   └── api/
│       └── stock/
│           └── [ticker]/
│               └── route.ts      # Server-side data fetch (hides API key)
│
├── components/                   # Reusable presentational components
│   ├── ui/                       # Primitives: Button, Card, Input, Tooltip, Skeleton
│   ├── search/                   # SearchBar, SearchResultStates
│   ├── dashboard/                # CompanyHeader, VerdictCard, MetricCard, MetricGroup, ScoreBreakdown
│   └── layout/                   # Header, Footer, ThemeToggle
│
├── services/                     # External I/O and orchestration
│   ├── stockProvider.ts          # StockDataProvider interface + FMP implementation
│   ├── normalize.ts              # Provider response → internal StockData shape
│   └── supabase/                 # Supabase client + queries (Phase 2+)
│       ├── client.ts
│       └── queries.ts
│
├── lib/                          # Pure domain logic (no I/O)
│   └── valuation/
│       ├── engine.ts             # Scoring engine: metrics → score + breakdown
│       ├── thresholds.ts         # Threshold ladders & weights (config-like)
│       └── verdict.ts            # Score → verdict mapping + explanation builder
│
├── utils/                        # Generic helpers
│   ├── format.ts                 # Number/currency/percent formatting
│   └── cn.ts                     # Tailwind class merge helper
│
├── types/                        # Shared TypeScript types
│   ├── stock.ts                  # StockData, MetricGroup, Metric
│   ├── valuation.ts              # Score, Verdict, ScoreBreakdown
│   └── db.ts                     # Supabase row types (generated later)
│
├── db/                           # Database as code
│   ├── schema.sql                # Table definitions
│   ├── policies.sql              # RLS policies
│   └── migrations/               # Versioned migrations (Phase 2+)
│
├── public/                       # Static assets, logo, og image
├── styles/                       # Tailwind globals, design tokens
│   └── globals.css
│
├── .env.local                    # FMP_API_KEY, SUPABASE_* (never committed)
├── tailwind.config.ts            # Design tokens mapped to Tailwind
└── PROJECT_PLAN.md               # This document
```

### Folder responsibilities

| Folder | Responsibility | Key rule |
|---|---|---|
| `app/` | Routing, pages, server API routes | Pages compose components; API routes are the *only* place the provider key is used |
| `components/` | Presentation only | No data fetching, no business logic — props in, UI out |
| `services/` | All external I/O (stock API, Supabase) | Returns normalized internal types; hides every provider detail |
| `lib/valuation/` | **Pure** domain logic | No I/O, no React — fully unit-testable; the heart of the product |
| `utils/` | Stateless generic helpers | No domain knowledge |
| `types/` | Shared contracts | Single source of truth for shapes; everything imports from here |
| `db/` | Schema, policies, migrations as code | Version-controlled; the database is not configured by hand |

> **The critical separation:** `lib/valuation/` is **pure and I/O-free**. The engine takes a `StockData` object and returns a score + breakdown. This means it's trivially unit-testable, runs anywhere (client or server), and is decoupled from whichever API supplies the numbers. This is the single most important architectural decision for maintainability.

---

## 11. Development Roadmap

Built in deliberate phases. **Each phase ships something usable** before the next begins. Resist pulling later-phase features forward.

### Phase 1 — MVP · *Target: 1–2 days*

**Goal:** A working, deployable valuation tool. No accounts.

- [ ] Next.js + TS + Tailwind scaffold; design tokens in `tailwind.config.ts`
- [ ] Landing page with hero + search
- [ ] Server API route to FMP; normalizer → `StockData`
- [ ] Dashboard: company header, three metric groups, metric cards with tooltips
- [ ] Valuation engine (`lib/valuation/`) with thresholds, weights, verdict mapping
- [ ] Verdict card + expandable score breakdown
- [ ] Loading skeletons, error/empty states, mobile responsiveness, dark mode
- [ ] Deploy to Vercel

**Definition of done:** A stranger can type `AAPL` on the live URL and get a clear verdict in seconds, on mobile or desktop.

### Phase 2 — User Accounts

**Goal:** Make it sticky and personal.

- [ ] Supabase Auth (email + OAuth)
- [ ] `profiles`, `watchlists`, `watchlist_items`, `saved_analyses` tables + RLS
- [ ] Save an analysis; view saved analyses
- [ ] Watchlists with at-a-glance verdicts
- [ ] "Save" prompts for logged-out users (conversion hook)

### Phase 3 — Advanced Analysis

**Goal:** Make the verdict genuinely smart.

- [ ] **Sector-relative thresholds** (peer comparison) — the big accuracy upgrade
- [ ] Peer comparison view (this stock vs. its industry)
- [ ] Historical valuation tracking (score & ratios over time) with charts
- [ ] Refined, configurable scoring weights

### Phase 4 — AI Layer

**Goal:** Interpretation at depth, in natural language.

- [ ] AI-generated plain-English explanations of the score (built on Claude)
- [ ] AI stock summaries (business model, what drives the numbers)
- [ ] AI risk analysis (what could break the thesis)
- [ ] Personalized dashboards (per-user weights, layout, themes)

---

## 12. Launch Strategy

### MVP launch strategy

- **Launch the single most shareable moment:** the verdict card. Make `/stock/[ticker]` pages **public and SEO-friendly** with rich Open Graph images that render the ticker + verdict + score — so a shared link previews beautifully. This turns every analysis into an acquisition surface.
- **Ship free, no login wall.** Friction kills early funnels; the account prompt comes *after* the user has felt the value (Phase 2).
- **Soft launch** to a few investing communities for feedback before any broad push.

### Branding recommendations

- **Name:** ValueLens — already strong; "lens" reinforces the "clarity, not advice" positioning.
- **Logo:** a minimal lens/aperture mark in `brand` blue; wordmark in Inter semibold.
- **Voice:** calm, confident, plain-spoken. Never hypey, never "to the moon." The tone *is* the trust.
- **Tagline:** *"Type a ticker. Understand it in ten seconds."*

### Landing page structure

1. **Hero:** tagline + oversized search field (the product *is* the hero — let people try it immediately).
2. **Live example:** a sample verdict card (e.g., a well-known stock) so visitors see the payoff before searching.
3. **How it works:** three steps — search → metrics → verdict.
4. **What we measure:** the four categories, briefly — establishes credibility and transparency.
5. **Trust & honesty:** "Not financial advice. Fundamentals made clear." — the differentiator.
6. **CTA:** try a ticker now (and, Phase 2+, create a free account).

### User acquisition ideas

- **SEO on ticker pages** — long tail of "is [company] stock cheap" queries; the public dashboard pages capture them.
- **Shareable verdict cards** — designed-for-screenshot OG images for social.
- **Content/SEO:** short explainers ("What is a good P/E?") that funnel into the tool.
- **Communities:** investing subreddits/Discords/forums — lead with usefulness, not promotion.
- **Comparisons:** "ValueLens vs. reading a 10-K" framing for beginners.

### Future monetization opportunities

| Model | What's free | What's paid |
|---|---|---|
| **Freemium** (recommended) | Unlimited single-ticker analysis, basic watchlist | Sector-relative scoring, historical tracking, AI explanations, larger watchlists, alerts |
| **Pro subscription** | — | Power features bundle (the Phase 3/4 capabilities) |
| **API access** | — | Programmatic access to the valuation engine for power users/devs |

Keep the **core promise free forever** — it drives acquisition and trust. Monetize *depth and convenience* (history, AI, alerts, comparisons), never the basic verdict.

---

## 13. Guiding Principles & Constraints

These constraints govern every decision in this document and every PR that follows.

1. **Keep V1 small and realistic.** Five features, no accounts, one provider. Ship in 1–2 days.
2. **Avoid overengineering.** No microservices, no premature caching layers, no state management library the app doesn't need. FMP's precomputed ratios over building a statement-parsing engine.
3. **Prioritize learning.** The phased roadmap is designed so each phase teaches before the next: data fetching → auth/persistence → relative modeling → AI.
4. **Prioritize clean architecture.** Pure valuation logic isolated from I/O and UI; a provider-agnostic data layer; types as the single source of truth.
5. **Prioritize maintainability.** Provider swappable in one module. Thresholds and weights live in config, not scattered through code. Database as version-controlled SQL.
6. **Build only what the MVP needs.** Watchlists, history, comparisons, and AI are *roadmapped, not built* in V1.
7. **Every recommendation is justified.** FMP for its fundamentals fit; Inter for tabular precision; semantic-only color for at-a-glance reading; pure engine for testability; freemium to protect the free core. No choice in this plan is arbitrary.

> **Above all:** ValueLens is a *lens, not an advisor*. It makes public fundamentals legible. That honesty keeps the scope tight, the legal surface small, and the user's trust intact — and it's the foundation everything else is built on.

---

*End of PROJECT_PLAN.md*
