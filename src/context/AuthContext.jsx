import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authApi } from '../api/auth'
import { tokenStore } from '../api/tokenStore'

const USER_CACHE_KEY = 'FSBO_user'

const AuthContext = createContext(null)

function readCachedUser() {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function cacheUser(user) {
  if (user) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_CACHE_KEY)
}

export function AuthProvider({ children }) {
  // Hızlı ilk boyama için önbellekteki kullanıcı; ardından token ile doğrulanır
  const [user, setUser] = useState(() => (tokenStore.getAccess() ? readCachedUser() : null))
  const [authError, setAuthError] = useState(null)

  const applyUser = useCallback((u) => {
    setUser(u)
    cacheUser(u)
  }, [])

  // Mount'ta token varsa oturumu backend'den doğrula/yenile
  useEffect(() => {
    let alive = true
    if (!tokenStore.getAccess()) return
    authApi.me().then((u) => {
      if (!alive) return
      if (u) applyUser(u)
      else { applyUser(null); tokenStore.clear() }
    })
    return () => { alive = false }
  }, [applyUser])

  const login = useCallback(async (username, password) => {
    setAuthError(null)
    try {
      const u = await authApi.login(username, password)
      applyUser(u)
      return true
    } catch (err) {
      setAuthError(err.message || 'Kullanıcı adı veya şifre hatalı.')
      return false
    }
  }, [applyUser])

  const register = useCallback(async ({ username, password, firstName, lastName }) => {
    setAuthError(null)
    try {
      const { user: u, needsProfile } = await authApi.register({ username, password, firstName, lastName })
      applyUser(u)
      return { userData: u, needsProfile }
    } catch (err) {
      setAuthError(err.message || 'Kayıt başarısız.')
      return false
    }
  }, [applyUser])

  const logout = useCallback(async () => {
    await authApi.logout()
    applyUser(null)
  }, [applyUser])

  const clearError = useCallback(() => setAuthError(null), [])

  const resetPassword = useCallback(async (email) => {
    setAuthError(null)
    if (!email || !email.includes('@')) {
      setAuthError('Geçerli bir e-posta adresi girin.')
      return false
    }
    try {
      await authApi.forgotPassword(email)
      return true
    } catch (err) {
      setAuthError(err.message || 'İşlem başarısız.')
      return false
    }
  }, [])

  const googleLogin = useCallback(async () => {
    // Google OAuth backend tarafında henüz aktif değil (Faz 1 sonrası)
    setAuthError('Google ile giriş yakında etkinleşecek. Lütfen kullanıcı adı/şifre ile giriş yapın.')
    return false
  }, [])

  const completeProfile = useCallback(async (profileData) => {
    try {
      const u = await authApi.updateProfile({
        name: profileData.nick || user?.name,
        avatar: profileData.avatar || user?.avatar,
        phone: profileData.phone || '',
        profileCompleted: true,
        profile: {
          nick: profileData.nick || user?.name,
          age: profileData.age || '',
          education: profileData.education || '',
          bio: profileData.bio || '',
          phone: profileData.phone || '',
          avatar: profileData.avatar || user?.avatar,
          interests: profileData.interests || [],
          platforms: profileData.platforms || [],
          title: profileData.title || '',
          certificates: profileData.certificates || [],
        },
      })
      applyUser(u)
      return true
    } catch (err) {
      setAuthError(err.message || 'Profil kaydedilemedi.')
      return false
    }
  }, [applyUser, user])

  const updateProfile = useCallback(async (updates) => {
    try {
      const u = await authApi.updateProfile(updates)
      applyUser(u)
      return true
    } catch (err) {
      setAuthError(err.message || 'Güncelleme başarısız.')
      return false
    }
  }, [applyUser])

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    setAuthError(null)
    try {
      await authApi.updatePassword(currentPassword, newPassword)
      return true
    } catch (err) {
      setAuthError(err.message || 'Şifre güncellenemedi.')
      return false
    }
  }, [])

  const subscribeToPlan = useCallback(async (planId) => {
    try {
      const sub = await authApi.subscribe(planId)
      applyUser({ ...user, subscription: { planId: sub.planId, status: sub.status, since: sub.since, renewsAt: sub.renewsAt } })
      return true
    } catch {
      return false
    }
  }, [applyUser, user])

  const cancelSubscription = useCallback(async () => {
    try {
      const sub = await authApi.cancelSubscription()
      applyUser({ ...user, subscription: { ...user?.subscription, status: sub.status } })
      return true
    } catch {
      return false
    }
  }, [applyUser, user])

  const getInvoices = useCallback(() => authApi.getInvoices(), [])

  const hasRole = useCallback((role) => user?.role === role, [user])

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, authError,
      login, register, logout, clearError, resetPassword, googleLogin,
      completeProfile, updateProfile, updatePassword,
      subscribeToPlan, cancelSubscription, getInvoices,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
