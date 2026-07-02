export const APP_NAME = 'FSBO'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/giris',
  FORGOT_PASSWORD: '/sifremi-unuttum',
  FAVORITES: '/favoriler',
  MY_LISTINGS: '/portfoyum',
  LISTING_DETAIL: '/ilan/:id',
  ACCOUNT: '/hesap',
  CUSTOMERS: '/musteriler',
  CREATE_LISTING: '/ilan-olustur',
  AI_ASSISTANT: '/ai/asistan',
  FSBO_AI: '/ai',
  EV_BULUCU: '/ai/ev-bulucu',
  FSBO_GORSEL: '/ai/gorsel',
  FSBO_VIDEO: '/ai/video',
  FSBO_SANAL_TUR: '/ai/sanal-tur',
  FSBO_3D: '/ai/3d-ev',
  FSBO_DRONE: '/ai/drone',
  PROFILE_SETUP: '/profil-tamamla',
  DAILY: '/gunluk',
  APPOINTMENTS: '/randevular',
  ADMIN: '/admin',
  WEBSITE_BUILDER: '/web-site-olustur',
  WEBSITE_SETTINGS: '/web-site-ayarlar/:id',
  PUBLISHED_SITE: '/site/:slug',
}

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
}

export const PLANS = [
  {
    id: 'free',
    name: 'Ücretsiz',
    price: 0,
    currency: 'TRY',
    period: 'month',
    features: ['5 ilan görüntüleme/gün', 'Temel arama filtresi', 'E-posta desteği'],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 149,
    currency: 'TRY',
    period: 'month',
    features: ['Sınırsız ilan görüntüleme', 'Gelişmiş filtreler', 'Öncelikli destek', 'PDF rapor indirme', 'Reklamsız deneyim'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Kurumsal',
    price: 499,
    currency: 'TRY',
    period: 'month',
    features: ['Her şey dahil', 'API erişimi', 'Özel entegrasyon', '7/24 destek', 'Çoklu kullanıcı', 'Özel raporlar'],
    popular: false,
  },
]

export const COLORS = {
  accent: '#e3d10d',
  accentLight: '#f0e447',
  accentDark: '#cabb0b',
  cream: '#faf7f2',
  deep: '#1e1b2e',
  navy: '#1a2a3a',
  cardBorder: '#f0ece6',
}

export const CATEGORIES = ['Tümü', 'Satılık', 'Kiralık', 'Villa', 'Daire']

export const CATEGORY_COLORS = {
  'Tümü': '#1e1b2e',
  'Satılık': '#059669',
  'Kiralık': '#3b82f6',
  'Villa': '#8b5cf6',
  'Daire': '#dc2626',
}

export const SORT_OPTIONS = [
  { label: 'Son eklenen', value: 'newest' },
  { label: 'Fiyat (Artan)', value: 'price_asc' },
  { label: 'Fiyat (Azalan)', value: 'price_desc' },
  { label: 'Metrekare (Artan)', value: 'size_asc' },
  { label: 'Metrekare (Azalan)', value: 'size_desc' },
]

export const LIST_COLORS = ['#1e1b2e', '#e3d10d', '#3b82f6', '#8b5cf6', '#dc2626', '#059669', '#d97706']
export const LIST_ICONS = ['heart', 'home', 'trending-up', 'umbrella', 'building-2', 'sparkles', 'star']
