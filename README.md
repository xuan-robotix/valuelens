# ValueLens

> Type a ticker. Understand it in ten seconds.

ValueLens turns a stock ticker into a clean valuation verdict — **cheap, fair, or
expensive** — based on fundamentals. It's a clarity layer over public data, not
financial advice. See [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) for the full blueprint.

**Phase 1 (MVP):** ticker search → metrics → valuation score → verdict. One data
provider, fully deployable, works with no keys.

**Phase 2 (accounts):** optional Supabase auth, watchlists, and saved analyses.
Entirely additive — with no Supabase config the app behaves exactly like Phase 1.

## Stack

- **Next.js 16** (App Router) · **TypeScript** · **Tailwind CSS v4**
- **Financial Modeling Prep** for fundamentals (with a bundled demo fallback)
- **Supabase** (Postgres + Auth) for accounts — optional
- Deploys to **Vercel**

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. It works immediately in **demo mode** (sample data
for `AAPL`, `MSFT`, `KO`, `NVDA`, `F`) with no API key.

### Live data (optional)

Get a free key at [financialmodelingprep.com](https://financialmodelingprep.com),
then:

```bash
cp .env.example .env.local
# set FMP_API_KEY=your_key in .env.local
```

The key is read **server-side only** (in `services/stockProvider.ts` and the
`/api/stock/[ticker]` route) and never reaches the browser.

## Architecture

```
app/                       Routes & pages
  page.tsx                 Landing (hero + search + live example)
  stock/[ticker]/          The valuation dashboard
  watchlist/ , saved/      Account pages (Phase 2)
  login/ , auth/callback/  Auth entry + OAuth/email callback
  actions/account.ts       Server actions: watchlist toggle, save, sign out
  api/stock/[ticker]/      Server-side data fetch (hides the API key)
components/
  ui/                      Primitives: Card, Button, Tooltip, Skeleton
  layout/                  Header, Footer, Logo, ThemeToggle, UserMenu
  search/                  SearchBar
  auth/                    AuthForm
  dashboard/               CompanyHeader, VerdictCard, MetricCard, MetricGroup,
                           ScoreBreakdown, VerdictBadge, SaveActions
lib/
  valuation/               Pure scoring engine (engine, thresholds, verdict)
  presentMetrics.ts        Fundamentals -> display metric groups
  verdictStyles.ts         Semantic verdict colors
services/
  stockProvider.ts         FMP provider + demo fallback
  normalize.ts , demoData  Response normalizer, bundled demo set
  supabase/                Browser/server clients, session proxy, queries, config
db/                        schema.sql, policies.sql, setup README
types/                     Provider-agnostic shared types (incl. db.ts)
utils/                     Formatting & class-name helpers
proxy.ts                   Refreshes the Supabase session per request
```

## Accounts (Phase 2)

Optional. With `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
unset, all auth UI stays hidden. To enable sign-in, watchlists, and saved
analyses, follow [`db/README.md`](./db/README.md): create a Supabase project,
run `db/schema.sql` then `db/policies.sql`, and set the two env vars.

Security model: every table has **Row Level Security** so users only ever access
their own rows. The anon key is public by design; RLS is what protects the data.
Server actions re-derive data server-side (e.g. re-scoring on save) rather than
trusting client-sent values.

The **valuation engine** (`lib/valuation/`) is pure and I/O-free — it takes
normalized `Fundamentals` and returns a score + breakdown, so it's trivially
testable and decoupled from whichever API supplies the numbers.

## The scoring model

Four weighted categories produce a 0–10 score:

| Category | Weight | Metrics |
|---|---|---|
| Valuation | 40% | P/E, P/B, P/S, EV/EBITDA |
| Growth | 25% | Revenue & earnings growth |
| Profitability | 25% | Net margin, ROE, ROA |
| Financial Health | 10% | Debt / equity |

| Score | Verdict |
|---|---|
| 0–3 | Expensive |
| 4–6 | Fairly Valued |
| 7–10 | Attractive Valuation |

Metrics that can't be computed (e.g. P/E for a loss-making company) are excluded
and disclosed. The full breakdown is shown in the dashboard.

## Not financial advice

ValueLens scores fundamentals only — it doesn't account for guidance,
management, moat, or macro conditions. It's a starting point for research.
