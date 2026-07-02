-- fix_admin_miy.sql — "miy" hesabına admin rolü ver
-- Supabase Dashboard > SQL Editor'da çalıştır
-- Ardından uygulamadan çıkış yapıp tekrar giriş yapın

-- ADIM 1: Mevcut durumu kontrol et
SELECT id, username, email, role FROM public.users WHERE username = 'miy' OR email ILIKE 'miy%';

-- ADIM 2: public.users tablosunda role'ü admin yap
UPDATE public.users
SET role = 'admin', updated_at = now()
WHERE username = 'miy' OR email ILIKE 'miy%';

-- ADIM 3: auth.users tablosunda user_metadata'daki role'ü admin yap
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'::jsonb,
    updated_at = now()
WHERE email ILIKE 'miy%';

-- ADIM 4: Sonucu doğrula
SELECT 
  'public_users' as tablo, id::text, username, email, role
FROM public.users WHERE username = 'miy' OR email ILIKE 'miy%'
UNION ALL
SELECT 
  'auth_users' as tablo, id::text, email as username, email, raw_user_meta_data->>'role' as role
FROM auth.users WHERE email ILIKE 'miy%';
