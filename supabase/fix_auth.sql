-- ============================================================
-- FIX: Auth + Users tablosu sorunlarını çözer
-- Supabase SQL Editor'da tek seferde çalıştır
-- ============================================================

-- 1) Trigger'ı geçici olarak kaldır (auth insert'ini engellemesin)
drop trigger if exists on_auth_user_created on auth.users;

-- 2) Auth users tablosunu temizle (mevcut admin kayıtlarını sil)
delete from auth.users where email = 'admin@fsbo.app';

-- 3) Public users tablosunu temizle
delete from public.users where email = 'admin@fsbo.app';

-- 4) Schema cache'i yenile
NOTIFY pgrst, 'reload schema';

-- 5) Admin auth kullanıcısını temiz ekle (trigger olmadan)
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
)
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = now(),
  updated_at = now(),
  raw_user_meta_data = excluded.raw_user_meta_data;

-- 6) Public users tablosunu kontrol et, yoksa oluştur
create table if not exists public.users (
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

-- 7) Public users'a admin ekle
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
  profile_completed = true;

-- 8) Abonelik
insert into public.subscriptions (user_id, plan_id, status)
values ('00000000-0000-0000-0000-000000000001', 'enterprise', 'active')
on conflict (user_id) do nothing;

-- 9) RLS politikalarını düzelt
alter table public.users enable row level security;

drop policy if exists users_select on public.users;
drop policy if exists users_insert on public.users;
drop policy if exists users_update on public.users;
drop policy if exists users_delete on public.users;

create policy users_select on public.users for select using (true);
create policy users_insert on public.users for insert with check (id = auth.uid());
create policy users_update on public.users for update using (id = auth.uid() or auth.jwt()->>'role' = 'admin');
create policy users_delete on public.users for delete using (id = auth.uid() or auth.jwt()->>'role' = 'admin');

-- 10) Username lookup fonksiyonu (RLS bypass eder, her iki tabloya bakar)
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

-- 11) Trigger'ı geri kur
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

-- 12) Schema cache'i tekrar yenile
NOTIFY pgrst, 'reload schema';

-- 13) DOĞRULAMA
select 'auth_user' as source, id, email from auth.users where email = 'admin@fsbo.app'
union all
select 'public_user' as source, id, email from public.users where email = 'admin@fsbo.app';
