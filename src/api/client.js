import { tokenStore } from './tokenStore'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.refreshing = null // tek seferde tek refresh
  }

  async request(endpoint, options = {}, _retry = false) {
    const url = `${this.baseUrl}${endpoint}`
    const access = tokenStore.getAccess()
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
        ...options.headers,
      },
      ...options,
    }

    let response
    try {
      response = await fetch(url, config)
    } catch (err) {
      throw new Error(err.message || 'Network error')
    }

    // Access token süresi dolduysa bir kez sessizce yenile ve tekrar dene
    if (response.status === 401 && !_retry && !endpoint.startsWith('/auth/')) {
      const ok = await this.tryRefresh()
      if (ok) return this.request(endpoint, options, true)
    }

    if (!response.ok) {
      const error = new Error(`API Error: ${response.status} ${response.statusText}`)
      error.status = response.status
      error.data = await response.json().catch(() => null)
      // Backend mesajını öne çıkar
      if (error.data?.message) error.message = error.data.message
      throw error
    }

    if (response.status === 204) return null
    return response.json()
  }

  async tryRefresh() {
    const refreshToken = tokenStore.getRefresh()
    if (!refreshToken) return false
    if (!this.refreshing) {
      this.refreshing = fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
        .then(async (r) => {
          if (!r.ok) throw new Error('refresh failed')
          const data = await r.json()
          tokenStore.set(data)
          return true
        })
        .catch(() => {
          tokenStore.clear()
          return false
        })
        .finally(() => {
          this.refreshing = null
        })
    }
    return this.refreshing
  }

  get(endpoint, params = {}) {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    const url = query ? `${endpoint}?${query}` : endpoint
    return this.request(url, { method: 'GET' })
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE)
export default ApiClient
