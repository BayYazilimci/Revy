-- 010_list_items_notes.sql — list_items tablosuna notes kolonu ekler
-- Mevcut portföy notlarının Supabase'e kalıcı olarak kaydedilmesini sağlar

-- list_items tablosuna notes kolonu ekle
alter table public.list_items add column if not exists notes text;

-- Mevcut RLS politikası zaten list_items_owner olarak tanımlı
-- Yeni kolon için ek politika gerekmez (mevcut politika tüm sütunları kapsar)
