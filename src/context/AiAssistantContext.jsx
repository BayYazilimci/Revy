import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useApp } from './AppContext'

const AiAssistantContext = createContext(null)

/* eslint-disable react/prop-types */

export function AiAssistantProvider({ children }) {
  const { addToast } = useApp()
  const [searchMemory, setSearchMemory] = useState([])
  const [backgroundTasks, setBackgroundTasks] = useState([])
  const [notificationEnabled, setNotificationEnabled] = useState(true)
  const [pendingNotification, setPendingNotification] = useState(null)
  const [whatsappLog, setWhatsappLog] = useState([])
  const taskIdCounter = useRef(0)

  const recordSearch = useCallback((searchData) => {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      query: searchData.query || '',
      filters: searchData.filters || {},
      resultCount: searchData.resultCount || 0,
      rating: 0,
      timestamp: Date.now(),
      notified: false,
    }
    setSearchMemory(prev => [entry, ...prev])
    return entry
  }, [])

  const rateSearch = useCallback((searchId, rating) => {
    setSearchMemory(prev => prev.map(s =>
      s.id === searchId ? { ...s, rating } : s
    ))

    if (rating >= 3) {
      const entry = searchMemory.find(s => s.id === searchId)
      if (entry) {
        setPendingNotification({
          id: 'notif-' + Date.now().toString(36),
          searchId: entry.id,
          query: entry.query || 'Filtre araması',
          resultCount: entry.resultCount,
          timestamp: Date.now(),
        })
      }
    }
  }, [searchMemory])

  const dismissNotification = useCallback(() => {
    const notif = pendingNotification
    if (notif) {
      setSearchMemory(prev => prev.map(s =>
        s.id === notif.searchId ? { ...s, notified: true } : s
      ))
    }
    setPendingNotification(null)
  }, [pendingNotification])

  const handleNotificationAction = useCallback((action) => {
    const notif = pendingNotification
    if (!notif) return

    dismissNotification()

    if (action === 'nothing') return

    const msg = `[WhatsApp Mesajı - ${new Date().toLocaleTimeString('tr-TR')}]\n` +
      `Kime: Müşteri\n` +
      `Konu: "${notif.query}" araması hakkında\n` +
      `Mesaj: Merhaba, "${notif.query}" aramanızla ilgili ${notif.resultCount} adet uygun ilan bulduk.`

    let actionLabel = ''
    if (action === 'whatsapp-bilgi') {
      actionLabel = 'WhatsApp ile bilgilendir'
    } else if (action === 'whatsapp-randevu') {
      actionLabel = 'Randevu ayarla'
    } else if (action === 'whatsapp-detay') {
      actionLabel = 'Detaylı rapor gönder'
    }

    setWhatsappLog(prev => [{
      id: 'wa-' + Date.now().toString(36),
      action: actionLabel,
      message: msg,
      searchQuery: notif.query,
      timestamp: Date.now(),
    }, ...prev])

    addToast('WhatsApp mesajı hazırlandı (test modu)')
  }, [pendingNotification, dismissNotification, addToast])

  const getGoodSearches = useCallback(() => {
    return searchMemory.filter(s => s.rating >= 3)
  }, [searchMemory])

  const sendToBackground = useCallback((task) => {
    const id = 'task-' + (++taskIdCounter.current)
    const bgTask = {
      id,
      label: task.label || 'İşlem',
      type: task.type || 'search',
      status: 'running',
      startedAt: Date.now(),
      data: task.data || {},
    }
    setBackgroundTasks(prev => [...prev, bgTask])
    addToast(`"${bgTask.label}" arka planda çalışmaya başladı`)

    setTimeout(() => {
      setBackgroundTasks(prev => prev.map(t =>
        t.id === id ? { ...t, status: 'completed', completedAt: Date.now() } : t
      ))
      if (notificationEnabled) {
        addToast(`"${bgTask.label}" tamamlandı!`)
      }
    }, 4000)

    return id
  }, [addToast, notificationEnabled])

  const removeBackgroundTask = useCallback((taskId) => {
    setBackgroundTasks(prev => prev.filter(t => t.id !== taskId))
  }, [])

  useEffect(() => {
    if (!notificationEnabled) return
    const toNotify = searchMemory.filter(s => s.rating >= 3 && !s.notified && !pendingNotification)
    if (toNotify.length === 0) return

    const timer = setTimeout(() => {
      toNotify.forEach(s => {
        setPendingNotification({
          id: 'notif-' + Date.now().toString(36),
          searchId: s.id,
          query: s.query || 'Filtre araması',
          resultCount: s.resultCount,
          timestamp: Date.now(),
        })
      })
    }, 3000)

    return () => clearTimeout(timer)
  }, [searchMemory, notificationEnabled, pendingNotification])

  return (
    <AiAssistantContext.Provider value={{
      searchMemory,
      recordSearch,
      rateSearch,
      getGoodSearches,
      backgroundTasks,
      sendToBackground,
      removeBackgroundTask,
      notificationEnabled,
      setNotificationEnabled,
      pendingNotification,
      dismissNotification,
      handleNotificationAction,
      whatsappLog,
    }}>
      {children}
    </AiAssistantContext.Provider>
  )
}

export function useAiAssistant() {
  const ctx = useContext(AiAssistantContext)
  if (!ctx) throw new Error('useAiAssistant must be used within AiAssistantProvider')
  return ctx
}
