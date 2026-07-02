import { useEffect, useState } from 'react'
import { X, Bell, Heart, Bookmark, AlertTriangle, Info, Trash2, Calendar } from 'lucide-react'
import Button from './Button'

const ICON_MAP = {
  like: Heart,
  save: Bookmark,
  alert: AlertTriangle,
  system: Info,
  calendar: Calendar,
}

const COLOR_MAP = {
  like: '#dc2626',
  save: '#3b82f6',
  alert: '#d97706',
  system: '#1e1b2e',
  calendar: '#e3d10d',
}

export default function NotificationPopup({ isOpen, onClose, notifications: externalNotifications, onMarkRead, onMarkAllRead, onDelete }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && externalNotifications) {
      setNotifications(externalNotifications)
      setLoading(false)
    }
  }, [isOpen, externalNotifications])

  const items = notifications
  const unreadCount = items.filter(n => !n.read).length

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const markAllRead = () => {
    if (onMarkAllRead) onMarkAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markAsRead = (id) => {
    if (onMarkRead) onMarkRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const deleteNotification = (id, e) => {
    e.stopPropagation()
    if (onDelete) onDelete(id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    if (onDelete) notifications.forEach(n => onDelete(n.id))
    setNotifications([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-modal-fade"
        onClick={onClose}
      />

      <div
        className="
          absolute flex flex-col bg-white shadow-2xl
          right-0 top-0 bottom-0 w-full lg:w-[85vw] lg:max-w-[400px]
          drawer-notif
        "
        onClick={e => e.stopPropagation()}
      >
        <div className="shrink-0 px-5 pt-6 pb-4 border-b border-cardBorder">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md" style={{ background: '#1e1b2e' }}>
                <Bell size={17} style={{ color: '#e3d10d' }} />
              </div>
              <div>
                <h2 className="text-base font-extrabold" style={{ color: '#1e1b2e' }}>Bildirimler</h2>
                {unreadCount > 0 && (
                  <p className="text-[10px] font-semibold text-gray-400 -mt-0.5">{unreadCount} okunmamış</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {items.length > 0 && (
                <Button size="sm" variant="ghost" onClick={clearAll}>
                  Temizle
                </Button>
              )}
              {unreadCount > 0 && (
                <Button size="sm" variant="ghost" onClick={markAllRead}>
                  Okundu
                </Button>
              )}
              <button
                className="modal-close w-8 h-8 rounded-2xl bg-cream flex items-center justify-center"
                onClick={onClose}
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl bg-cream flex items-center justify-center mb-4">
                <Bell size={28} className="text-gray-300" />
              </div>
              <p className="text-sm font-bold" style={{ color: '#1e1b2e' }}>Bildiriminiz bulunmuyor</p>
              <p className="text-xs text-gray-400 mt-1">Yeni bildirimleriniz burada görünecek</p>
            </div>
          ) : (
            items.map(n => {
              const Icon = ICON_MAP[n.type]
              return (
                <button
                  key={n.id}
                  className={`group w-full text-left px-5 py-4 flex items-start gap-3.5 transition-all duration-200 hover:bg-cream btn ${!n.read ? 'bg-cream/60' : ''}`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: COLOR_MAP[n.type] + '18' }}
                  >
                    <Icon size={15} style={{ color: COLOR_MAP[n.type] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-sm ${!n.read ? 'font-extrabold' : 'font-semibold'}`}
                        style={{ color: '#1e1b2e' }}
                      >
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#e3d10d' }} />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.description}</p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-1.5">{n.time}</p>
                  </div>
                  <button
                    className="shrink-0 w-8 h-8 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all duration-200 -mr-1 btn"
                    onClick={(e) => deleteNotification(n.id, e)}
                    title="Sil"
                  >
                    <Trash2 size={13} className="text-gray-400 hover:text-red-500 transition-colors" />
                  </button>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
