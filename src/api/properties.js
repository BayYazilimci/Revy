import { apiClient } from './client'

// Tüm ilan verisi artık gerçek backend'den gelir (mock kaldırıldı)
export const propertiesApi = {
  async getAll() {
    return apiClient.get('/properties') // { data, total }
  },

  async getDaily() {
    return apiClient.get('/properties/daily')
  },

  async getById(id) {
    return apiClient.get(`/properties/${id}`)
  },

  async search(query) {
    return apiClient.get('/properties/search', { q: query })
  },

  async create(data) {
    return apiClient.post('/properties', data)
  },

  async update(id, data) {
    return apiClient.put(`/properties/${id}`, data)
  },

  async remove(id) {
    return apiClient.delete(`/properties/${id}`)
  },
}
