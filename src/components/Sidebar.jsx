import { useState, useRef, useEffect, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notificationsApi } from '../api/notifications'
import { useWebsites } from '../hooks/useWebsites'
import { Building2, Compass, Heart, Bookmark, Users, EllipsisVertical, Plus, Bot, Sun, Bell, Calendar, Home, Search, ShieldCheck, Globe, ChevronDown, Image, Film, Eye, Layers, Plane } from 'lucide-react'
import DefaultAvatar from './DefaultAvatar'
import NotificationPopup from './ui/NotificationPopup'
import { TabContext } from '../context/TabContext'

const navItems = [
  { key: 'anasayfa', label: 'Ana Sayfa', icon: Home },
  { key: 'kesfet', label: 'Keşfet', icon: Compass },
  { key: 'gunluk', label: 'Günlük', icon: Sun },
  { key: 'randevular', label: 'Randevular', icon: Calendar },
  { key: 'ai-asistan', label: 'FSBOAI', icon: Bot, hasSubItems: true },
  { key: 'ilanlarim', label: 'Portföyüm', icon: Bookmark },
  { key: 'listeler', label: 'Listeler', icon: Heart },
  { key: 'musteriler', label: 'Müşteriler', icon: Users },
  { key: 'admin', label: 'Denetim Paneli', icon: ShieldCheck },
  { key: 'web-builder', label: 'Web Sitesi Kur', icon: Globe },
]

const aiSubItems = [
  { key: 'ai-tumu', label: 'Tüm AI Araçları', icon: Bot, route: '/ai' },
  { key: 'ev-bulucu', label: 'Ev Bulucu', icon: Search, route: '/ai/ev-bulucu' },
  { key: 'ai-gorsel', label: 'Görsel Oluştur', icon: Image, route: '/ai/gorsel' },
  { key: 'ai-video', label: 'Video Oluştur', icon: Film, route: '/ai/video' },
  { key: 'ai-sanal-tur', label: 'Sanal Tur', icon: Eye, route: '/ai/sanal-tur' },
  { key: 'ai-3d', label: '3D Modelleme', icon: Layers, route: '/ai/3d-ev' },
  { key: 'ai-drone', label: 'Drone Çekimi', icon: Plane, route: '/ai/drone' },
]

