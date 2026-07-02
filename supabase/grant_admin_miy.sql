-- grant_admin_miy.sql — "miy@fsbo.local" kullanıcısına admin yetkisi ver
-- Supabase Dashboard > SQL Editor'da çalıştır

-- ADIM 1: Mevcut durumu kontrol et
SELECT 
  'auth.users tablosu' as tablo,
  CASE WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'miy@fsbo.local')
    THEN 'MEVCUT' ELSE 'YOK'
  END as durum
UNION ALL
SELECT 
  'public.users tablosu',
  CASE WHEN EXISTS (SELECT 1 FROM public.users WHERE username = 'miy@fsbo.local')
    THEN 'MEVCUT' ELSE 'YOK'
  END;

-- ADIM 2: Auth kullanıcısını oluştur/güncelle (şifre: 123 123)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, confirmation_sent_at,
  raw_user_meta_data, raw_app_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'miy@fsbo.local',
  crypt('123 123', gen_salt('bf')),
  now(), now(), now(),
  '', now(),
  '{"username":"miy@fsbo.local","first_name":"Miy","last_name":"","name":"Miy","role":"admin","status":"aktif","profile_completed":true}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  false
)
ON CONFLICT (email) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = now(),
  updated_at = now(),
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- ADIM 3: Public users tablosunu oluştur/güncelle (admin rolü)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Auth tablosundan kullanıcının ID'sini al
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'miy@fsbo.local'
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'HATA: auth.users tablosunda "miy@fsbo.local" kullanıcısı bulunamadı.';
    RETURN;
  END IF;
  
  RAISE NOTICE 'auth.users bulundu: id=%', v_user_id;

  -- Public users tablosuna ekle/güncelle (admin rolü ile)
  INSERT INTO public.users (
    id, username, email, name, first_name, last_name,
    role, status, profile_completed
  ) VALUES (
    v_user_id,
    'miy@fsbo.local',
    'miy@fsbo.local',
    'Miy',
    'Miy',
    '',
    'admin',
    'aktif',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    username = 'miy@fsbo.local',
    email = 'miy@fsbo.local',
    name = 'Miy',
    first_name = 'Miy',
    role = 'admin',
    status = 'aktif',
    profile_completed = true,
    updated_at = now();
  
  RAISE NOTICE 'public.users tablosuna admin rolü ile eklendi.';
END $$;

-- ADIM 4: Abonelik oluştur (enterprise plan)
INSERT INTO public.subscriptions (user_id, plan_id, status)
SELECT id, 'enterprise', 'active'
FROM auth.users
WHERE email = 'miy@fsbo.local'
ON CONFLICT (user_id) DO NOTHING;

-- ADIM 5: Schema cache'i yenile
NOTIFY pgrst, 'reload schema';

-- ADIM 6: Son doğrulama
SELECT 
  'auth_users' as kaynak,
  id::text,
  email,
  raw_user_meta_data->>'role' as rol
FROM auth.users
WHERE email = 'miy@fsbo.local'
UNION ALL
SELECT 
  'public_users' as kaynak,
  id::text,
  email,
  role as rol
FROM public.users
WHERE username = 'miy@fsbo.local';
