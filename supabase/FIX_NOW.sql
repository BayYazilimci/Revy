-- FIX_NOW.sql — Kullanic kayit/giris sorunu cozumu
-- Supabase Dashboard > SQL Editor > New query > Yapistir > Run

-- 1) users tablosunu garantiye al
CREATE TABLE IF NOT EXISTS public.users (
  id              uuid primary key REFERENCES auth.users(id) ON DELETE CASCADE,
  username        text unique NOT NULL,
  email           text unique NOT NULL,
  name            text NOT NULL DEFAULT '',
  first_name      text DEFAULT '',
  last_name       text DEFAULT '',
  avatar          text DEFAULT '',
  phone           text DEFAULT '',
  role            text NOT NULL DEFAULT 'user',
  status          text NOT NULL DEFAULT 'aktif',
  ban_reason      text,
  city            text DEFAULT '',
  last_ip         text,
  device          text,
  profile_completed boolean NOT NULL DEFAULT false,
  profile         jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  last_seen_at    timestamptz
);

-- 2) RLS: herkesin users tablosunu okuyabilmesi
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_select ON public.users;
CREATE POLICY users_select ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS users_insert ON public.users;
CREATE POLICY users_insert ON public.users FOR INSERT WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS users_update ON public.users;
CREATE POLICY users_update ON public.users FOR UPDATE USING (id = auth.uid() OR auth.jwt()->>'role' = 'admin');
DROP POLICY IF EXISTS users_delete ON public.users;
CREATE POLICY users_delete ON public.users FOR DELETE USING (id = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- 3) Username lookup fonksiyonu (RLS bypass + auth.users fallback)
DROP FUNCTION IF EXISTS public.get_email_by_username(text);

CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email
  FROM public.users
  WHERE username = p_username
  LIMIT 1;

  IF v_email IS NOT NULL THEN
    RETURN v_email;
  END IF;

  SELECT email INTO v_email
  FROM auth.users
  WHERE raw_user_meta_data ->> 'username' = p_username
  LIMIT 1;

  IF v_email IS NOT NULL THEN
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

-- 4) Trigger: auth.users'a yeni kullanici eklendiginde public.users'a yaz
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id, username, email, name, first_name, last_name,
    avatar, phone, role, status, profile_completed, profile
  ) VALUES (
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
  ON CONFLICT (id) DO UPDATE SET
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
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5) Schema cache yenile
NOTIFY pgrst, 'reload schema';

-- 6) DOGRULAMA: auth.users'ta kayitli ama public.users'ta olmayan kullanici var mi?
SELECT
  a.id,
  a.email,
  a.raw_user_meta_data ->> 'username' AS username,
  CASE WHEN p.id IS NULL THEN 'Eksik - trigger duzeltildi, giris yaparak senkronize edebilirsin'
       ELSE 'OK' END AS public_users_durum
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
WHERE a.raw_user_meta_data ->> 'username' IS NOT NULL;
