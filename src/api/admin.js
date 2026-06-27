import { apiClient } from './client'

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

// Backend hesap kaydını AdminPanel'in beklediği şekle dönüştür
function mapAccount(a) {
  return {
    id: a.id,
    username: a.username,
    name: a.name,
    email: a.email,
    avatar: a.avatar,
    role: a.role,
    status: a.status,
    banReason: a.banReason || undefined,
    city: a.city || '—',
    phone: a.phone || '—',
    lastIp: a.lastIp || '—',
    device: a.device || '—',
    plan: PLAN_LABEL[a.subscription?.planId] || 'Ücretsiz',
    listings: a._count?.properties ?? 0,
    joined: formatJoined(a.createdAt),
    last: relativeTr(a.lastSeenAt),
  }
}

export const adminApi = {
  async getAccounts() {
    const list = await apiClient.get('/admin/accounts')
    return Array.isArray(list) ? list.map(mapAccount) : []
  },

  async setStatus(id, status, extra = {}) {
    return apiClient.put(`/admin/accounts/${id}/status`, {
      status,
      banReason: extra.banReason,
    })
  },

  async getOverview() {
    return apiClient.get('/admin/overview')
  },
}
