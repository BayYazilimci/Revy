import { createContext, useState, lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider, useApp } from './context/AppContext'
import { AiAssistantProvider } from './context/AiAssistantContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Footer from './components/Footer'
import Toast from './components/Toast'
import ErrorBoundary from './errors/ErrorBoundary'
import AppRouter from './router'
import LoadingState from './components/ui/LoadingState'
import { ROUTES } from './config'
import Onboarding from './components/Onboarding'
import BanScreen from './components/BanScreen'

const ONBOARDING_KEY = 'fsbo_onboarding_seen'

const Discover = lazy(() => import('./pages/Discover'))
const MyListings = lazy(() => import('./pages/MyListings'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Customers = lazy(() => import('./pages/Customers'))
const Account = lazy(() => import('./pages/Account'))
const AiAssistant = lazy(() => import('./pages/AiAssistant'))
const Daily = lazy(() => import('./pages/Daily'))
const EvBulucu = lazy(() => import('./pages/EvBulucu'))
const Appointments = lazy(() => import('./pages/Appointments'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

export const TabContext = createContext()

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <LoadingState type="spinner" />
    </div>
  )
}

function AppLayout() {
  const { isAuthenticated, user, logout, refreshUser } = useAuth()
  const { addToast } = useApp()
  const [activeTab, setActiveTab] = useState('anasayfa')
  const [tabParams, setTabParams] = useState({})
  const [showOnboarding, setShowOnboarding] = useState(false)
  // Hesap durumu doğrudan backend'den gelen kullanıcıdan okunur
  const accountStatus = user?.status || 'aktif'
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated && !localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true)
    }
  }, [isAuthenticated])

  // Hesap durumu admin tarafından değişmiş olabilir → periyodik olarak backend'den tazele
  useEffect(() => {
    if (!isAuthenticated) return
    const timer = setInterval(() => { refreshUser() }, 30000)
    return () => clearInterval(timer)
  }, [isAuthenticated, refreshUser])

  // Appointment Reminder System
  useEffect(() => {
    if (!isAuthenticated) return

    const checkReminders = () => {
      try {
        const stored = localStorage.getItem('fsbo_appointments')
        if (!stored) return
        const appointments = Object.values(JSON.parse(stored))
        
        // Filter approved appointments
        const activeApps = appointments.filter(app => app.status === 'onaylandı')
        
        const now = new Date()
        const remindedAppsStr = localStorage.getItem('fsbo_reminded_appointments') || '[]'
        const remindedApps = JSON.parse(remindedAppsStr)
        let updatedReminded = [...remindedApps]
        let hasNewReminder = false

        activeApps.forEach(app => {
          // Parse appointment date & time
          const appDateTime = new Date(`${app.date}T${app.time}`)
          const diffMs = appDateTime - now
          const diffMins = diffMs / 60000

          // If starting in next 30 minutes (and not already reminded)
          if (diffMins > 0 && diffMins <= 30 && !remindedApps.includes(app.id)) {
            // Show toast
            addToast(`Yaklaşan Randevu: ${app.title} (${app.time})`, 'info')
            
            // Add system notification
            const notifStorageKey = 'fsbo_notifications'
            const existingNotifsStr = localStorage.getItem(notifStorageKey) || '[]'
            let existingNotifs = []
            try {
              existingNotifs = JSON.parse(existingNotifsStr)
            } catch(e) {}

            const newNotif = {
              id: 'rem_' + app.id + '_' + Date.now(),
              type: 'calendar',
              title: 'Yaklaşan Randevu',
              description: `"${app.title}" randevunuz ${app.time} saatinde başlayacaktır. Konum: ${app.location || 'Belirtilmedi'}`,
              time: 'Şimdi',
              read: false
            }

            localStorage.setItem(notifStorageKey, JSON.stringify([newNotif, ...existingNotifs]))
            updatedReminded.push(app.id)
            hasNewReminder = true
          }
        });

        if (hasNewReminder) {
          localStorage.setItem('fsbo_reminded_appointments', JSON.stringify(updatedReminded))
        }
      } catch (err) {
        console.error('Reminder check failed:', err)
      }
    }

    // Run check on mount and then every 30 seconds
    checkReminders()
    const timer = setInterval(checkReminders, 30000)
    return () => clearInterval(timer)
  }, [isAuthenticated, addToast])

  if (!isAuthenticated) {
    return <AppRouter />
  }

  // Yasaklı hesap → her sayfanın önünde tam ekran yasak ekranı (o hesap için)
  if (accountStatus === 'banli') {
    return <BanScreen account={user} onLogout={logout} />
  }

  const pathname = location.pathname
  if (user && user.profileCompleted === false && pathname !== ROUTES.PROFILE_SETUP) {
    return <Navigate to={ROUTES.PROFILE_SETUP} replace />
  }

  // Denetim paneli kendi navbar'ı ile tam ekran açılır (ana sidebar/header olmadan)
  // Yalnızca admin rolü erişebilir
  if (pathname === ROUTES.ADMIN) {
    if (user?.role !== 'admin') return <Navigate to={ROUTES.HOME} replace />
    return <AppRouter />
  }

  const isProfileSetup = pathname === ROUTES.PROFILE_SETUP
  const isRoutePage = pathname.match(/^\/ilan\//) || pathname === '/ilan-olustur' || pathname.match(/^\/ai/) || pathname === '/gunluk' || pathname === '/randevular' || pathname === '/landing' || pathname === '/ai/ev-bulucu' || isProfileSetup

  if (isProfileSetup) {
    return <AppRouter />
  }

  const renderPage = () => {
    if (isRoutePage) {
      return <AppRouter />
    }
    switch (activeTab) {
      case 'anasayfa': return <Dashboard />
      case 'ai-asistan': return <AiAssistant />
      case 'ilanlarim': return <MyListings />
      case 'listeler': return <Favorites />
      case 'musteriler': return <Customers />
      case 'hesap': return <Account />
      case 'gunluk': return <Daily />
      case 'randevular': return <Appointments />
      case 'ev-bulucu': return <EvBulucu />
      case 'kesfet':
      default: return <Discover />
    }
  }

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab, tabParams, setTabParams }}>
      <div className="min-h-screen bg-cream antialiased flex flex-col">
        {showOnboarding && (
          <Onboarding onComplete={() => {
            localStorage.setItem(ONBOARDING_KEY, 'true')
            setShowOnboarding(false)
          }} />
        )}
        <Sidebar />
        <Header />
        {accountStatus === 'kisitli' && (
          <div className="lg:ml-[260px] bg-amber-500/10 border-b border-amber-300/50 px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 text-[12px] font-bold text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Hesabınız bir yönetici tarafından kısıtlandı. İlan oluşturma ve mesajlaşma gibi bazı özellikler geçici olarak devre dışı.
          </div>
        )}
        <main className={`flex-1 flex flex-col lg:ml-[260px] ${activeTab === 'gunluk' || location.pathname === '/gunluk' || activeTab === 'randevular' || location.pathname === '/randevular' ? 'pb-0' : 'pb-[68px]'} lg:pb-0 overflow-y-auto max-h-screen`}>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              {renderPage()}
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
        <Toast />
      </div>
    </TabContext.Provider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AiAssistantProvider>
            <ErrorBoundary>
              <AppLayout />
            </ErrorBoundary>
          </AiAssistantProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
