import { createContext, useContext, useState, useCallback } from 'react'
import { PLANS } from '../config'

const TEST_USER = { username: 'test', password: 'test', name: 'Ahmet Yılmaz', email: 'ahmet@email.com', avatar: 'https://i.pravatar.cc/100?img=16', role: 'admin' }

const GOOGLE_USER = { username: 'google_user', password: '', name: 'Ali Google', email: 'ali.google@gmail.com', avatar: 'https://i.pravatar.cc/100?img=12', role: 'user' }

const mockInvoices = [
  { id: 'INV-001', date: '2026-05-01', plan: 'Pro', amount: 149, status: 'paid', pdf: '#' },
  { id: 'INV-002', date: '2026-04-01', plan: 'Pro', amount: 149, status: 'paid', pdf: '#' },
  { id: 'INV-003', date: '2026-03-01', plan: 'Pro', amount: 149, status: 'paid', pdf: '#' },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('FSBO_user')
    return stored ? JSON.parse(stored) : null
  })
  const [authError, setAuthError] = useState(null)

  const login = useCallback((username, password) => {
    setAuthError(null)
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === TEST_USER.username && password === TEST_USER.password) {
          const userData = {
            username: TEST_USER.username,
            name: TEST_USER.name,
            email: TEST_USER.email,
            avatar: TEST_USER.avatar,
            role: TEST_USER.role,
            subscription: { planId: 'pro', status: 'active', since: '2026-01-15', renewsAt: '2026-06-15' },
            profileCompleted: true,
            profile: null,
          }
          setUser(userData)
          localStorage.setItem('FSBO_user', JSON.stringify(userData))
          setAuthError(null)
          resolve(true)
        } else {
          setAuthError('Kullanıcı adı veya şifre hatalı.')
          resolve(false)
        }
      }, 600)
    })
  }, [])

  const register = useCallback(({ username, password, firstName, lastName }) => {
    setAuthError(null)
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === TEST_USER.username) {
          setAuthError('Bu kullanıcı adı zaten alınmış.')
          resolve(false)
          return
        }
        if (username.length < 3) {
          setAuthError('Kullanıcı adı en az 3 karakter olmalıdır.')
          resolve(false)
          return
        }
        if (password.length < 3) {
          setAuthError('Şifre en az 3 karakter olmalıdır.')
          resolve(false)
          return
        }
        const fullName = [firstName, lastName].filter(Boolean).join(' ') || username
        const userData = {
          username,
          name: fullName,
          firstName: firstName || '',
          lastName: lastName || '',
          email: `${username}@email.com`,
          avatar: `https://i.pravatar.cc/100?u=${username}`,
          role: 'user',
          subscription: null,
          profileCompleted: false,
          profile: null,
        }
        setUser(userData)
        localStorage.setItem('FSBO_user', JSON.stringify(userData))
        setAuthError(null)
        resolve({ userData, needsProfile: true })
      }, 600)
    })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('FSBO_user')
  }, [])

  const clearError = useCallback(() => setAuthError(null), [])

  const resetPassword = useCallback((email) => {
    setAuthError(null)
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!email || !email.includes('@')) {
          setAuthError('Geçerli bir e-posta adresi girin.')
          resolve(false)
          return
        }
        resolve(true)
      }, 800)
    })
  }, [])

  const googleLogin = useCallback(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = {
          username: GOOGLE_USER.username,
          name: GOOGLE_USER.name,
          email: GOOGLE_USER.email,
          avatar: GOOGLE_USER.avatar,
          role: GOOGLE_USER.role,
          subscription: null,
        }
        setUser(userData)
        localStorage.setItem('FSBO_user', JSON.stringify(userData))
        setAuthError(null)
        resolve(true)
      }, 800)
    })
  }, [])

  const completeProfile = useCallback((profileData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser(prev => {
          const updated = {
            ...prev,
            profileCompleted: true,
            profile: {
              nick: profileData.nick || prev.name,
              age: profileData.age || '',
              education: profileData.education || '',
              bio: profileData.bio || '',
              phone: profileData.phone || '',
              avatar: profileData.avatar || prev.avatar,
              interests: profileData.interests || [],
              platforms: profileData.platforms || [],
              title: profileData.title || '',
              certificates: profileData.certificates || [],
            },
            name: profileData.nick || prev.name,
            avatar: profileData.avatar || prev.avatar,
          }
          localStorage.setItem('FSBO_user', JSON.stringify(updated))
          return updated
        })
        resolve(true)
      }, 400)
    })
  }, [])

  const updateProfile = useCallback((updates) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser(prev => {
          const updated = { ...prev, ...updates }
          localStorage.setItem('FSBO_user', JSON.stringify(updated))
          return updated
        })
        resolve(true)
      }, 400)
    })
  }, [])

  const updatePassword = useCallback((currentPassword, newPassword) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (currentPassword !== TEST_USER.password) {
          setAuthError('Mevcut şifre hatalı.')
          resolve(false)
          return
        }
        if (newPassword.length < 3) {
          setAuthError('Yeni şifre en az 3 karakter olmalıdır.')
          resolve(false)
          return
        }
        setAuthError(null)
        resolve(true)
      }, 600)
    })
  }, [])

  const subscribeToPlan = useCallback((planId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const plan = PLANS.find(p => p.id === planId)
        if (!plan) { resolve(false); return }
        setUser(prev => {
          const updated = {
            ...prev,
            subscription: { planId, status: 'active', since: new Date().toISOString().split('T')[0], renewsAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] },
          }
          localStorage.setItem('FSBO_user', JSON.stringify(updated))
          return updated
        })
        resolve(true)
      }, 800)
    })
  }, [])

  const cancelSubscription = useCallback(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser(prev => {
          if (!prev.subscription) { resolve(false); return prev }
          const updated = { ...prev, subscription: { ...prev.subscription, status: 'cancelled' } }
          localStorage.setItem('FSBO_user', JSON.stringify(updated))
          return updated
        })
        resolve(true)
      }, 600)
    })
  }, [])

  const getInvoices = useCallback(() => {
    return Promise.resolve(mockInvoices)
  }, [])

  const hasRole = useCallback((role) => {
    return user?.role === role
  }, [user])

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
