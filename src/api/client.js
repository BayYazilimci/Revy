const API_BASE = import.meta.env.VITE_API_URL || '/api'

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      if (!response.ok) {
        const error = new Error(`API Error: ${response.status} ${response.statusText}`)
        error.status = response.status
        error.data = await response.json().catch(() => null)
        throw error
      }
      return await response.json()
    } catch (err) {
      if (err.status) throw err
      throw new Error(err.message || 'Network error')
    }
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
