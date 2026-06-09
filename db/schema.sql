-- ValueLens — database schema (Phase 2)
-- Run this in the Supabase SQL editor BEFORE policies.sql.
--
-- Tables: profiles, watchlists, watchlist_items, saved_analyses.
-- A trigger auto-creates a profile + a default watchlist for every new user.

-- ── profiles ─────────────────────────────────────────────────────────────
-- Extends Supabase's managed auth.users with app-level fields.
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text unique,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── watchlists ───────────────────────────────────────────────────────────
-- A user has one or more watchlists. The trigger creates a default one.
create table if not exists public.watchlists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null default 'My Watchlist',
  created_at timestamptz not null default now()
);
create index if not exists watchlists_user_id_idx on public.watchlists (user_id);

-- ── watchlist_items ──────────────────────────────────────────────────────
-- Tickers within a watchlist. Unique per (watchlist, ticker).
create table if not exists public.watchlist_items (
  id           uuid primary key default gen_random_uuid(),
  watchlist_id uuid not null references public.watchlists (id) on delete cascade,
  ticker       text not null,
  note         text,
  added_at     timestamptz not null default now(),
  unique (watchlist_id, ticker)
);
create index if not exists watchlist_items_watchlist_id_idx
  on public.watchlist_items (watchlist_id);

-- ── saved_analyses ───────────────────────────────────────────────────────
-- Point-in-time snapshots of a valuation. jsonb keeps the metric set flexible.
create table if not exists public.saved_analyses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  ticker          text not null,
  score           numeric(3, 1) not null,
  verdict         text not null,
  metrics         jsonb not null,
  score_breakdown jsonb not null,
  created_at      timestamptz not null default now()
);
create index if not exists saved_analyses_user_id_idx
  on public.saved_analyses (user_id, created_at desc);

-- ── new-user bootstrap ───────────────────────────────────────────────────
-- Create a profile + default watchlist whenever a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.watchlists (user_id, name)
  values (new.id, 'My Watchlist');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
