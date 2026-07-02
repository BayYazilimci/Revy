-- fix_login.sql — Giriş sorunu çözümü
-- Supabase SQL Editor'da çalıştır

-- ADIM 1: get_email_by_username fonksiyonunu garantiye al (her iki tabloya bakar)
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

-- ADIM 2: "asdasd" kullanıcısının her iki tabloda durumunu kontrol et
-- Bu sorgunun sonucunu bana gönderin
SELECT 
  'auth.users' as tablo, id, email, created_at 
FROM auth.users 
WHERE raw_user_meta_data->>'username' = 'asdasd'
   OR email = 'asdasd@example.com'
UNION ALL
SELECT 
  'public.users' as tablo, id, username || ' (' || email || ')' as email, created_at 
FROM public.users 
WHERE username = 'asdasd';

-- ADIM 3: Eğer auth.users'ta YOKSA, bu bloğu çalıştırın
-- (Aşağıdaki id ve email değerlerini 2. adımdaki sonuca göre değiştirin)
--
-- Mevcut public.users kaydını al
DO $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user RECORD;
BEGIN
  -- public.users'tan "asdasd" kullanıcısını bul
  SELECT id, email INTO v_user_id, v_user_email
  FROM public.users 
  WHERE username = 'asdasd'
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'HATA: public.users tablosunda "asdasd" kullanıcısı bulunamadı.';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Bulundu: id=%, email=%', v_user_id, v_user_email;
  
  -- auth.users'ta var mı kontrol et
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
    RAISE NOTICE 'auth.users tablosunda yok, ekleniyor...';
    
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      confirmation_token, confirmation_sent_at,
      raw_user_meta_data, raw_app_meta_data, is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_user_email,
      crypt('asdasd', gen_salt('bf')),
      now(), now(), now(),
      '', now(),
      '{"username":"asdasd","first_name":"","last_name":"","name":"asdasd","role":"user","status":"aktif","profile_completed":false}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,
      false
    )
    ON CONFLICT (id) DO UPDATE SET
      encrypted_password = excluded.encrypted_password,
      email_confirmed_at = now(),
      updated_at = now(),
      raw_user_meta_data = excluded.raw_user_meta_data;
    
    RAISE NOTICE 'auth.users tablosuna eklendi. Artık giriş yapabilirsiniz.';
  ELSE
    RAISE NOTICE 'auth.users tablosunda zaten mevcut.';
    
    -- Şifreyi sıfırla (şifreyi bilmiyorsanız)
    UPDATE auth.users 
    SET encrypted_password = crypt('asdasd', gen_salt('bf')),
        updated_at = now()
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Şifre "asdasd" olarak sıfırlandı.';
  END IF;
END $$;

-- ADIM 3.5: get_email_by_username fonksiyonunu garantiye al
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.users WHERE username = p_username LIMIT 1;
$$;

-- ADIM 4: RLS politikasını garantiye al
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_select ON public.users;
CREATE POLICY users_select ON public.users
  FOR SELECT USING (true);

-- Schema cache'i yenile
NOTIFY pgrst, 'reload schema';

-- ADIM 5: Son doğrulama
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE raw_user_meta_data->>'username' = 'asdasd')
    THEN 'OK: auth.users tablosunda mevcut'
    ELSE 'HATA: auth.users tablosunda yok'
  END as auth_durum,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.users WHERE username = 'asdasd')
    THEN 'OK: public.users tablosunda mevcut'
    ELSE 'HATA: public.users tablosunda yok'
  END as public_durum;
