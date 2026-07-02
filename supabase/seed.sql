-- seed.sql — Test verisi
-- Supabase SQL Editor'da çalıştır

-- Test kullanıcıları (önce Auth.UI üzerinden oluştur, sonra burayı çalıştır)
insert into public.users (id, username, email, name, role, status, profile_completed)
values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'admin@fsbo.app', 'Admin User', 'admin', 'aktif', true),
  ('00000000-0000-0000-0000-000000000002', 'user1', 'user1@fsbo.app', 'Ali Yılmaz', 'user', 'aktif', true),
  ('00000000-0000-0000-0000-000000000003', 'user2', 'user2@fsbo.app', 'Ayşe Demir', 'user', 'aktif', false)
on conflict (id) do nothing;

-- Abonelikler
insert into public.subscriptions (user_id, plan_id, status)
values
  ('00000000-0000-0000-0000-000000000001', 'enterprise', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'pro', 'active'),
  ('00000000-0000-0000-0000-000000000003', 'free', 'active')
on conflict (user_id) do nothing;

-- Test ilanları
insert into public.properties (id, owner_id, title, description, location, city, price_text, price, size_text, size, rooms, type, status, is_daily, lat, lng)
values
  ('p1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Leventte Ferah Daire', '3+1, geniş balkonlu, aile için ideal', 'Levent, Beşiktaş', 'İstanbul', '4.500.000 TL', 4500000, '145 m²', 145, '3+1', 'Satılık', 'Aktif', true, 41.075, 29.015),
  ('p1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Bebekte Müstakil Villa', 'Boğaz manzaralı, havuzlu lüks villa', 'Bebek, Beşiktaş', 'İstanbul', '12.000.000 TL', 12000000, '320 m²', 320, '5+2', 'Satılık', 'Aktif', false, 41.075, 29.043),
  ('p1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Etilerde Kiralık Ofis', 'Merkezi konumda, tam donanımlı ofis', 'Etiler, Beşiktaş', 'İstanbul', '15.000 TL/ay', 15000, '80 m²', 80, '2+1', 'Kiralık', 'Aktif', true, 41.083, 29.035)
on conflict (id) do nothing;

-- Müşteriler
insert into public.customers (id, owner_id, name, email, phone)
values
  ('c1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Mehmet Kaya', 'mehmet@example.com', '0532 111 2233'),
  ('c1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Zeynep Şahin', 'zeynep@example.com', '0533 444 5566')
on conflict (id) do nothing;

-- Randevular
insert into public.appointments (owner_id, title, date, time, duration, attendee_name, status)
values
  ('00000000-0000-0000-0000-000000000002', 'Levent Daire İçin Keşif', '2026-01-15', '14:00', 60, 'Mehmet Kaya', 'bekliyor'),
  ('00000000-0000-0000-0000-000000000002', 'Villa Fotoğraf Çekimi', '2026-01-16', '10:00', 120, NULL, 'onaylandi')
on conflict do nothing;

-- Bildirimler
insert into public.notifications (user_id, type, title, description)
values
  ('00000000-0000-0000-0000-000000000002', 'system', 'Hoş Geldiniz!', 'FSBO platformuna hoş geldiniz. İlanlarınızı keşfedin.'),
  ('00000000-0000-0000-0000-000000000002', 'listing', 'Yeni İlan Eklendi', 'Beşiktaş bölgesinde yeni bir villa ilanı yayında.')
on conflict do nothing;
