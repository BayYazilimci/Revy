import { apiClient } from './client'
import { defaultLists } from '../data/lists'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

let mockLists = { ...defaultLists }
let mockCounter = 0

export const listsApi = {
  async getAll() {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 50))
      return Object.values(mockLists)
    }
    return apiClient.get('/lists')
  },

  async getById(id) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 30))
      return mockLists[id] || null
    }
    return apiClient.get(`/lists/${id}`)
  },

  async create(data) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 100))
      const id = 'l' + Date.now().toString(36) + (mockCounter++).toString(36)
      const colors = ['#1e1b2e', '#e3d10d', '#3b82f6', '#8b5cf6', '#dc2626', '#059669', '#d97706']
      const icons = ['heart', 'home', 'trending-up', 'umbrella', 'building-2', 'sparkles', 'star']
      const list = {
        id,
        name: data.name,
        desc: data.desc || '',
        items: [],
        color: colors[Math.floor(Math.random() * colors.length)],
        icon: icons[Math.floor(Math.random() * icons.length)],
      }
      mockLists[id] = list
      return list
    }
    return apiClient.post('/lists', data)
  },

  async update(id, data) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 80))
      if (!mockLists[id]) throw new Error('List not found')
      mockLists[id] = { ...mockLists[id], name: data.name, desc: data.desc ?? mockLists[id].desc }
      return mockLists[id]
    }
    return apiClient.put(`/lists/${id}`, data)
  },

  async delete(id) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 80))
      if (!mockLists[id]) throw new Error('List not found')
      delete mockLists[id]
      return { success: true }
    }
    return apiClient.delete(`/lists/${id}`)
  },

  async addItem(listId, propertyId) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 50))
      if (!mockLists[listId]) throw new Error('List not found')
      if (!mockLists[listId].items.includes(propertyId)) {
        mockLists[listId].items.push(propertyId)
      }
      return mockLists[listId]
    }
    return apiClient.post(`/lists/${listId}/items`, { propertyId })
  },

  async removeItem(listId, propertyId) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 50))
      if (!mockLists[listId]) throw new Error('List not found')
      mockLists[listId].items = mockLists[listId].items.filter(i => i !== propertyId)
      return mockLists[listId]
    }
    return apiClient.delete(`/lists/${listId}/items/${propertyId}`)
  }
}
