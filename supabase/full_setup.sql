-- ============================================================
-- SIFIRDAN TAM KURULUM
-- Mevcut her şeyi siler, temiz başlangıç yapar
-- Supabase SQL Editor'da tek seferde çalıştır
-- ============================================================

-- ============================================================
-- 0) MEVCUT HER ŞEYİ SİL
-- ============================================================
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists set_updated_at on public.users;
drop function if exists public.handle_new_user();
drop function if exists public.update_updated_at();

drop table if exists public.customer_listings cascade;
drop table if exists public.list_items cascade;
drop table if exists public.appointments cascade;
drop table if exists public.daily_entries cascade;
drop table if exists public.notifications cascade;
drop table if exists public.invoices cascade;
drop table if exists public.subscriptions cascade;
drop table if exists public.lists cascade;
drop table if exists public.customers cascade;
drop table if exists public.properties cascade;
drop table if exists public.users cascade;

-- auth kullanıcısını sil (varsa)
delete from auth.users where email = 'admin@fsbo.app';

-- ============================================================
-- 1) EKLENTİLER
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- 2) TABLOLAR
-- ============================================================

create table public.users (
  id              uuid primary key,
  username        text unique not null,
  email           text unique not null,
  name            text not null default '',
  first_name      text not null default '',
  last_name       text not null default '',
  avatar          text default '',
  phone           text default '',
  role            text not null default 'user',
  status          text not null default 'aktif',
  ban_reason      text,
  city            text default '',
  last_ip         text,
  device          text,
  profile_completed boolean not null default false,
  profile         jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  last_seen_at    timestamptz
);

create table public.subscriptions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade unique,
  plan_id       text not null default 'free',
  status        text not null default 'active',
  since         timestamptz not null default now(),
  renews_at     timestamptz,
  updated_at    timestamptz not null default now()
);

create table public.invoices (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  date          timestamptz not null default now(),
  plan          text not null,
  amount        int not null,
  currency      text not null default 'TRY',
  status        text not null default 'paid',
  pdf_url       text
);

create table public.properties (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid not null references public.users(id) on delete cascade,
  title         text not null,
  description   text,
  location      text,
  city          text,
  price_text    text,
  price         int,
  size_text     text,
  size          int,
  rooms         text,
  floor         text,
  age           text,
  img           text,
  badge         text,
  status        text not null default 'Aktif',
  time_text     text,
  lat           float8,
  lng           float8,
  type          text,
  subtype       text,
  list_order    int,
  is_daily      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.lists (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  name          text not null,
  color         text,
  icon          text,
  created_at    timestamptz not null default now()
);

create table public.list_items (
  id            uuid primary key default uuid_generate_v4(),
  list_id       uuid not null references public.lists(id) on delete cascade,
  property_id   uuid not null references public.properties(id) on delete cascade,
  added_at      timestamptz not null default now(),
  unique(list_id, property_id)
);

create table public.customers (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid not null references public.users(id) on delete cascade,
  name          text not null,
  email         text,
  phone         text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.customer_listings (
  id            uuid primary key default uuid_generate_v4(),
  customer_id   uuid not null references public.customers(id) on delete cascade,
  property_id   uuid not null references public.properties(id) on delete cascade,
  relation      text,
  created_at    timestamptz not null default now(),
  unique(customer_id, property_id)
);

create table public.appointments (
  id              uuid primary key default uuid_generate_v4(),
  owner_id        uuid not null references public.users(id) on delete cascade,
  title           text not null,
  date            text not null,
  time            text not null,
  duration        int not null default 60,
  attendee_id     uuid references public.customers(id) on delete set null,
  attendee_name   text,
  listing_id      uuid references public.properties(id) on delete set null,
  listing_title   text,
  location        text,
  description     text,
  status          text not null default 'bekliyor',
  created_at      timestamptz not null default now()
);

create table public.daily_entries (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  date          text not null,
  content       text not null,
  type          text,
  created_at    timestamptz not null default now()
);

create table public.notifications (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  type          text not null default 'system',
  title         text not null,
  description   text,
  read          boolean not null default false,
  created_at    timestamptz not null default now()
);

-- indexes
create index idx_properties_owner_id on public.properties(owner_id);
create index idx_properties_type on public.properties(type);
create index idx_properties_city on public.properties(city);
create index idx_lists_user_id on public.lists(user_id);
create index idx_customers_owner_id on public.customers(owner_id);
create index idx_appointments_owner_id on public.appointments(owner_id);
create index idx_daily_entries_user_id on public.daily_entries(user_id);
create index idx_notifications_user_id on public.notifications(user_id);

-- ============================================================
-- 3) AUTH TRIGGER
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (
    id, username, email, name, first_name, last_name,
    avatar, phone, role, status, profile_completed, profile
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'name',
      trim(coalesce(new.raw_user_meta_data ->> 'first_name', '') || ' ' || coalesce(new.raw_user_meta_data ->> 'last_name', '')),
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'avatar', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'user'),
    coalesce(new.raw_user_meta_data ->> 'status', 'aktif'),
    coalesce((new.raw_user_meta_data ->> 'profile_completed')::boolean, false),
    case when new.raw_user_meta_data ? 'profile'
      then new.raw_user_meta_data -> 'profile'
      else null
    end
  )
  on conflict (id) do update set
    username    = excluded.username,
    email       = excluded.email,
    name        = excluded.name,
    first_name  = excluded.first_name,
    last_name   = excluded.last_name,
    avatar      = excluded.avatar,
    phone       = excluded.phone,
    role        = excluded.role,
    status      = excluded.status,
    updated_at  = now();
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.users
  for each row execute function public.update_updated_at();

