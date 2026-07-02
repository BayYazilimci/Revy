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
const FSBOMeslek = lazy(() => import('../pages/FSBOMeslek'))
const EvBulucu = lazy(() => import('../pages/EvBulucu'))
const FSBOGorsel = lazy(() => import('../pages/FSBOGorsel'))
const FSBOVideo = lazy(() => import('../pages/FSBOVideo'))
const FSBOSanalTur = lazy(() => import('../pages/FSBOSanalTur'))
const FSBO3D = lazy(() => import('../pages/FSBO3D'))
const FSBODrone = lazy(() => import('../pages/FSBODrone'))
const Daily = lazy(() => import('../pages/Daily'))
const Appointments = lazy(() => import('../pages/Appointments'))
const ProfileSetup = lazy(() => import('../pages/ProfileSetup'))
const AdminPanel = lazy(() => import('../pages/AdminPanel'))
const WebsiteBuilder = lazy(() => import('../pages/WebsiteBuilder'))
const WebsiteSettings = lazy(() => import('../pages/WebsiteSettings'))
const PublishedSite = lazy(() => import('../pages/PublishedSite'))

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
        <Route path={ROUTES.FSBO_AI} element={<ProtectedRoute><FSBOMeslek /></ProtectedRoute>} />
        <Route path={ROUTES.EV_BULUCU} element={<ProtectedRoute><EvBulucu /></ProtectedRoute>} />
        <Route path={ROUTES.FSBO_GORSEL} element={<ProtectedRoute><FSBOGorsel /></ProtectedRoute>} />
        <Route path={ROUTES.FSBO_VIDEO} element={<ProtectedRoute><FSBOVideo /></ProtectedRoute>} />
        <Route path={ROUTES.FSBO_SANAL_TUR} element={<ProtectedRoute><FSBOSanalTur /></ProtectedRoute>} />
        <Route path={ROUTES.FSBO_3D} element={<ProtectedRoute><FSBO3D /></ProtectedRoute>} />
        <Route path={ROUTES.FSBO_DRONE} element={<ProtectedRoute><FSBODrone /></ProtectedRoute>} />
        <Route path={ROUTES.DAILY} element={<ProtectedRoute><Daily /></ProtectedRoute>} />
        <Route path={ROUTES.APPOINTMENTS} element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
        <Route path={ROUTES.PROFILE_SETUP} element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
        <Route path={ROUTES.ADMIN} element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path={ROUTES.WEBSITE_BUILDER} element={<ProtectedRoute><WebsiteBuilder /></ProtectedRoute>} />
        <Route path="/web-site-ayarlar/:id" element={<ProtectedRoute><WebsiteSettings /></ProtectedRoute>} />
        <Route path="/site/:slug" element={<PublishedSite />} />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Suspense>
  )
}
