-- 005_auth_trigger.sql
-- auth.users'a yeni kullanıcı eklendiğinde otomatik olarak
-- public.users tablosuna kayıt oluşturur.
-- Supabase SQL Editor'da çalıştır.

-- 1) public.users tablosu (yoksa oluştur)
create table if not exists public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
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

-- 2) Eksik sütunları ekle (tablo zaten varsa)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'first_name') then
    alter table public.users add column first_name text not null default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'last_name') then
    alter table public.users add column last_name text not null default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'avatar') then
    alter table public.users add column avatar text default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'phone') then
    alter table public.users add column phone text default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'profile') then
    alter table public.users add column profile jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'ban_reason') then
    alter table public.users add column ban_reason text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'city') then
    alter table public.users add column city text default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'last_ip') then
    alter table public.users add column last_ip text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'device') then
    alter table public.users add column device text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'last_seen_at') then
    alter table public.users add column last_seen_at timestamptz;
  end if;
end $$;

-- 3) Trigger fonksiyonu: auth.users'a insert olduğunda public.users'a yaz
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

-- 4) Trigger'ı auth.users'a bağla
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) RLS politikaları (yoksa oluştur)
alter table public.users enable row level security;

do $$
begin
  -- SELECT (username lookup için herkesin okumasına izin ver)
  DROP POLICY IF EXISTS users_select ON public.users;
  create policy users_select on public.users
    for select using (true);
  -- INSERT (trigger via service role bypass eder, ama user insert de izin ver)
  if not exists (select 1 from pg_policies where policyname = 'users_insert' and tablename = 'users' and schemaname = 'public') then
    create policy users_insert on public.users
      for insert with check (id = auth.uid());
  end if;
  -- UPDATE
  if not exists (select 1 from pg_policies where policyname = 'users_update' and tablename = 'users' and schemaname = 'public') then
    create policy users_update on public.users
      for update using (id = auth.uid() or auth.jwt()->>'role' = 'admin');
  end if;
  -- DELETE
  if not exists (select 1 from pg_policies where policyname = 'users_delete' and tablename = 'users' and schemaname = 'public') then
    create policy users_delete on public.users
      for delete using (id = auth.uid() or auth.jwt()->>'role' = 'admin');
  end if;
end $$;

-- 6) updated_at tetikleyicisi
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.users;
create trigger set_updated_at
  before update on public.users
  for each row execute function public.update_updated_at();
