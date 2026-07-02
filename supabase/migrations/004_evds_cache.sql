-- 004_evds_cache.sql — EVDS veri önbellekleme tablosu

create table if not exists public.evds_cache (
  series      text primary key,
  data        jsonb not null,
  fetched_at  timestamptz not null default now()
);

alter table public.evds_cache enable row level security;

create policy evds_cache_all on public.evds_cache
  for all using (true);
