import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Compass, Heart, Bell } from 'lucide-react'
import NotificationPopup from './ui/NotificationPopup'

const icons = {
  '/': Compass,
  '/favoriler': Heart,
}

export default function Header() {
  const location = useLocation()
  const { addToast } = useApp()
  const [notifOpen, setNotifOpen] = useState(false)
  const Icon = icons[location.pathname] || Compass

  const titles = {
    '/': { title: 'Keşfet', subtitle: 'Tüm Emlaklar' },
    '/favoriler': { title: 'Listelerim', subtitle: 'Favori Listeleri' },
  }
  const page = titles[location.pathname] || { title: 'FSBO', subtitle: 'Emlak Paneli' }

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
      <NotificationPopup isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  )
}
