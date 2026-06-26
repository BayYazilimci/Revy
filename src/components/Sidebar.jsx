import { useState, useRef, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { Building2, Compass, Heart, Bookmark, Users, User, EllipsisVertical, Plus, Bot, Sun, Bell, Calendar, Home, Search, ShieldCheck } from 'lucide-react'
import NotificationPopup from './ui/NotificationPopup'
import { TabContext } from '../App'

const navItems = [
  { key: 'anasayfa', label: 'Ana Sayfa', icon: Home },
  { key: 'kesfet', label: 'Keşfet', icon: Compass },
  { key: 'gunluk', label: 'Günlük', icon: Sun },
  { key: 'randevular', label: 'Randevular', icon: Calendar },
  { key: 'ai-asistan', label: 'AI Asistan', icon: Bot },
  { key: 'ev-bulucu', label: 'Ev Bulucu', icon: Search },
  { key: 'ilanlarim', label: 'Portföyüm', icon: Bookmark },
  { key: 'listeler', label: 'Listeler', icon: Heart },
  { key: 'musteriler', label: 'Müşteriler', icon: Users },
  { key: 'admin', label: 'Denetim Paneli', icon: ShieldCheck },
]

const overflowKeys = ['musteriler', 'ai-asistan', 'ev-bulucu', 'randevular', 'gunluk', 'ilanlarim']
const mainNavItems = navItems.filter(item => !overflowKeys.includes(item.key))
const moreNavItems = navItems.filter(item => overflowKeys.includes(item.key))

export default function Sidebar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useApp()
  const { activeTab, setActiveTab } = useContext(TabContext)

  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const menuRef = useRef(null)

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

  return (
    <>
      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-cardBorder shadow-[0_-4px_20px_rgba(0,0,0,.06)]">
        <div className="flex items-center justify-around px-2 py-1.5">
          {mainNavItems.slice(0, 2).map(item => {
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

          {/* Daha Butonu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMoreMenu(prev => !prev)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                showMoreMenu || moreNavItems.some(i => isActive(i.key)) ? 'text-deep' : 'text-gray-400 hover:text-deep'
              }`}
            >
              <div className="relative">
                <EllipsisVertical size={20} strokeWidth={showMoreMenu || moreNavItems.some(i => isActive(i.key)) ? 2.5 : 1.5} />
                {(showMoreMenu || moreNavItems.some(i => isActive(i.key))) && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{ background: '#e3d10d' }} />
                )}
              </div>
              <span className={`text-[9px] font-bold ${showMoreMenu || moreNavItems.some(i => isActive(i.key)) ? '' : 'font-semibold'}`}>Daha</span>
            </button>

            {showMoreMenu && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-xl border border-cardBorder overflow-hidden min-w-[170px] py-1">
                <button
                  onClick={() => {
                    navigate('/ilan-olustur')
                    setShowMoreMenu(false)
                  }}
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
                {moreNavItems.map(item => {
                  const Icon = item.icon
                  const active = isActive(item.key)
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setActiveTab(item.key); navigate('/')
                        setShowMoreMenu(false)
                      }}
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
              <img
                src={user?.avatar || 'https://i.pravatar.cc/100?img=16'}
                alt=""
                className="w-5 h-5 rounded-full object-cover"
              />
              {isActive('hesap') && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{ background: '#e3d10d' }} />
              )}
            </div>
            <span className="text-[9px] font-semibold">Hesap</span>
          </button>
        </div>
      </nav>
      <NotificationPopup isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

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
          {navItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.key)
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
            <img src={user?.avatar || 'https://i.pravatar.cc/100?img=16'} alt="Profil" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
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
