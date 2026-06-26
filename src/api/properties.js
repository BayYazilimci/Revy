import { apiClient } from './client'
import { properties as mockProperties, propertyList } from '../data/properties'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const propertiesApi = {
  async getAll(params = {}) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 100))
      let result = [...propertyList]
      if (params.category && params.category !== 'Tümü') {
        // Mock filtering
      }
      return { data: result, total: result.length }
    }
    return apiClient.get('/properties', params)
  },

  async getById(id) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 50))
      const prop = mockProperties[id]
      if (!prop) throw new Error('Property not found')
      return prop
    }
    return apiClient.get(`/properties/${id}`)
  },

  async search(query) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 200))
      const q = query.toLowerCase()
      const result = propertyList.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      )
      return { data: result, total: result.length }
    }
    return apiClient.get('/properties/search', { q: query })
  }
}
