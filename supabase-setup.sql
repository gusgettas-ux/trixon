-- =====================================================================
-- Trixon — Supabase database setup
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- =====================================================================

-- 1. The single shared-state table.
--    Each row holds one piece of app data as JSON:
--    'bottles', 'recipes', 'queue'.
create table if not exists public.trixon_state (
  key  text primary key,
  data jsonb,
  updated_at timestamptz default now()
);

-- 2. Enable Row Level Security.
alter table public.trixon_state enable row level security;

-- 3. Policies.
--    This is a personal home-bar app: guests need to read the menu and
--    add their drink requests, and the admin reads/writes everything.
--    For simplicity we allow public read + write to this one table.
--    (The data here is just a cocktail menu and a drink queue — no
--    sensitive info. You can tighten this later if you wish.)

drop policy if exists "trixon read"  on public.trixon_state;
drop policy if exists "trixon write" on public.trixon_state;
drop policy if exists "trixon update" on public.trixon_state;

create policy "trixon read"
  on public.trixon_state for select
  using (true);

create policy "trixon write"
  on public.trixon_state for insert
  with check (true);

create policy "trixon update"
  on public.trixon_state for update
  using (true) with check (true);

-- 4. Turn on realtime for this table so every device updates live.
alter publication supabase_realtime add table public.trixon_state;