-- ============================================================
-- 4) RLS
-- ============================================================

alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.properties enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.customers enable row level security;
alter table public.customer_listings enable row level security;
alter table public.appointments enable row level security;
alter table public.daily_entries enable row level security;
alter table public.notifications enable row level security;

create policy users_select on public.users for select using (true);
create policy users_insert on public.users for insert with check (id = auth.uid());
create policy users_update on public.users for update using (id = auth.uid() or auth.jwt()->>'role' = 'admin');
create policy users_delete on public.users for delete using (id = auth.uid() or auth.jwt()->>'role' = 'admin');

create policy subscriptions_select on public.subscriptions for select using (user_id = auth.uid() or auth.jwt()->>'role' = 'admin');
create policy subscriptions_insert on public.subscriptions for insert with check (user_id = auth.uid());
create policy subscriptions_update on public.subscriptions for update using (user_id = auth.uid() or auth.jwt()->>'role' = 'admin');
create policy subscriptions_delete on public.subscriptions for delete using (user_id = auth.uid() or auth.jwt()->>'role' = 'admin');

create policy invoices_select on public.invoices for select using (user_id = auth.uid() or auth.jwt()->>'role' = 'admin');
create policy invoices_insert on public.invoices for insert with check (user_id = auth.uid());
create policy invoices_update on public.invoices for update using (user_id = auth.uid() or auth.jwt()->>'role' = 'admin');
create policy invoices_delete on public.invoices for delete using (user_id = auth.uid() or auth.jwt()->>'role' = 'admin');

create policy properties_select on public.properties for select using (true);
create policy properties_insert on public.properties for insert with check (owner_id = auth.uid());
create policy properties_update on public.properties for update using (owner_id = auth.uid() or auth.jwt()->>'role' = 'admin');
create policy properties_delete on public.properties for delete using (owner_id = auth.uid() or auth.jwt()->>'role' = 'admin');

create policy lists_owner on public.lists for all using (user_id = auth.uid());
create policy list_items_owner on public.list_items for all using (
  exists (select 1 from public.lists where id = list_id and user_id = auth.uid())
);
create policy customers_owner on public.customers for all using (owner_id = auth.uid());
create policy customer_listings_owner on public.customer_listings for all using (
  exists (select 1 from public.customers where id = customer_id and owner_id = auth.uid())
);
create policy appointments_owner on public.appointments for all using (owner_id = auth.uid());
create policy daily_owner on public.daily_entries for all using (user_id = auth.uid());
create policy notifications_owner on public.notifications for all using (user_id = auth.uid());

