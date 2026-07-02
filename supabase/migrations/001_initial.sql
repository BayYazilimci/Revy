-- 001_initial.sql — Revy / FSBO App tabloları
-- Supabase SQL Editor'da çalıştır veya `supabase db push` ile yükle

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- users (Supabase Auth.users ile senkronize)
create table public.users (
  id            uuid primary key default uuid_generate_v4(),
  username      text unique not null,
  email         text unique not null,
  name          text not null,
  first_name    text not null,
  last_name     text not null,
  avatar        text,
  phone         text,
  role          text not null default 'user',
  status        text not null default 'aktif',
  ban_reason    text,
  city          text,
  last_ip       text,
  device        text,
  profile_completed boolean not null default false,
  profile       jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  last_seen_at  timestamptz
);

-- subscriptions
create table public.subscriptions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade unique,
  plan_id       text not null default 'free',
  status        text not null default 'active',
  since         timestamptz not null default now(),
  renews_at     timestamptz,
  updated_at    timestamptz not null default now()
);

-- invoices
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

-- properties
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

-- lists
create table public.lists (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  name          text not null,
  color         text,
  icon          text,
  created_at    timestamptz not null default now()
);

-- list_items
create table public.list_items (
  id            uuid primary key default uuid_generate_v4(),
  list_id       uuid not null references public.lists(id) on delete cascade,
  property_id   uuid not null references public.properties(id) on delete cascade,
  added_at      timestamptz not null default now(),
  unique(list_id, property_id)
);

-- customers
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

-- customer_listings
create table public.customer_listings (
  id            uuid primary key default uuid_generate_v4(),
  customer_id   uuid not null references public.customers(id) on delete cascade,
  property_id   uuid not null references public.properties(id) on delete cascade,
  relation      text,
  created_at    timestamptz not null default now(),
  unique(customer_id, property_id)
);

-- appointments
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

-- daily_entries
create table public.daily_entries (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  date          text not null,
  content       text not null,
  type          text,
  created_at    timestamptz not null default now()
);

-- notifications
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
