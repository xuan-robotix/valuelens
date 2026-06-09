-- ValueLens — Row Level Security policies (Phase 2)
-- Run this AFTER schema.sql.
--
-- Principle: every row is private to its owner. A user can only ever read or
-- write rows that belong to them (directly via user_id, or via watchlist
-- ownership for watchlist_items).

-- Enable RLS on every table.
alter table public.profiles        enable row level security;
alter table public.watchlists      enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.saved_analyses  enable row level security;

-- ── profiles ─────────────────────────────────────────────────────────────
-- Inserts are handled by the security-definer trigger, so we only expose
-- select/update of your own row.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ── watchlists ───────────────────────────────────────────────────────────
drop policy if exists watchlists_all_own on public.watchlists;
create policy watchlists_all_own on public.watchlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── watchlist_items (ownership flows through the parent watchlist) ─────────
drop policy if exists watchlist_items_select_own on public.watchlist_items;
create policy watchlist_items_select_own on public.watchlist_items
  for select using (
    exists (
      select 1 from public.watchlists w
      where w.id = watchlist_id and w.user_id = auth.uid()
    )
  );

drop policy if exists watchlist_items_modify_own on public.watchlist_items;
create policy watchlist_items_modify_own on public.watchlist_items
  for all using (
    exists (
      select 1 from public.watchlists w
      where w.id = watchlist_id and w.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.watchlists w
      where w.id = watchlist_id and w.user_id = auth.uid()
    )
  );

-- ── saved_analyses ───────────────────────────────────────────────────────
drop policy if exists saved_analyses_all_own on public.saved_analyses;
create policy saved_analyses_all_own on public.saved_analyses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
