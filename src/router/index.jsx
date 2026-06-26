import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../config'
import LoadingState from '../components/ui/LoadingState'

const Discover = lazy(() => import('../pages/Discover'))
const Landing = lazy(() => import('../pages/Landing'))
const ListingDetail = lazy(() => import('../pages/ListingDetail'))
const Favorites = lazy(() => import('../pages/Favorites'))
const MyListings = lazy(() => import('../pages/MyListings'))
const Login = lazy(() => import('../pages/Login'))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'))
const Account = lazy(() => import('../pages/Account'))
const Customers = lazy(() => import('../pages/Customers'))
const CreateListing = lazy(() => import('../pages/CreateListing'))
const AiAssistant = lazy(() => import('../pages/AiAssistant'))
const Daily = lazy(() => import('../pages/Daily'))
const Appointments = lazy(() => import('../pages/Appointments'))
function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <LoadingState type="spinner" />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />
  return children
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to={ROUTES.HOME} replace />
  return children
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<GuestRoute><Login /></GuestRoute>} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path={ROUTES.HOME} element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path={ROUTES.FAVORITES} element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path={ROUTES.MY_LISTINGS} element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
        <Route path={ROUTES.LISTING_DETAIL} element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
        <Route path={ROUTES.ACCOUNT} element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path={ROUTES.CUSTOMERS} element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path={ROUTES.CREATE_LISTING} element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
        <Route path={ROUTES.AI_ASSISTANT} element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
        <Route path={ROUTES.DAILY} element={<ProtectedRoute><Daily /></ProtectedRoute>} />
        <Route path={ROUTES.APPOINTMENTS} element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Suspense>
  )
}