const overflowKeys = ['musteriler', 'ai-asistan', 'randevular', 'gunluk', 'ilanlarim', 'admin', 'web-builder']
const mainNavItems = navItems.filter(item => !overflowKeys.includes(item.key))
const moreNavItems = navItems.filter(item => overflowKeys.includes(item.key))

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { activeTab, setActiveTab } = useContext(TabContext)
  const { websites } = useWebsites()

  const isAdmin = user?.role === 'admin'
  const visibleNavItems = navItems.filter(item => item.key !== 'admin' || isAdmin)
  const visibleMainNavItems = mainNavItems.filter(item => item.key !== 'admin' || isAdmin)
  const visibleMoreNavItems = moreNavItems.filter(item => item.key !== 'admin' || isAdmin)

  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showWebsites, setShowWebsites] = useState(false)
  const [showAiMenu, setShowAiMenu] = useState(false)
  const menuRef = useRef(null)

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

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMoreMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (key) => activeTab === key

  const publishedSites = websites.filter(w => w.status === 'published')
  const draftSites = websites.filter(w => w.status === 'draft')

  return (
    <>
      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-cardBorder shadow-[0_-4px_20px_rgba(0,0,0,.06)]">
        <div className="flex items-center justify-around px-2 py-1.5">
          {visibleMainNavItems.slice(0, 2).map(item => {
            const Icon = item.icon
            const active = isActive(item.key)
            return (
              <button
                key={item.key}
                onClick={() => { setActiveTab(item.key); navigate('/') }}
                className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                  active ? 'text-deep' : 'text-gray-400 hover:text-deep'
                }`}
              >
                <div className={`relative ${active ? '-mt-0.5' : ''}`}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{ background: '#e3d10d' }} />
                  )}
                </div>
                <span className={`text-[9px] font-bold ${active ? '' : 'font-semibold'}`}>{item.label}</span>
              </button>
            )
          })}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMoreMenu(prev => !prev)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                showMoreMenu || visibleMoreNavItems.some(i => isActive(i.key)) ? 'text-deep' : 'text-gray-400 hover:text-deep'
              }`}
            >
              <div className="relative">
                <EllipsisVertical size={20} strokeWidth={showMoreMenu || visibleMoreNavItems.some(i => isActive(i.key)) ? 2.5 : 1.5} />
                {(showMoreMenu || visibleMoreNavItems.some(i => isActive(i.key))) && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{ background: '#e3d10d' }} />
                )}
              </div>
              <span className={`text-[9px] font-bold ${showMoreMenu || visibleMoreNavItems.some(i => isActive(i.key)) ? '' : 'font-semibold'}`}>Daha</span>
            </button>

            {showMoreMenu && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-xl border border-cardBorder overflow-hidden min-w-[170px] py-1 max-h-[70vh] overflow-y-auto">
                <button
                  onClick={() => { navigate('/ilan-olustur'); setShowMoreMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-500 hover:text-deep hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#e3d10d' }}>
                    <Plus size={15} strokeWidth={2.5} style={{ color: '#1a2a3a' }} />
                  </div>
                  İlan Ver
                </button>
                <button
                  onClick={() => { setNotifOpen(true); setShowMoreMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-500 hover:text-deep hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(227,209,13,.15)' }}>
                    <Bell size={15} strokeWidth={2.5} style={{ color: '#e3d10d' }} />
                  </div>
                  Bildirimler
                </button>
                {visibleMoreNavItems.map(item => {
                  const Icon = item.icon
                  const active = isActive(item.key)
                  if (item.key === 'ai-asistan') {
                    return (
                      <div key={item.key}>
                        <button
                          onClick={() => { navigate('/ai'); setShowMoreMenu(false) }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                            active ? 'text-deep bg-gray-50' : 'text-gray-500 hover:text-deep hover:bg-gray-50'
                          }`}
                        >
                          <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
                          {item.label}
                          <ChevronDown size={12} className="ml-auto" />
                        </button>
                        <div className="bg-gray-50 border-t border-gray-100">
                          {aiSubItems.map(sub => {
                            const SubIcon = sub.icon
                            return (
                              <button
                                key={sub.key}
                                onClick={() => { navigate(sub.route); setShowMoreMenu(false) }}
                                className="w-full flex items-center gap-2 px-6 py-2 text-[11px] font-medium text-gray-500 hover:text-deep hover:bg-gray-100 transition-colors"
                              >
                                <SubIcon size={10} />
                                <span>{sub.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }
                  if (item.key === 'admin') {
                    return (
                      <button
                        key={item.key}
                        onClick={() => { navigate('/admin'); setShowMoreMenu(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                          active ? 'text-deep bg-gray-50' : 'text-gray-500 hover:text-deep hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
                        {item.label}
                      </button>
                    )
                  }
                  if (item.key === 'web-builder') {
                    return (
                      <div key={item.key}>
                        <button
                          onClick={() => { navigate('/web-site-olustur'); setShowMoreMenu(false) }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                            active ? 'text-deep bg-gray-50' : 'text-gray-500 hover:text-deep hover:bg-gray-50'
                          }`}
                        >
                          <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
                          {item.label}
                          <ChevronDown size={12} className="ml-auto" />
                        </button>
                        {websites.length > 0 && (
                          <div className="bg-gray-50 border-t border-gray-100">
                            {publishedSites.map(site => (
                              <button
                                key={site.id}
                                onClick={() => { navigate(`/web-site-ayarlar/${site.id}`); setShowMoreMenu(false) }}
                                className="w-full flex items-center gap-2 px-6 py-2 text-[11px] font-medium text-gray-600 hover:text-deep hover:bg-gray-100 transition-colors"
                              >
                                <Globe size={10} className="text-green-500" />
                                <span className="truncate">{site.name}</span>
                                <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded bg-green-100 text-green-600 font-bold">yayında</span>
                              </button>
                            ))}
                            {draftSites.map(site => (
                              <button
                                key={site.id}
                                onClick={() => { navigate(`/web-site-ayarlar/${site.id}`); setShowMoreMenu(false) }}
                                className="w-full flex items-center gap-2 px-6 py-2 text-[11px] font-medium text-gray-500 hover:text-deep hover:bg-gray-100 transition-colors"
                              >
                                <Globe size={10} className="text-gray-400" />
                                <span className="truncate">{site.name}</span>
                                <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-bold">taslak</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }
                  return (
                    <button
                      key={item.key}
                      onClick={() => { setActiveTab(item.key); navigate('/'); setShowMoreMenu(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                        active ? 'text-deep bg-gray-50' : 'text-gray-500 hover:text-deep hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => { setActiveTab('listeler'); navigate('/') }}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
              isActive('listeler') ? 'text-deep' : 'text-gray-400 hover:text-deep'
            }`}
          >
            <div className={`relative ${isActive('listeler') ? '-mt-0.5' : ''}`}>
              <Heart size={20} strokeWidth={isActive('listeler') ? 2.5 : 1.5} />
              {isActive('listeler') && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{ background: '#e3d10d' }} />
              )}
            </div>
            <span className={`text-[9px] font-bold ${isActive('listeler') ? '' : 'font-semibold'}`}>Listeler</span>
          </button>

          <button
            onClick={() => { setActiveTab('hesap'); navigate('/') }}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
              isActive('hesap') ? 'text-deep' : 'text-gray-400 hover:text-deep'
            }`}
          >
            <div className="relative">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <DefaultAvatar className="w-5 h-5 rounded-full" size={20} />
              )}
              {isActive('hesap') && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{ background: '#e3d10d' }} />
              )}
            </div>
            <span className="text-[9px] font-semibold">Hesap</span>
          </button>
        </div>
      </nav>
      <NotificationPopup
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onDelete={handleDelete}
      />

      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 z-40 h-full w-[260px] hidden lg:flex flex-col" style={{ background: '#1a2a3a' }}>
        <button
          onClick={() => { setActiveTab('anasayfa'); navigate('/') }}
          className="flex items-center gap-3 px-6 py-5 border-b border-white/10 text-left w-full hover:opacity-85 transition-opacity outline-none"
        >
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0" style={{ background: '#e3d10d' }}>
            <Building2 size={17} strokeWidth={2.5} style={{ color: '#1a2a3a' }} />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight leading-tight text-white">FSBO</h1>
            <p className="text-[8px] font-semibold text-white/40 leading-tight -mt-0.5 uppercase tracking-wider">Emlak Paneli</p>
          </div>
        </button>

        <div className="px-3 pt-3">
          <button
            onClick={() => navigate('/ilan-olustur')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold transition-all duration-200 btn shadow-lg"
            style={{ background: '#e3d10d', color: '#1a2a3a', boxShadow: '0 4px 16px rgba(227,209,13,.25)' }}
          >
            <Plus size={18} strokeWidth={2.5} />
            İlan Oluştur
          </button>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.key)

            if (item.key === 'ai-asistan') {
              return (
                <div key={item.key}>
                  <button
                    onClick={() => { navigate('/ai'); setShowAiMenu(!showAiMenu) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                      active ? 'text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                    style={active ? { background: 'rgba(227,209,13,.15)' } : {}}
                  >
                    <Icon size={18} className={active ? 'text-accent' : ''} />
                    <span className={active ? 'font-extrabold' : ''}>{item.label}</span>
                    <ChevronDown size={14} className={`ml-auto transition-transform ${showAiMenu ? 'rotate-180' : ''}`} />
                    {active && !showAiMenu && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#e3d10d' }} />
                    )}
                  </button>

                  {showAiMenu && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                      {aiSubItems.map(sub => {
                        const SubIcon = sub.icon
                        return (
                          <button
                            key={sub.key}
                            onClick={() => navigate(sub.route)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                              location.pathname === sub.route ? 'text-white bg-white/5' : 'text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <SubIcon size={12} className={location.pathname === sub.route ? 'text-accent' : 'text-white/30'} />
                            <span>{sub.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            if (item.key === 'web-builder') {
              return (
                <div key={item.key}>
                  <button
                    onClick={() => { navigate('/web-site-olustur'); setShowWebsites(!showWebsites) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                      active ? 'text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                    style={active ? { background: 'rgba(227,209,13,.15)' } : {}}
                  >
                    <Icon size={18} className={active ? 'text-accent' : ''} />
                    <span className={active ? 'font-extrabold' : ''}>{item.label}</span>
                    {websites.length > 0 && (
                      <ChevronDown size={14} className={`ml-auto transition-transform ${showWebsites ? 'rotate-180' : ''}`} />
                    )}
                    {active && !showWebsites && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#e3d10d' }} />
                    )}
                  </button>

                  {showWebsites && websites.length > 0 && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                      {publishedSites.map(site => (
                        <button
                          key={site.id}
                          onClick={() => navigate(`/web-site-ayarlar/${site.id}`)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Globe size={10} className="text-green-400 flex-shrink-0" />
                          <span className="truncate">{site.name}</span>
                          <span className="ml-auto text-[7px] px-1 py-0.5 rounded bg-green-500/20 text-green-400 font-bold flex-shrink-0">yayında</span>
                        </button>
                      ))}
                      {draftSites.map(site => (
                        <button
                          key={site.id}
                          onClick={() => navigate(`/web-site-ayarlar/${site.id}`)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Globe size={10} className="text-white/30 flex-shrink-0" />
                          <span className="truncate">{site.name}</span>
                          <span className="ml-auto text-[7px] px-1 py-0.5 rounded bg-white/10 text-white/40 font-bold flex-shrink-0">taslak</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <button
                key={item.key}
                onClick={() => {
                  if (item.key === 'admin') { navigate('/admin') }
                  else { setActiveTab(item.key); navigate('/') }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                  active
                    ? 'text-white shadow-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
                style={active ? { background: 'rgba(227,209,13,.15)' } : {}}
              >
                <Icon size={18} className={active ? 'text-accent' : ''} />
                <span className={active ? 'font-extrabold' : ''}>{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#e3d10d' }} />
                )}
              </button>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200"
            onClick={() => { setActiveTab('hesap'); navigate('/') }}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Profil" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <DefaultAvatar className="w-8 h-8 rounded-full flex-shrink-0" size={32} />
            )}
            <div className="text-left min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user?.name || user?.email || ''}</p>
              <p className="text-[10px] text-white/40 truncate font-medium">{user?.email || ''}</p>
            </div>
          </button>
        </div>
      </aside>
    </>
  )
}
