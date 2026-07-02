-- 007_add_listing_images.sql
-- İlanlara çoklu resim desteği ekle
-- Supabase Dashboard > SQL Editor > Run

-- 1) all_images sütunu ekle (text array olarak - scraper verisiyle uyumlu)
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS all_images text[] DEFAULT '{}';

-- 2) Mevcut img değerlerini all_images içine kopyala (henüz güncellenmemişler için)
UPDATE public.properties
SET all_images = CASE
  WHEN img IS NOT NULL AND img != '' THEN ARRAY[img]
  ELSE '{}'
END
WHERE all_images = '{}' OR all_images IS NULL;

-- 3) Schema cache'i yenile
NOTIFY pgrst, 'reload schema';
