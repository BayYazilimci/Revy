-- grant_admin.sql — "test123" hesabına admin rolü ver
-- Supabase Dashboard > SQL Editor'da çalıştır

-- Önce kullanıcının var olup olmadığını kontrol et
SELECT id, username, name, email, role FROM public.users WHERE username = 'test123';

-- Kullanıcıya admin rolü ver
UPDATE public.users
SET role = 'admin', updated_at = now()
WHERE username = 'test123';

-- Sonucu doğrula
SELECT id, username, name, email, role FROM public.users WHERE username = 'test123';
