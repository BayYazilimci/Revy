import { apiClient } from './client'
import { tokenStore } from './tokenStore'

/**
 * Backend kullanıcı şeklini frontend'in beklediği şekle dönüştürür.
 * (subscription ayrı uçtan gelir; burada birleştirilir)
 */
function mapUser(user, subscription) {
  if (!user) return null
  return {
    ...user,
    subscription: subscription
      ? {
          planId: subscription.planId,
          status: subscription.status,
          since: subscription.since,
          renewsAt: subscription.renewsAt,
        }
      : null,
  }
}

async function fetchSubscription() {
  try {
    return await apiClient.get('/subscription')
  } catch {
    return null
  }
}

export const authApi = {
  async login(username, password) {
    const res = await apiClient.post('/auth/login', { username, password })
    tokenStore.set(res)
    const sub = await fetchSubscription()
    return mapUser(res.user, sub)
  },

  async register({ username, password, firstName, lastName, email }) {
    const res = await apiClient.post('/auth/register', { username, password, firstName, lastName, email })
    tokenStore.set(res)
    const sub = await fetchSubscription()
    return { user: mapUser(res.user, sub), needsProfile: res.needsProfile }
  },

  async me() {
    const access = tokenStore.getAccess()
    if (!access) return null
    try {
      const user = await apiClient.get('/auth/me')
      const sub = await fetchSubscription()
      return mapUser(user, sub)
    } catch {
      return null
    }
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout', {})
    } catch { /* yoksay */ }
    tokenStore.clear()
  },

  async updateProfile(updates) {
    const user = await apiClient.put('/auth/profile', updates)
    const sub = await fetchSubscription()
    return mapUser(user, sub)
  },

  async updatePassword(currentPassword, newPassword) {
    return apiClient.put('/auth/password', { currentPassword, newPassword })
  },

  async forgotPassword(email) {
    return apiClient.post('/auth/forgot-password', { email })
  },

  async subscribe(planId) {
    return apiClient.post('/subscription', { planId })
  },

  async cancelSubscription() {
    return apiClient.delete('/subscription')
  },

  async getInvoices() {
    try {
      return await apiClient.get('/invoices')
    } catch {
      return []
    }
  },
}
