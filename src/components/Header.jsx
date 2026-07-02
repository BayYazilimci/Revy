import { useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { TabContext } from '../context/TabContext'
import { notificationsApi } from '../api/notifications'
import {
  Compass, Heart, Bell, Home, Sun, Calendar, Bot, Bookmark, Users, User, Plus, Building2, Globe, Settings, Image, Film, Eye, Layers, Plane, Search
} from 'lucide-react'
import NotificationPopup from './ui/NotificationPopup'

export default function Header() {
  const location = useLocation()
  const { addToast } = useApp()
  const { activeTab } = useContext(TabContext)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    notificationsApi.getAll().then(setNotifications).catch(() => {})
  }, [])

  const handleMarkRead = async (id) => {
    try { await notificationsApi.markRead(id) } catch {}
  }

  const handleMarkAllRead = async () => {
    try { await notificationsApi.markAllRead() } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleDelete = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getPageIcon = () => {
    if (location.pathname === '/favoriler') return Heart
    if (location.pathname === '/ilan-olustur') return Plus
    if (location.pathname.startsWith('/ilan/')) return Building2
    if (location.pathname === '/web-site-olustur') return Globe
    if (location.pathname.startsWith('/web-site-ayarlar/')) return Settings
    if (location.pathname === '/ai') return Bot
    if (location.pathname === '/ai/ev-bulucu') return Search
    if (location.pathname === '/ai/gorsel') return Image
    if (location.pathname === '/ai/video') return Film
    if (location.pathname === '/ai/sanal-tur') return Eye
    if (location.pathname === '/ai/3d-ev') return Layers
    if (location.pathname === '/ai/drone') return Plane
    
    switch (activeTab) {
      case 'anasayfa': return Home
      case 'kesfet': return Compass
      case 'gunluk': return Sun
      case 'randevular': return Calendar
      case 'ai-asistan': return Bot
      case 'ilanlarim': return Bookmark
      case 'listeler': return Heart
      case 'musteriler': return Users
      case 'hesap': return User
      default: return Compass
    }
  }

  const getPageTitle = () => {
    if (location.pathname === '/favoriler') return { title: 'Listelerim', subtitle: 'Favori Listeleri' }
    if (location.pathname === '/ilan-olustur') return { title: 'Yeni İlan', subtitle: 'Portföye Ekle' }
    if (location.pathname.startsWith('/ilan/')) return { title: 'İlan Detayı', subtitle: 'Detaylı İnceleme' }
    if (location.pathname === '/web-site-olustur') return { title: 'Web Sitesi Kurucu', subtitle: 'Şablon ile Web Sitesi Oluştur' }
    if (location.pathname.startsWith('/web-site-ayarlar/')) return { title: 'Site Ayarları', subtitle: 'Domain & SEO Ayarları' }
    if (location.pathname === '/ai') return { title: 'FSBOAI', subtitle: 'Tüm AI Araçları' }
    if (location.pathname === '/ai/ev-bulucu') return { title: 'Ev Bulucu', subtitle: 'AI Destekli Ev Arama' }
    if (location.pathname === '/ai/gorsel') return { title: 'Görsel Oluştur', subtitle: 'AI ile Emlak Görseli' }
    if (location.pathname === '/ai/video') return { title: 'Video Oluştur', subtitle: 'AI ile Tanıtım Videosu' }
    if (location.pathname === '/ai/sanal-tur') return { title: 'Sanal Tur', subtitle: '360° Sanal Tur' }
    if (location.pathname === '/ai/3d-ev') return { title: '3D Modelleme', subtitle: '3D Ev Modelleme' }
    if (location.pathname === '/ai/drone') return { title: 'Drone Çekimi', subtitle: 'Hava Görüntüleme' }
    
    switch (activeTab) {
      case 'anasayfa': return { title: 'Ana Sayfa', subtitle: 'Emlak Paneli Özet' }
      case 'kesfet': return { title: 'Keşfet', subtitle: 'Tüm Emlaklar' }
      case 'gunluk': return { title: 'Günlük', subtitle: 'Son 24 Saatlik İlanlar' }
      case 'randevular': return { title: 'Randevular', subtitle: 'Takvim ve Görüşmeler' }
      case 'ai-asistan': return { title: 'FSBOAI', subtitle: 'FSBOAI Desteği' }
      case 'ilanlarim': return { title: 'Portföyüm', subtitle: 'Portföy İlanlarım' }
      case 'listeler': return { title: 'Listelerim', subtitle: 'Kaydettiğim İlanlar' }
      case 'musteriler': return { title: 'Müşteriler', subtitle: 'Müşteri Yönetimi' }
      case 'hesap': return { title: 'Hesabım', subtitle: 'Profil ve Ayarlar' }
      default: return { title: 'FSBO', subtitle: 'Emlak Paneli' }
    }
  }

  const Icon = getPageIcon()
  const page = getPageTitle()

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-xl border-b border-cardBorder hidden lg:block">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 ml-0 lg:ml-[260px]">
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md" style={{ background: '#1e1b2e' }}>
                <Icon size={17} style={{ color: '#e3d10d' }} />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight leading-tight" style={{ color: '#1e1b2e' }}>{page.title}</h1>
                <p className="text-[8px] font-semibold text-gray-400 leading-tight -mt-0.5 uppercase tracking-wider">{page.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              className="w-9 h-9 rounded-full bg-cream hover:bg-gray-100 flex items-center justify-center btn relative"
              aria-label="Bildirimler"
              onClick={() => setNotifOpen(true)}
            >
              <Bell size={16} className="text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#e3d10d' }}></span>
            </button>
          </div>
        </div>
      </header>
      <NotificationPopup
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onDelete={handleDelete}
      />
    </>
  )
}
