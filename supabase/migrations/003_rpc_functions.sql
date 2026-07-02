-- 003_rpc_functions.sql — Supabase RPC fonksiyonları

-- Username'den email lookup (giriş için)
create or replace function public.get_email_by_username(p_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select email from public.users where username = p_username limit 1;
$$;

-- Plan dağılımını getir
create or replace function get_plan_distribution()
returns json
language sql
stable
as $$
  select json_build_object(
    'free', count(*) filter (where plan_id = 'free'),
    'pro', count(*) filter (where plan_id = 'pro'),
    'enterprise', count(*) filter (where plan_id = 'enterprise')
  )
  from public.subscriptions
$$;
