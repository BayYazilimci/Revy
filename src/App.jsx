import { createContext, useState, lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
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
import Onboarding from './components/Onboarding'

const ONBOARDING_KEY = 'fsbo_onboarding_seen'

const Discover = lazy(() => import('./pages/Discover'))
const MyListings = lazy(() => import('./pages/MyListings'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Customers = lazy(() => import('./pages/Customers'))
const Account = lazy(() => import('./pages/Account'))
const AiAssistant = lazy(() => import('./pages/AiAssistant'))
const Daily = lazy(() => import('./pages/Daily'))
const Appointments = lazy(() => import('./pages/Appointments'))

export const TabContext = createContext()

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <LoadingState type="spinner" />
    </div>
  )
}

function AppLayout() {
  const { isAuthenticated } = useAuth()
  const { addToast } = useApp()
  const [activeTab, setActiveTab] = useState('kesfet')
  const [tabParams, setTabParams] = useState({})
  const [showOnboarding, setShowOnboarding] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated && !localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true)
    }
  }, [isAuthenticated])

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

  const isRoutePage = location.pathname.match(/^\/ilan\//) || location.pathname === '/ilan-olustur' || location.pathname.match(/^\/ai/) || location.pathname === '/gunluk' || location.pathname === '/randevular' || location.pathname === '/landing'

  const renderPage = () => {
    if (isRoutePage) {
      return <AppRouter />
    }
    switch (activeTab) {
      case 'ai-asistan': return <AiAssistant />
      case 'ilanlarim': return <MyListings />
      case 'listeler': return <Favorites />
      case 'musteriler': return <Customers />
      case 'hesap': return <Account />
      case 'gunluk': return <Daily />
      case 'randevular': return <Appointments />
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
