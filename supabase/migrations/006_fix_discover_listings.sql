-- 006_fix_discover_listings.sql
-- Mevcut ilanların type, img ve description alanlarını düzelt
-- Supabase Dashboard > SQL Editor > Run

-- 1) Tüm ilanlara type ata (başlığa göre)
UPDATE public.properties
SET type = CASE
  WHEN title ILIKE '%satılık%' OR title ILIKE '%satlik%' THEN 'Satılık'
  WHEN title ILIKE '%kiralık%' OR title ILIKE '%kiralik%' THEN 'Kiralık'
  WHEN title ILIKE '%günlük%' THEN 'Günlük Kira'
  ELSE 'Kiralık'
END
WHERE type IS NULL OR type = '';

-- 2) Tüm ilanlara placeholder img ata (hiç img'si olmayanlara)
UPDATE public.properties
SET img = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop'
WHERE img IS NULL OR img = '';

-- 3) description alanı URL olanları düzelt (emlakjet URL'lerini temizle)
UPDATE public.properties
SET description = REPLACE(description, 'https://www.emlakjet.com/ilan/', 'EmlakJet ilanı - ')
WHERE description LIKE 'https://www.emlakjet.com/ilan/%';

-- 4) Schema cache'i yenile
NOTIFY pgrst, 'reload schema';