-- ============================================================
-- 4b) USERNAME LOOKUP FONKSİYONU (her iki tabloya bakar)
-- ============================================================
DROP FUNCTION IF EXISTS public.get_email_by_username(text);

create or replace function public.get_email_by_username(p_username text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
DECLARE
  v_email text;
BEGIN
  -- 1) Önce public.users tablosunda ara
  SELECT email INTO v_email
  FROM public.users
  WHERE username = p_username
  LIMIT 1;

  IF v_email IS NOT NULL THEN
    RETURN v_email;
  END IF;

  -- 2) Bulamazsan auth.users tablosunda raw_user_meta_data'dan ara
  SELECT email INTO v_email
  FROM auth.users
  WHERE raw_user_meta_data ->> 'username' = p_username
  LIMIT 1;

  IF v_email IS NOT NULL THEN
    -- public.users'a senkronize et (tetikleyici çalışmadıysa düzelt)
    INSERT INTO public.users (
      id, username, email, name, first_name, last_name,
      role, status, profile_completed
    )
    SELECT
      id,
      coalesce(raw_user_meta_data ->> 'username', split_part(email, '@', 1)),
      email,
      coalesce(
        raw_user_meta_data ->> 'name',
        trim(coalesce(raw_user_meta_data ->> 'first_name', '') || ' ' || coalesce(raw_user_meta_data ->> 'last_name', '')),
        split_part(email, '@', 1)
      ),
      coalesce(raw_user_meta_data ->> 'first_name', ''),
      coalesce(raw_user_meta_data ->> 'last_name', ''),
      coalesce(raw_user_meta_data ->> 'role', 'user'),
      coalesce(raw_user_meta_data ->> 'status', 'aktif'),
      coalesce((raw_user_meta_data ->> 'profile_completed')::boolean, false)
    FROM auth.users
    WHERE auth.users.id = (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data ->> 'username' = p_username
      LIMIT 1
    )
    ON CONFLICT (id) DO UPDATE SET
      username = excluded.username,
      email = excluded.email,
      updated_at = now();

    RETURN v_email;
  END IF;

  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO service_role;

-- ============================================================
-- 5) ADMIN KULLANICISI
-- ÖNEMLİ: auth.users'a INSERT trigger'ı tetikler → public.users'a otomatik yazar
-- ============================================================

-- auth.users'a ekle
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, confirmation_sent_at,
  raw_user_meta_data, raw_app_meta_data, is_super_admin
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@fsbo.app',
  crypt('admin123', gen_salt('bf')),
  now(), now(), now(),
  '', now(),
  '{"username":"admin","first_name":"Admin","last_name":"User","name":"Admin User","role":"admin","status":"aktif","profile_completed":true}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  false
);

-- trigger tetiklenmediyse manuel ekle (güvenlik için)
insert into public.users (
  id, username, email, name, first_name, last_name,
  role, status, profile_completed
) values (
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'admin@fsbo.app',
  'Admin User',
  'Admin',
  'User',
  'admin',
  'aktif',
  true
)
on conflict (id) do update set
  username = excluded.username,
  email = excluded.email,
  name = excluded.name,
  role = 'admin',
  status = 'aktif',
  profile_completed = true;

-- abonelik
insert into public.subscriptions (user_id, plan_id, status)
values ('00000000-0000-0000-0000-000000000001', 'enterprise', 'active')
on conflict (user_id) do nothing;

-- ============================================================
-- DOĞRULAMA
-- auth kullanıcısı var mı?
select id, email, raw_user_meta_data->>'role' as role from auth.users where email = 'admin@fsbo.app';
-- public kullanıcısı var mı?
select id, username, email, role, profile_completed from public.users where id = '00000000-0000-0000-0000-000000000001';

-- Schema cache'i yenile
NOTIFY pgrst, 'reload schema';
