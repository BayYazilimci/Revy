-- 002_rls_policies.sql — Row Level Security politikaları
-- Tüm tablolar için RLS etkinleştirilir ve kısıtlama politikaları eklenir

-- Kullanıcılar: kendi kaydını görebilir; admin tümünü görebilir
alter table public.users enable row level security;

create policy users_select on public.users
  for select using (true);
create policy users_insert on public.users
  for insert with check (id = auth.uid());
create policy users_update on public.users
  for update using (id = auth.uid() or auth.jwt()->>'role' = 'admin');
create policy users_delete on public.users
  for delete using (id = auth.uid() or auth.jwt()->>'role' = 'admin');

-- Abonelik: sahibi veya admin
alter table public.subscriptions enable row level security;

create policy subscriptions_select on public.subscriptions
  for select using (user_id = auth.uid() or auth.jwt()->>'role' = 'admin');
create policy subscriptions_insert on public.subscriptions
  for insert with check (user_id = auth.uid());
create policy subscriptions_update on public.subscriptions
  for update using (user_id = auth.uid() or auth.jwt()->>'role' = 'admin');
create policy subscriptions_delete on public.subscriptions
  for delete using (user_id = auth.uid() or auth.jwt()->>'role' = 'admin');

-- Faturalar: sahibi veya admin
alter table public.invoices enable row level security;

create policy invoices_select on public.invoices
  for select using (user_id = auth.uid() or auth.jwt()->>'role' = 'admin');
create policy invoices_insert on public.invoices
  for insert with check (user_id = auth.uid());
create policy invoices_update on public.invoices
  for update using (user_id = auth.uid() or auth.jwt()->>'role' = 'admin');
create policy invoices_delete on public.invoices
  for delete using (user_id = auth.uid() or auth.jwt()->>'role' = 'admin');

-- İlanlar: herkes görebilir (public), sadece sahibi veya admin düzenleyebilir/silebilir
alter table public.properties enable row level security;

create policy properties_select on public.properties
  for select using (true);
create policy properties_insert on public.properties
  for insert with check (owner_id = auth.uid());
create policy properties_update on public.properties
  for update using (owner_id = auth.uid() or auth.jwt()->>'role' = 'admin');
create policy properties_delete on public.properties
  for delete using (owner_id = auth.uid() or auth.jwt()->>'role' = 'admin');

-- Listeler: sadece sahibi
alter table public.lists enable row level security;

create policy lists_owner on public.lists
  for all using (user_id = auth.uid());

-- Liste öğeleri: listenin sahibi
alter table public.list_items enable row level security;

create policy list_items_owner on public.list_items
  for all using (
    exists (select 1 from public.lists where id = list_id and user_id = auth.uid())
  );

-- Müşteriler: sadece sahibi
alter table public.customers enable row level security;

create policy customers_owner on public.customers
  for all using (owner_id = auth.uid());

-- Müşteri-ilan ilişkisi: müşteri sahibi üzerinden
alter table public.customer_listings enable row level security;

create policy customer_listings_owner on public.customer_listings
  for all using (
    exists (select 1 from public.customers where id = customer_id and owner_id = auth.uid())
  );

-- Randevular: sadece sahibi
alter table public.appointments enable row level security;

create policy appointments_owner on public.appointments
  for all using (owner_id = auth.uid());

-- Günlük: sadece sahibi
alter table public.daily_entries enable row level security;

create policy daily_owner on public.daily_entries
  for all using (user_id = auth.uid());

-- Bildirimler: sadece hedef kullanıcı
alter table public.notifications enable row level security;

create policy notifications_owner on public.notifications
  for all using (user_id = auth.uid());
