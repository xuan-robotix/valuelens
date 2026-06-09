# ValueLens — Database setup (Phase 2)

Accounts, watchlists, and saved analyses run on **Supabase**. The app works
fine without any of this (auth UI just stays hidden) — follow these steps to
turn it on.

## 1. Create a Supabase project

Sign up at [supabase.com](https://supabase.com) and create a new project. Pick a
strong database password and a region near your users.

## 2. Run the schema

In the Supabase dashboard, open **SQL Editor → New query** and run, in order:

1. Paste the contents of [`schema.sql`](./schema.sql) → **Run**
2. Paste the contents of [`policies.sql`](./policies.sql) → **Run**

`schema.sql` creates the four tables (`profiles`, `watchlists`,
`watchlist_items`, `saved_analyses`) plus a trigger that auto-creates a profile
and a default watchlist for every new user. `policies.sql` enables Row Level
Security so each user can only ever see their own rows.

## 3. Wire up environment variables

In **Project Settings → API**, copy the **Project URL** and the **anon public**
key into your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Restart `npm run dev`. The header will now show **Sign in**, and stock pages
gain **Add to watchlist** / **Save analysis** controls.

## 4. (Optional) Configure auth providers

- **Email/password** works out of the box. During development you may want to
  disable email confirmation: **Authentication → Providers → Email →** turn off
  *Confirm email* for instant sign-in.
- **Google** sign-in: enable it under **Authentication → Providers → Google**
  and add your OAuth credentials. The callback URL is
  `https://YOUR-PROJECT.supabase.co/auth/v1/callback`.

## 5. Redirect URLs (for OAuth / email confirmation)

Under **Authentication → URL Configuration**, add your site URL(s) to the
allowed redirect list, e.g.:

- `http://localhost:3000/auth/callback`
- `https://your-domain.vercel.app/auth/callback`

## How it maps to the code

| Concern | File |
|---|---|
| Config guard (is auth on?) | `services/supabase/config.ts` |
| Browser client | `services/supabase/client.ts` |
| Server client + current user | `services/supabase/server.ts` |
| Session refresh | `services/supabase/middleware.ts` + `middleware.ts` |
| Queries (watchlist, saved) | `services/supabase/queries.ts` |
| Server actions (toggle/save/sign-out) | `app/actions/account.ts` |
| Row types + `Database` type | `types/db.ts` |
