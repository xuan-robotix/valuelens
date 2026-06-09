-- ValueLens — usage tracking (Phase 4 / live-data quota meter)
-- Run this in the Supabase SQL editor AFTER schema.sql + policies.sql.
--
-- FMP's free tier exposes no usage endpoint, so we count the live data fetches
-- WE make. A per-key "fetch marker" with a TTL mirrors our 6h cache: a request
-- only counts when it would actually hit FMP (not when it's served from cache).

-- One row per cache key, holding when we last really fetched it.
create table if not exists public.app_fetch_marker (
  key        text primary key,
  fetched_at timestamptz not null default now()
);

-- Daily tally of FMP requests.
create table if not exists public.api_usage (
  day   date primary key,
  count int  not null default 0
);

-- These tables hold no user data and are reached only through the SECURITY
-- DEFINER functions below, so enable RLS with no policies (direct access denied).
alter table public.app_fetch_marker enable row level security;
alter table public.api_usage        enable row level security;

-- Returns true if this is a "fresh" fetch (marker missing or older than ttl),
-- and stamps the marker. Returns false when still within the cache window.
create or replace function public.mark_fetch(k text, ttl_seconds int)
returns boolean
language plpgsql security definer set search_path = public as $$
declare existing timestamptz;
begin
  select fetched_at into existing from public.app_fetch_marker where key = k;
  if existing is not null
     and existing > now() - make_interval(secs => ttl_seconds) then
    return false;
  end if;
  insert into public.app_fetch_marker (key, fetched_at)
  values (k, now())
  on conflict (key) do update set fetched_at = now();
  return true;
end; $$;

-- Atomically add n to today's count and return the new total.
create or replace function public.bump_api_usage(n int)
returns int
language plpgsql security definer set search_path = public as $$
declare total int;
begin
  insert into public.api_usage (day, count) values (current_date, n)
  on conflict (day) do update set count = public.api_usage.count + n
  returning count into total;
  return total;
end; $$;

-- Today's request count (0 if none yet).
create or replace function public.today_api_usage()
returns int
language sql security definer set search_path = public as $$
  select coalesce((select count from public.api_usage where day = current_date), 0);
$$;

grant execute on function public.mark_fetch(text, int)   to anon, authenticated;
grant execute on function public.bump_api_usage(int)     to anon, authenticated;
grant execute on function public.today_api_usage()       to anon, authenticated;
