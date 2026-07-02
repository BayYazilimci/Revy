-- 009_required_registration_fields.sql
-- Kayıt alanlarını zorunlu hale getir

-- Mevcut boş değerleri varsayılan değerlerle doldur
UPDATE public.users SET first_name = 'Belirtilmemiş' WHERE first_name IS NULL OR first_name = '';
UPDATE public.users SET last_name = 'Belirtilmemiş' WHERE last_name IS NULL OR last_name = '';

-- first_name ve last_name alanlarını NOT NULL yap
ALTER TABLE public.users ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE public.users ALTER COLUMN last_name SET NOT NULL;