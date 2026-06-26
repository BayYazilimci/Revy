import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../config'
import { Building2, LogIn, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, authError, login, register, googleLogin, clearError } = useAuth()
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (location.state?.mode) {
      setMode(location.state.mode)
    }
  }, [location])

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    clearError()
    setFieldErrors({})
  }, [mode, clearError])

  const validate = () => {
    const errors = {}
    if (mode === 'register') {
      if (!firstName.trim()) errors.firstName = 'Ad gerekli'
      if (!lastName.trim()) errors.lastName = 'Soyad gerekli'
    }
    if (!username.trim()) errors.username = 'Kullanıcı adı gerekli'
    else if (username.trim().length < 3) errors.username = 'En az 3 karakter'
    if (!password) errors.password = 'Şifre gerekli'
    else if (password.length < 3) errors.password = 'En az 3 karakter'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    if (mode === 'login') {
      const ok = await login(username.trim(), password)
      setLoading(false)
      if (ok) navigate('/', { replace: true })
    } else {
      const result = await register({ username: username.trim(), password, firstName: firstName.trim(), lastName: lastName.trim() })
      setLoading(false)
      if (result) navigate('/profil-tamamla', { replace: true })
    }
  }

  const switchMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login')
    setUsername('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setShowPassword(false)
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#faf7f2' }}>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 animate-fade-up">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: '#e3d10d' }}>
              <Building2 size={28} strokeWidth={2.5} style={{ color: '#1a2a3a' }} />
            </div>
            <h1 className="text-2xl font-extrabold" style={{ color: '#1e1b2e' }}>FSBO</h1>
            <p className="text-sm text-gray-400 font-medium mt-1">Emlak Platformu</p>
          </div>

          <div className="bg-white rounded-3xl border border-cardBorder shadow-sm p-6 animate-scale-in">
            <div className="flex mb-6 bg-cream rounded-xl p-1">
              <button
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 ${mode === 'login' ? 'bg-white shadow-sm' : 'text-gray-400 hover:text-deep'}`}
                style={{ color: mode === 'login' ? '#1e1b2e' : undefined }}
                onClick={() => setMode('login')}
              >
                <LogIn size={14} className="inline mr-1.5" />
                Giriş
              </button>
              <button
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 ${mode === 'register' ? 'bg-white shadow-sm' : 'text-gray-400 hover:text-deep'}`}
                style={{ color: mode === 'register' ? '#1e1b2e' : undefined }}
                onClick={() => setMode('register')}
              >
                <UserPlus size={14} className="inline mr-1.5" />
                Kayıt
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Ad</label>
                    <input
                      type="text"
                      className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all duration-200 ${fieldErrors.firstName ? 'border-red-300' : 'border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)]'}`}
                      style={{ color: '#1e1b2e' }}
                      placeholder="Adınız"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                    />
                    {fieldErrors.firstName && <p className="text-xs text-red-400 font-medium mt-1">{fieldErrors.firstName}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Soyad</label>
                    <input
                      type="text"
                      className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all duration-200 ${fieldErrors.lastName ? 'border-red-300' : 'border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)]'}`}
                      style={{ color: '#1e1b2e' }}
                      placeholder="Soyadınız"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                    />
                    {fieldErrors.lastName && <p className="text-xs text-red-400 font-medium mt-1">{fieldErrors.lastName}</p>}
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Kullanıcı Adı</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all duration-200 ${fieldErrors.username || authError ? 'border-red-300' : 'border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)]'}`}
                  style={{ color: '#1e1b2e' }}
                  placeholder={mode === 'login' ? 'Kullanıcı adınızı girin' : 'Bir kullanıcı adı belirleyin'}
                  value={username}
                  autoFocus
                  onChange={e => { setUsername(e.target.value); clearError() }}
                />
                {fieldErrors.username && <p className="text-xs text-red-400 font-medium mt-1">{fieldErrors.username}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all duration-200 pr-11 ${fieldErrors.password ? 'border-red-300' : 'border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)]'}`}
                    style={{ color: '#1e1b2e' }}
                    placeholder={mode === 'login' ? 'Şifrenizi girin' : 'Bir şifre belirleyin'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearError() }}
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-red-400 font-medium mt-1">{fieldErrors.password}</p>}
              </div>

              {mode === 'login' && (
                <div className="text-right -mt-2">
                  <Link to={ROUTES.FORGOT_PASSWORD} className="text-[10px] font-bold text-gray-400 hover:text-deep transition-colors duration-200">
                    Şifremi Unuttum
                  </Link>
                </div>
              )}

              {authError && (
                <div className="bg-softPink rounded-2xl p-3 animate-shake">
                  <p className="text-xs font-bold text-red-500 text-center">{authError}</p>
                </div>
              )}

              {mode === 'login' && (
                <p className="text-[10px] text-gray-400 font-medium text-center leading-relaxed">
                  Test hesabı: <span className="font-bold" style={{ color: '#1e1b2e' }}>test</span> / <span className="font-bold" style={{ color: '#1e1b2e' }}>test</span>
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-sm font-extrabold shadow-lg flex items-center justify-center gap-2 transition-all duration-200"
                style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : mode === 'login' ? (
                  <LogIn size={16} strokeWidth={2.5} />
                ) : (
                  <UserPlus size={16} strokeWidth={2.5} />
                )}
                {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-cardBorder">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cardBorder"></div></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-[10px] font-semibold text-gray-400">veya</span></div>
              </div>
              <button
                type="button"
                disabled={googleLoading}
                onClick={async () => {
                  setGoogleLoading(true)
                  const ok = await googleLogin()
                  setGoogleLoading(false)
                  if (ok) navigate('/', { replace: true })
                }}
                className="w-full py-3 rounded-2xl text-xs font-extrabold border-2 border-cardBorder flex items-center justify-center gap-2 hover:bg-cream transition-all duration-200"
                style={{ color: '#1e1b2e' }}
              >
                {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                Google ile Devam Et
              </button>
            </div>

            <div className="mt-5 text-center">
              <button
                type="button"
                className="text-xs font-bold text-gray-400 hover:text-deep transition-colors duration-200"
                onClick={switchMode}
              >
                {mode === 'login' ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
