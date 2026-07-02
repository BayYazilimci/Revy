import { useState, lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider, useApp } from './context/AppContext'
import { AiAssistantProvider } from './context/AiAssistantContext'
import { PropertiesProvider } from './context/PropertiesContext'
import { appointmentsApi } from './api/appointments'
import { notificationsApi } from './api/notifications'
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
import { TabContext } from './context/TabContext'

const ONBOARDING_KEY = 'fsbo_onboarding_seen'

const Discover = lazy(() => import('./pages/Discover'))
const MyListings = lazy(() => import('./pages/MyListings'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Customers = lazy(() => import('./pages/Customers'))
const Account = lazy(() => import('./pages/Account'))
const AiAssistant = lazy(() => import('./pages/AiAssistant'))
const FSBOMeslek = lazy(() => import('./pages/FSBOMeslek'))
const EvBulucu = lazy(() => import('./pages/EvBulucu'))
const FSBOGorsel = lazy(() => import('./pages/FSBOGorsel'))
const FSBOVideo = lazy(() => import('./pages/FSBOVideo'))
const FSBOSanalTur = lazy(() => import('./pages/FSBOSanalTur'))
const FSBO3D = lazy(() => import('./pages/FSBO3D'))
const FSBODrone = lazy(() => import('./pages/FSBODrone'))
const Daily = lazy(() => import('./pages/Daily'))
const Appointments = lazy(() => import('./pages/Appointments'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <LoadingState type="spinner" />
    </div>
  )
}

function AppLayout() {
  const { isAuthenticated, user, logout, refreshUser, loading } = useAuth()
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

  // Appointment reminder — backend /notifications + /appointments üzerinden
  useEffect(() => {
    if (!isAuthenticated) return

    const checkReminders = async () => {
      try {
        const apps = await appointmentsApi.getAll()
        const now = new Date()
        const activeApps = (Array.isArray(apps) ? apps : []).filter(
          a => a.status === 'onaylandı'
        )
        for (const app of activeApps) {
          const appDateTime = new Date(`${app.date}T${app.time}`)
          const diffMins = (appDateTime - now) / 60000
          if (diffMins > 0 && diffMins <= 30) {
            addToast(`Yaklaşan Randevu: ${app.title} (${app.time})`, 'info')
            await notificationsApi.create({
              type: 'calendar',
              title: 'Yaklaşan Randevu',
              description: `"${app.title}" randevunuz ${app.time} saatinde başlayacaktır. Konum: ${app.location || 'Belirtilmedi'}`,
            }).catch(() => {})
          }
        }
      } catch {}
    }

    checkReminders()
    const timer = setInterval(checkReminders, 60000)
    return () => clearInterval(timer)
  }, [isAuthenticated, addToast])

  if (!isAuthenticated) {
    return <AppRouter />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <LoadingState type="spinner" />
      </div>
    )
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

  // Web Site Kurucu & Site Ayarları — ana layout ile gösterilir
  if (pathname === ROUTES.WEBSITE_BUILDER || pathname.startsWith('/web-site-ayarlar/')) {
    return (
      <TabContext.Provider value={{ activeTab, setActiveTab, tabParams, setTabParams }}>
        <div className="min-h-screen bg-cream antialiased flex flex-col">
          <Sidebar />
          <Header />
          <main className="flex-1 flex flex-col lg:ml-[260px] pb-[68px] lg:pb-0 overflow-y-auto max-h-screen">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <AppRouter />
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
          <Toast />
        </div>
      </TabContext.Provider>
    )
  }

  const isProfileSetup = pathname === ROUTES.PROFILE_SETUP
  const isRoutePage = pathname.match(/^\/ilan\//) || pathname === '/ilan-olustur' || pathname.match(/^\/ai/) || pathname === '/gunluk' || pathname === '/randevular' || pathname === '/landing' || isProfileSetup

  if (isProfileSetup) {
    return <AppRouter />
  }

  const renderPage = () => {
    if (isRoutePage) {
      return <AppRouter />
    }
    switch (activeTab) {
      case 'anasayfa': return <Dashboard />
      case 'ai-asistan': return <FSBOMeslek />
      case 'ilanlarim': return <MyListings />
      case 'listeler': return <Favorites />
      case 'musteriler': return <Customers />
      case 'hesap': return <Account />
      case 'gunluk': return <Daily />
      case 'randevular': return <Appointments />
      case 'ev-bulucu': return <EvBulucu />
      case 'kesfet': return <AiAssistant />
      default: return <Dashboard />
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
          <PropertiesProvider>
            <AiAssistantProvider>
              <ErrorBoundary>
                <AppLayout />
              </ErrorBoundary>
            </AiAssistantProvider>
          </PropertiesProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
