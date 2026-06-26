const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

// { [musteriId]: { [ilanId]: { not: string } } }
let mockAssociations = {
  'c1': { p1: { not: 'Bu ilanla çok ilgilendi, tekrar arayın.' }, p3: { not: '' } },
  'c2': { p2: { not: 'Yarın gezmeye gelecek.' } },
}

export const customerListingsApi = {
  async getAll() {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 30))
      return JSON.parse(JSON.stringify(mockAssociations))
    }
    return []
  },

  async associate(musteriId, ilanId) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 50))
      if (!mockAssociations[musteriId]) {
        mockAssociations[musteriId] = {}
      }
      if (!mockAssociations[musteriId][ilanId]) {
        mockAssociations[musteriId][ilanId] = { not: '' }
      }
      return { musteriId, ilanId, not: '' }
    }
    return null
  },

  async disassociate(musteriId, ilanId) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 40))
      if (mockAssociations[musteriId]) {
        delete mockAssociations[musteriId][ilanId]
        if (Object.keys(mockAssociations[musteriId]).length === 0) {
          delete mockAssociations[musteriId]
        }
      }
      return { success: true }
    }
    return null
  },

  async updateNote(musteriId, ilanId, not) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 40))
      if (!mockAssociations[musteriId]) {
        mockAssociations[musteriId] = {}
      }
      mockAssociations[musteriId][ilanId] = { not }
      return { musteriId, ilanId, not }
    }
    return null
  },
}
