import { apiClient } from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

let mockCustomers = {
  'c1': {
    id: 'c1', ad: 'Ahmet', soyad: 'Yılmaz',
    email: 'ahmet.yilmaz@email.com', telefon: '0532 111 22 33',
    sirket: 'Yılmaz İnşaat', sektor: 'İnşaat',
    notlar: 'VIP müşteri, düzenli iletişim halinde.',
    createdAt: '2026-05-15T10:30:00Z'
  },
  'c2': {
    id: 'c2', ad: 'Ayşe', soyad: 'Demir',
    email: 'ayse.demir@email.com', telefon: '0533 444 55 66',
    sirket: 'Demir Gayrimenkul', sektor: 'Gayrimenkul',
    notlar: 'Portföy yönetimi için görüşülüyor.',
    createdAt: '2026-05-20T14:00:00Z'
  },
  'c3': {
    id: 'c3', ad: 'Mehmet', soyad: 'Kaya',
    email: 'mehmet.kaya@email.com', telefon: '0535 777 88 99',
    sirket: 'Kaya Holding', sektor: 'Finans',
    notlar: '',
    createdAt: '2026-06-01T09:15:00Z'
  },
  'c4': {
    id: 'c4', ad: 'Zeynep', soyad: 'Çelik',
    email: 'zeynep.celik@email.com', telefon: '0538 999 00 11',
    sirket: 'Çelik Tekstil', sektor: 'Tekstil',
    notlar: 'Yeni proje için potansiyel yatırımcı.',
    createdAt: '2026-06-05T11:45:00Z'
  },
  'c5': {
    id: 'c5', ad: 'Ali', soyad: 'Öztürk',
    email: 'ali.ozturk@email.com', telefon: '0531 222 33 44',
    sirket: 'Öztürk Otomotiv', sektor: 'Otomotiv',
    notlar: '',
    createdAt: '2026-06-10T16:30:00Z'
  },
}

let mockCounter = 0

export const customersApi = {
  async getAll() {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 50))
      return Object.values(mockCustomers)
    }
    return apiClient.get('/customers')
  },

  async getById(id) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 30))
      return mockCustomers[id] || null
    }
    return apiClient.get(`/customers/${id}`)
  },

  async create(data) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 100))
      const id = 'c' + Date.now().toString(36) + (mockCounter++).toString(36)
      const customer = {
        id,
        ad: data.ad,
        soyad: data.soyad,
        email: data.email || '',
        telefon: data.telefon || '',
        sirket: data.sirket || '',
        sektor: data.sektor || '',
        notlar: data.notlar || '',
        createdAt: new Date().toISOString(),
      }
      mockCustomers[id] = customer
      return customer
    }
    return apiClient.post('/customers', data)
  },

  async update(id, data) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 80))
      if (!mockCustomers[id]) throw new Error('Müşteri bulunamadı')
      mockCustomers[id] = { ...mockCustomers[id], ...data }
      return mockCustomers[id]
    }
    return apiClient.put(`/customers/${id}`, data)
  },

  async delete(id) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 80))
      if (!mockCustomers[id]) throw new Error('Müşteri bulunamadı')
      delete mockCustomers[id]
      return { success: true }
    }
    return apiClient.delete(`/customers/${id}`)
  },
}
