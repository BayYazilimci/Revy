import { useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TabContext } from '../App'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { useAppointments } from '../hooks/useAppointments'
import { useCustomers } from '../hooks/useCustomers'
import { usePropertyData } from '../context/PropertiesContext'
import { MY_LISTINGS_ID } from '../data/lists'
import { getAllPriceRatings } from '../utils/priceRating'
import {
  Building2, Compass, Bookmark, Users, Bot, Sun, Calendar,
  Plus, ArrowUpRight, MapPin, Clock, ArrowRight, User, Phone, CheckCircle2, ChevronRight, TrendingDown, TrendingUp, Minus, CalendarDays, ExternalLink
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { lists } = useApp()
  const { appointments, loading: appointmentsLoading } = useAppointments()
  const { customers, loading: customersLoading } = useCustomers()
  const { setActiveTab } = useContext(TabContext)
  const { dailyProperties, allProperties: allPropertiesData } = usePropertyData()

  // Price ratings for the daily listings comparison
  const priceRatings = useMemo(() => getAllPriceRatings(allPropertiesData), [allPropertiesData])

  // User's own portfolio size
  const myPortfolioCount = lists[MY_LISTINGS_ID]?.items?.length || 0

  // Date formatting for today
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [])

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  // Filter today's appointments
  const todayAppointments = useMemo(() => {
    if (!appointments) return []
    return appointments
      .filter(app => app.date === todayStr && app.status !== 'iptal')
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [appointments, todayStr])

  // Get active appointments count
  const pendingAppointmentsCount = useMemo(() => {
    if (!appointments) return 0
    return appointments.filter(app => app.status === 'bekliyor').length
  }, [appointments])

  // Sample only 4 today's new listings for the dashboard grid
  const featuredDailyListings = useMemo(() => {
    return (dailyProperties || []).slice(0, 4)
  }, [])

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-cream overflow-y-auto pb-10">
      {/* 1. Header Banner */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/20 p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
             style={{ background: 'linear-gradient(135deg, #1a2a3a 0%, #1e1b2e 100%)' }}>
          
          {/* Decorative background gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-accent/20 border border-accent/20 flex-shrink-0 animate-pulse">
              <img
                src={user?.avatar || 'https://i.pravatar.cc/100?img=16'}
                alt=""
                className="w-12 h-12 rounded-xl object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Merhaba, {user?.name || user?.username || 'Emlakçı'}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-white/70 mt-1 font-medium max-w-lg leading-relaxed">
                İşte emlak portföyünüzün ve bugünkü programınızın güncel özeti.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-end sm:items-end gap-1.5 sm:text-right bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm self-stretch sm:self-auto justify-center">
            <div className="text-[10px] uppercase tracking-wider text-accent font-bold">Bugünün Tarihi</div>
            <div className="text-xs font-extrabold text-white">{formattedDate}</div>
          </div>
        </div>
      </div>

      {/* 2. Key Stats Grid */}
      <div className="px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
        {/* Stat 1: Portföyüm */}
        <button
          onClick={() => { setActiveTab('ilanlarim') }}
          className="flex flex-col p-4 bg-white rounded-2xl border border-cardBorder text-left hover:border-accent hover:shadow-md transition-all duration-300 group relative overflow-hidden outline-none"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform" />
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center mb-4 transition-colors group-hover:bg-accent/25">
            <Bookmark size={18} style={{ color: '#e3d10d' }} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black text-deep leading-none">{myPortfolioCount}</span>
          <span className="text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-wide">Portföyüm</span>
          <span className="text-[10px] text-gray-400 mt-1 font-medium">Bana özel kaydedilenler</span>
        </button>

        {/* Stat 2: Bugünkü Randevular */}
        <button
          onClick={() => { setActiveTab('randevular') }}
          className="flex flex-col p-4 bg-white rounded-2xl border border-cardBorder text-left hover:border-blue-400 hover:shadow-md transition-all duration-300 group relative overflow-hidden outline-none"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform" />
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 transition-colors group-hover:bg-blue-500/20">
            <Calendar size={18} className="text-blue-500" strokeWidth={2.5} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-deep leading-none">{todayAppointments.length}</span>
            {pendingAppointmentsCount > 0 && (
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                {pendingAppointmentsCount} bekliyor
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-wide">Bugünkü Randevular</span>
          <span className="text-[10px] text-gray-400 mt-1 font-medium">Planlanan takvim görüşmeleri</span>
        </button>

        {/* Stat 3: Bugünkü Yeni İlanlar */}
        <button
          onClick={() => { setActiveTab('gunluk') }}
          className="flex flex-col p-4 bg-white rounded-2xl border border-cardBorder text-left hover:border-emerald-400 hover:shadow-md transition-all duration-300 group relative overflow-hidden outline-none"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform" />
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 transition-colors group-hover:bg-emerald-500/20">
            <Sun size={18} className="text-emerald-500" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black text-deep leading-none">{dailyProperties.length}</span>
          <span className="text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-wide">Bugün Yeni İlan</span>
          <span className="text-[10px] text-gray-400 mt-1 font-medium">Son 24 saatte eklenen ilanlar</span>
        </button>

        {/* Stat 4: Müşterilerim */}
        <button
          onClick={() => { setActiveTab('musteriler') }}
          className="flex flex-col p-4 bg-white rounded-2xl border border-cardBorder text-left hover:border-purple-400 hover:shadow-md transition-all duration-300 group relative overflow-hidden outline-none"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform" />
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 transition-colors group-hover:bg-purple-500/20">
            <Users size={18} className="text-purple-500" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black text-deep leading-none">{customers.length}</span>
          <span className="text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-wide">Müşterilerim</span>
          <span className="text-[10px] text-gray-400 mt-1 font-medium">Aktif takip edilen alıcı/satıcı</span>
        </button>
      </div>

      {/* 3. Main Split Widgets Section */}
      <div className="px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Appointments & Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Appointments Widget */}
          <div className="bg-white rounded-3xl border border-cardBorder shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-cardBorder flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Calendar size={13} strokeWidth={2.5} />
                </div>
                <h2 className="text-sm font-extrabold text-deep">Bugünkü Randevularınız</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream border border-cardBorder text-deep">
                {todayAppointments.length} Görüşme
              </span>
            </div>

            <div className="p-4 flex-1">
              {appointmentsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-6">
                  <div className="w-14 h-14 rounded-2xl bg-cream flex items-center justify-center mb-3">
                    <CalendarDays size={22} className="text-gray-300" />
                  </div>
                  <h3 className="text-xs font-extrabold text-deep">Bugün Randevu Yok</h3>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-xs leading-normal">
                    Bugün için planlanmış bir görüşmeniz görünmüyor. Takviminizi planlamaya ne dersiniz?
                  </p>
                  <button
                    onClick={() => { setActiveTab('randevular') }}
                    className="mt-4 px-4 py-2 rounded-xl text-[10px] font-extrabold bg-accent text-deep shadow-sm btn"
                  >
                    Yeni Randevu Planla
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((app) => (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-2xl border border-cardBorder bg-cream/30 hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex flex-col items-center justify-center flex-shrink-0">
                          <Clock size={14} className="text-blue-500" />
                          <span className="text-[8px] font-black text-blue-500 -mt-0.5">{app.time}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-extrabold text-deep leading-snug truncate group-hover:text-blue-600 transition-colors">
                            {app.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[10px] font-semibold text-gray-400">
                            <span className="flex items-center gap-1">
                              <User size={10} />
                              {app.attendeeName}
                            </span>
                            {app.location && (
                              <span className="flex items-center gap-0.5 truncate">
                                <MapPin size={9} />
                                {app.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 border-cardBorder pt-2 sm:pt-0">
                        <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
                          Onaylandı
                        </span>
                        <button
                          onClick={() => { setActiveTab('randevular') }}
                          className="w-7 h-7 rounded-lg bg-white border border-cardBorder flex items-center justify-center text-gray-400 hover:text-deep hover:border-gray-300 shadow-sm btn flex-shrink-0"
                          title="Takvimde Göster"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {todayAppointments.length > 0 && (
              <div className="bg-cream/40 border-t border-cardBorder px-5 py-3 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-semibold">Tüm planlarınızı takvimde yönetin.</span>
                <button
                  onClick={() => { setActiveTab('randevular') }}
                  className="text-[10px] font-extrabold text-blue-500 flex items-center gap-0.5 hover:underline"
                >
                  Takvim Görünümüne Git
                  <ArrowRight size={11} />
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions Hub */}
          <div className="bg-white rounded-3xl border border-cardBorder shadow-sm p-5">
            <h2 className="text-sm font-extrabold text-deep mb-4">Hızlı Erişim Eylemleri</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => navigate('/ilan-olustur')}
                className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-cream border border-cardBorder hover:border-accent hover:bg-accent/5 transition-all btn"
              >
                <div className="w-9 h-9 rounded-xl bg-accent/25 flex items-center justify-center mb-2" style={{ color: '#1e1b2e' }}>
                  <Plus size={16} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black text-deep uppercase tracking-wider">İlan Oluştur</span>
              </button>

              <button
                onClick={() => { setActiveTab('ai-asistan') }}
                className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-cream border border-cardBorder hover:border-purple-400 hover:bg-purple-50/5 transition-all btn"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center mb-2 text-purple-500">
                  <Bot size={16} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black text-deep uppercase tracking-wider">AI Asistan</span>
              </button>

              <button
                onClick={() => { setActiveTab('randevular') }}
                className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-cream border border-cardBorder hover:border-blue-400 hover:bg-blue-50/5 transition-all btn"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center mb-2 text-blue-500">
                  <Calendar size={16} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black text-deep uppercase tracking-wider">Takvimi Aç</span>
              </button>

              <button
                onClick={() => { setActiveTab('musteriler') }}
                className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-cream border border-cardBorder hover:border-emerald-400 hover:bg-emerald-50/5 transition-all btn"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-2 text-emerald-500">
                  <Users size={16} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black text-deep uppercase tracking-wider">Müşteriler</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: AI Assistant Quick Card & Short Metrics Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* AI Assistant Quick Card */}
          <div className="rounded-3xl border border-white/10 p-5 shadow-lg text-white relative overflow-hidden flex flex-col justify-between min-h-[220px]"
               style={{ background: 'linear-gradient(135deg, #1e1b2e 0%, #2c1a4d 100%)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                  <Bot size={16} />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">FSBO AI Destek</span>
              </div>
              <h3 className="text-sm font-extrabold mt-3 leading-snug">
                Akıllı Fiyat Analizi ve Müşteri Eşleştirme Yapın
              </h3>
              <p className="text-[10px] text-white/60 mt-1 font-medium leading-normal">
                Veritabanındaki yüzlerce ilan arasından en uygun emsal fiyatları yapay zekâ asistanına sorarak anında öğrenin.
              </p>
            </div>

            <button
              onClick={() => { setActiveTab('ai-asistan') }}
              className="relative z-10 w-full mt-4 py-2.5 rounded-xl text-[10px] font-black uppercase text-deep bg-accent hover:brightness-105 transition-all btn flex items-center justify-center gap-1.5 shadow-md shadow-accent/10"
            >
              AI Asistanını Başlat
              <ArrowUpRight size={13} strokeWidth={3} />
            </button>
          </div>

          {/* Quick Stats list (Active vs Passive vs Sold listings) */}
          <div className="bg-white rounded-3xl border border-cardBorder shadow-sm p-4">
            <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3 px-1">Portföy Durumu</h2>
            
            <div className="space-y-2">
              {/* Active */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-deep">Aktif İlanlar</span>
                </div>
                <span className="text-xs font-extrabold text-emerald-600">
                  {allPropertiesData.filter(p => p.status === 'Aktif').length}
                </span>
              </div>

              {/* Passive */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-red-50/50 border border-red-100/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="text-xs font-bold text-deep">Pasif İlanlar</span>
                </div>
                <span className="text-xs font-extrabold text-red-500">
                  {allPropertiesData.filter(p => p.status === 'Pasif').length}
                </span>
              </div>

              {/* Sold */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50/70 border border-gray-200/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  <span className="text-xs font-bold text-deep">Satılanlar / Kiralıklar</span>
                </div>
                <span className="text-xs font-extrabold text-gray-500">
                  {allPropertiesData.filter(p => p.status === 'Satıldı').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Today's New Listings Carousel Section */}
      <div className="px-4 sm:px-6 lg:px-8 mt-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white rounded-3xl border border-cardBorder shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 border-b border-cardBorder pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Sun size={13} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-deep">Bugünkü Yeni İlanlar (Son 24s)</h2>
              </div>
            </div>
            <button
              onClick={() => { setActiveTab('gunluk') }}
              className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-0.5 hover:underline"
            >
              Hepsini Haritada Gör ({dailyProperties.length})
              <ChevronRight size={11} strokeWidth={2.5} />
            </button>
          </div>

          {/* Listings Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredDailyListings.map((prop) => {
              const rating = priceRatings[prop.id]
              const TrendIcon = rating?.rating === 'good' ? TrendingDown : rating?.rating === 'expensive' ? TrendingUp : Minus

              return (
                <div
                  key={prop.id}
                  onClick={() => navigate(`/ilan/${prop.id}`)}
                  className="listing-card bg-cream/20 rounded-2xl border border-cardBorder overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Card Image */}
                  <div className="h-32 bg-gray-100 overflow-hidden relative">
                    <img src={prop.img} alt={prop.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    {prop.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-white/90 text-deep shadow-sm">
                        {prop.badge}
                      </span>
                    )}
                    <span className="absolute bottom-2 left-2 text-xs font-black text-white drop-shadow">
                      {prop.price}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold text-deep line-clamp-1 leading-snug">{prop.title}</h3>
                      <p className="text-[10px] font-medium text-gray-400 truncate mt-0.5">
                        <MapPin size={9} className="inline mr-0.5" />
                        {prop.location}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-cardBorder flex items-center justify-between gap-1 flex-wrap">
                      {/* Price comparative analysis rating */}
                      {rating && rating.rating !== 'neutral' && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[8px] font-extrabold flex items-center gap-0.5"
                          style={{ backgroundColor: rating.bgColor, color: rating.color, border: `1px solid ${rating.borderColor}` }}
                        >
                          <TrendIcon size={8} />
                          {rating.label} %{rating.percentage}
                        </span>
                      )}

                      <span className="text-[9px] font-bold text-gray-400 flex items-center gap-0.5 ml-auto">
                        <Clock size={8} />
                        {prop.time}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
