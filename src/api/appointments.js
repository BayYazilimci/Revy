const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const LOCAL_STORAGE_KEY = 'fsbo_appointments'

// Generate initial mock appointments relative to current date (2026-06-25)
const getInitialMockData = () => {
  const today = '2026-06-25'
  const tomorrow = '2026-06-26'
  const nextDay = '2026-06-27'

  return {
    'a1': {
      id: 'a1',
      title: 'Ahmet Yılmaz - Tapu Görüşmesi',
      date: today,
      time: '14:00',
      duration: 60, // minutes
      attendeeId: 'c1', // link to Ahmet Yılmaz
      attendeeName: 'Ahmet Yılmaz',
      location: 'Kağıthane Tapu Dairesi',
      description: 'Satış işlemi tapu devri evrakları teslim edilecek.',
      status: 'onaylandı',
      createdAt: '2026-06-24T10:00:00Z',
    },
    'a2': {
      id: 'a2',
      title: 'Ayşe Demir - Daire Gösterimi',
      date: today,
      time: '16:30',
      duration: 45,
      attendeeId: 'c2', // link to Ayşe Demir
      attendeeName: 'Ayşe Demir',
      location: 'Kağıthane Residence - Daire 14',
      description: 'Kiralık dairenin detaylı gösterimi ve fiyat müzakeresi.',
      status: 'bekliyor',
      createdAt: '2026-06-24T11:30:00Z',
    },
    'a3': {
      id: 'a3',
      title: 'Mehmet Kaya - Finansal Sunum',
      date: tomorrow,
      time: '11:00',
      duration: 90,
      attendeeId: 'c3', // link to Mehmet Kaya
      attendeeName: 'Mehmet Kaya',
      location: 'Maslak Office Center',
      description: 'Yatırım portföyünün detayları ve getiri oranları görüşülecek.',
      status: 'onaylandı',
      createdAt: '2026-06-24T15:00:00Z',
    },
    'a4': {
      id: 'a4',
      title: 'Zeynep Çelik - Proje Lansmanı',
      date: nextDay,
      time: '10:00',
      duration: 120,
      attendeeId: 'c4', // link to Zeynep Çelik
      attendeeName: 'Zeynep Çelik',
      location: 'Şişli Kongre Merkezi',
      description: 'Yeni inşaat projesinin ön satış lansman toplantısı.',
      status: 'iptal',
      createdAt: '2026-06-25T08:00:00Z',
    }
  }
}

const loadFromStorage = () => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse appointments from localStorage', e)
    }
  }
  const initial = getInitialMockData()
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial))
  return initial
}

const saveToStorage = (data) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
}

let mockAppointments = loadFromStorage()
let mockCounter = 0

export const appointmentsApi = {
  async getAll() {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 60))
      // Reload in case another tab updated it
      mockAppointments = loadFromStorage()
      return Object.values(mockAppointments)
    }
    // Future backend support
    return []
  },

  async getById(id) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 30))
      mockAppointments = loadFromStorage()
      return mockAppointments[id] || null
    }
    return null
  },

  async create(data) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 80))
      mockAppointments = loadFromStorage()
      const id = 'a' + Date.now().toString(36) + (mockCounter++).toString(36)
      const appointment = {
        id,
        title: data.title || `${data.attendeeName || 'Katılımcı'} ile Görüşme`,
        date: data.date,
        time: data.time,
        duration: parseInt(data.duration) || 60,
        attendeeId: data.attendeeId || '',
        attendeeName: data.attendeeName || '',
        location: data.location || '',
        description: data.description || '',
        status: data.status || 'bekliyor',
        listingId: data.listingId || '',
        listingTitle: data.listingTitle || '',
        createdAt: new Date().toISOString(),
      }
      mockAppointments[id] = appointment
      saveToStorage(mockAppointments)
      return appointment
    }
    return null
  },

  async update(id, data) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 70))
      mockAppointments = loadFromStorage()
      if (!mockAppointments[id]) throw new Error('Randevu bulunamadı')
      mockAppointments[id] = {
        ...mockAppointments[id],
        ...data,
        duration: data.duration ? parseInt(data.duration) : mockAppointments[id].duration,
      }
      saveToStorage(mockAppointments)
      return mockAppointments[id]
    }
    return null
  },

  async delete(id) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 50))
      mockAppointments = loadFromStorage()
      if (!mockAppointments[id]) throw new Error('Randevu bulunamadı')
      delete mockAppointments[id]
      saveToStorage(mockAppointments)
      return { success: true }
    }
    return { success: false }
  },
}
