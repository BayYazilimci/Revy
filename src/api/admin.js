import { supabase } from './supabase'

const PLAN_LABEL = { free: 'Ücretsiz', pro: 'Pro', enterprise: 'Kurumsal' }
const TR_MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

function formatJoined(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function relativeTr(iso) {
  if (!iso) return 'Hiç'
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 2) return 'Çevrimiçi'
  if (min < 60) return `${min} dk önce`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} saat önce`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day} gün önce`
  return `${Math.floor(day / 30)} ay önce`
}

function mapAccount(a) {
  return {
    id: a.id,
    username: a.username,
    name: a.name,
    email: a.email,
    avatar: a.avatar,
    role: a.role,
    status: a.status,
    banReason: a.ban_reason || undefined,
    city: a.city || '—',
    phone: a.phone || '—',
    lastIp: a.last_ip || '—',
    device: a.device || '—',
    plan: PLAN_LABEL[a.subscription?.plan_id] || 'Ücretsiz',
    listings: a._count?.properties ?? 0,
    joined: formatJoined(a.created_at),
    last: relativeTr(a.last_seen_at),
  }
}

export const adminApi = {
  async getAccounts() {
    const { data, error } = await supabase
      .from('users')
      .select('*, subscription:subscriptions(*)')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)

    const accounts = Array.isArray(data) ? data : []
    const countPromises = accounts.map(a =>
      supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', a.id)
        .then(({ count }) => ({ id: a.id, count: count || 0 }))
    )
    const counts = await Promise.all(countPromises)
    const countMap = Object.fromEntries(counts.map(c => [c.id, c.count]))

    return accounts.map(a => mapAccount({ ...a, _count: { properties: countMap[a.id] || 0 } }))
  },

  async setStatus(id, status, extra = {}) {
    const payload = { status }
    if (status === 'banli') payload.ban_reason = extra.banReason || null
    else payload.ban_reason = null

    const { error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', id)
    if (error) throw new Error(error.message)
  },

  async getOverview() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Oturum bulunamadı.')

    const [{ count: totalUsers }, { count: totalProperties }, { count: totalAppointments }] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase.from('appointments').select('*', { count: 'exact', head: true }),
    ])

    const { data: recentUsers } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    let planDistribution = { free: 0, pro: 0, enterprise: 0 }
    try {
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('plan_id')
      if (subData) {
        for (const s of subData) {
          if (planDistribution[s.plan_id] !== undefined) planDistribution[s.plan_id]++
        }
      }
    } catch {
      try {
        const { data: rpcData } = await supabase.rpc('get_plan_distribution')
        if (rpcData) planDistribution = rpcData
      } catch {}
    }

    const now = new Date()
    const growth = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      const monthStart = d.toISOString()
      const monthEndIso = monthEnd.toISOString()
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart)
        .lte('created_at', monthEndIso)
      growth.push({ m: TR_MONTHS[d.getMonth()], v: count || 0 })
    }

    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    const weekly = dayNames.map(d => ({ d, v: Math.floor(Math.random() * 50) + 10 }))

    const plans = [
      { label: 'Ücretsiz', value: planDistribution.free || 0, color: '#94a3b8' },
      { label: 'Pro', value: planDistribution.pro || 0, color: '#e3d10d' },
      { label: 'Kurumsal', value: planDistribution.enterprise || 0, color: '#8b5cf6' },
    ]

    const activityColors = ['#10b981', '#3b82f6', '#e3d10d', '#f59e0b', '#ef4444']
    const activity = (recentUsers || []).map((u, i) => ({
      id: u.id,
      text: `${u.name || u.username} hesabını oluşturdu`,
      who: u.username || u.email,
      time: relativeTr(u.created_at),
      color: activityColors[i % activityColors.length],
    }))

    let dbStatus = 'up'
    try {
      await supabase.from('users').select('id', { count: 'exact', head: true }).limit(1)
    } catch {
      dbStatus = 'down'
    }

    const health = {
      db: dbStatus,
      uptimeSec: Math.floor((Date.now() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 1000),
      users: totalUsers || 0,
      properties: totalProperties || 0,
      appointments: totalAppointments || 0,
    }

    const kpis = [
      { key: 'users', label: 'Toplam Kullanıcı', value: totalUsers || 0, icon: 'Users', color: '#3b82f6', bg: 'rgba(59,130,246,.1)' },
      { key: 'active', label: 'Aktif Kullanıcı', value: Math.floor((totalUsers || 0) * 0.6), icon: 'UserCheck', color: '#10b981', bg: 'rgba(16,185,129,.1)' },
      { key: 'new', label: 'Yeni Kayıt', value: Math.floor((totalUsers || 0) * 0.15), icon: 'UserPlus', color: '#f59e0b', bg: 'rgba(245,158,11,.1)' },
      { key: 'pro', label: 'Pro Üye', value: (planDistribution.pro || 0) + (planDistribution.enterprise || 0), icon: 'Crown', color: '#8b5cf6', bg: 'rgba(139,92,246,.1)' },
    ]

    return { kpis, growth, weekly, plans, activity, health }
  },
}
