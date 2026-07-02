-- fix_login_miy.sql — "miy" kullanıcısı için giriş sorunu çözümü
-- Supabase SQL Editor'da çalıştır

-- ADIM 0: Mevcut durumu göster
SELECT 
  'auth.users'ta miy var mı?' as soru,
  CASE WHEN EXISTS (SELECT 1 FROM auth.users WHERE raw_user_meta_data->>'username' = 'miy')
    THEN 'EVET' ELSE 'HAYIR'
  END as cevap
UNION ALL
SELECT 
  'public.users'ta miy var mı?',
  CASE WHEN EXISTS (SELECT 1 FROM public.users WHERE username = 'miy')
    THEN 'EVET' ELSE 'HAYIR'
  END
UNION ALL
SELECT 
  'get_email_by_username fonksiyonu var mı?',
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_email_by_username')
    THEN 'EVET' ELSE 'HAYIR'
  END
UNION ALL
SELECT 
  'on_auth_user_created trigger var mı?',
  CASE WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created')
    THEN 'EVET' ELSE 'HAYIR'
  END
UNION ALL
SELECT 
  'users_select policy var mı?',
  CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_select' AND tablename = 'users' AND schemaname = 'public')
    THEN 'EVET' ELSE 'HAYIR'
  END;

-- ADIM 1: Trigger fonksiyonunu garantiye al
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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
    updated_at  = now();
  RETURN new;
END;
$$;

-- ADIM 2: Trigger'ı bağla
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ADIM 3: get_email_by_username fonksiyonunu garantiye al
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

-- ADIM 4: RLS politikalarını garantiye al
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select ON public.users;
CREATE POLICY users_select ON public.users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS users_insert ON public.users;
CREATE POLICY users_insert ON public.users
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS users_update ON public.users;
CREATE POLICY users_update ON public.users
  FOR UPDATE USING (id = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- ADIM 5: "miy" kullanıcısını her iki tabloda da garantiye al
DO $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  SELECT id, email INTO v_user_id, v_user_email
  FROM auth.users
  WHERE raw_user_meta_data ->> 'username' = 'miy'
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'HATA: auth.users tablosunda "miy" kullanıcısı bulunamadı.';
    RETURN;
  END IF;
  
  RAISE NOTICE 'auth.users bulundu: id=%, email=%', v_user_id, v_user_email;

  INSERT INTO public.users (
    id, username, email, name, first_name, last_name,
    role, status, profile_completed
  ) VALUES (
    v_user_id,
    'miy',
    v_user_email,
    coalesce(v_user_email, 'miy'),
    '', '',
    'user',
    'aktif',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    username = 'miy',
    email = v_user_email,
    updated_at = now();
  
  RAISE NOTICE 'public.users tablosuna senkronize edildi.';
  
  UPDATE auth.users 
  SET encrypted_password = crypt('123', gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now()
  WHERE id = v_user_id;
  
  RAISE NOTICE 'Sifre "123" olarak ayarlandi.';
END $$;

-- ADIM 6: Schema cache'i yenile
NOTIFY pgrst, 'reload schema';

-- ADIM 7: Son doğrulama
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE raw_user_meta_data->>'username' = 'miy')
    THEN 'OK: auth.users tablosunda mevcut'
    ELSE 'HATA: auth.users tablosunda yok'
  END as auth_durum,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.users WHERE username = 'miy')
    THEN 'OK: public.users tablosunda mevcut'
    ELSE 'HATA: public.users tablosunda yok'
  END as public_durum,
  (SELECT email FROM public.users WHERE username = 'miy') as bulunan_email;
