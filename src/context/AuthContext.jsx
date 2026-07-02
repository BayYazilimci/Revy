import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await authApi.me()
          setUser(profile)
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const applyUser = useCallback((u) => {
    setUser(u)
  }, [])

  const refreshUser = useCallback(async () => {
    const u = await authApi.me()
    if (u) applyUser(u)
    else { applyUser(null); await supabase.auth.signOut() }
    return u
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

  const register = useCallback(async ({ username, password, firstName, lastName, email }) => {
    setAuthError(null)
    try {
      const { user: u, needsProfile } = await authApi.register({ username, password, firstName, lastName, email })
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
    setAuthError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
      if (error) throw error
      return true
    } catch (err) {
      setAuthError(err.message || 'Google ile giriş başarısız.')
      return false
    }
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
      applyUser({ ...user, subscription: { planId: sub.plan_id, status: sub.status, since: sub.since, renewsAt: sub.renews_at } })
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
      user, isAuthenticated: !!user, authError, loading,
      login, register, logout, clearError, resetPassword, googleLogin, refreshUser,
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
