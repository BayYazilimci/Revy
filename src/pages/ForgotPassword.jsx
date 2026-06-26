import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../config'
import { Building2, ArrowLeft, Mail, KeyRound, CheckCircle, Loader2, Eye, EyeOff, LogIn } from 'lucide-react'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { isAuthenticated, authError, resetPassword, googleLogin, clearError } = useAuth()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    clearError()
    setFieldErrors({})
  }, [step, clearError])

  const validateEmail = () => {
    const errors = {}
    if (!email.trim()) errors.email = 'E-posta adresi gerekli'
    else if (!email.includes('@')) errors.email = 'Geçerli bir e-posta girin'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePassword = () => {
    const errors = {}
    if (!newPassword) errors.password = 'Yeni şifre gerekli'
    else if (newPassword.length < 3) errors.password = 'En az 3 karakter'
    if (!confirmPassword) errors.confirm = 'Şifreyi onaylayın'
    else if (newPassword !== confirmPassword) errors.confirm = 'Şifreler eşleşmiyor'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!validateEmail()) return
    setLoading(true)
    const ok = await resetPassword(email.trim())
    setLoading(false)
    if (ok) setStep('reset')
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    if (!validatePassword()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    setStep('done')
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    const ok = await googleLogin()
    setGoogleLoading(false)
    if (ok) navigate('/', { replace: true })
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen flex" style={{ background: '#faf7f2' }}>
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8 animate-fade-up">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: '#e3d10d' }}>
                <Building2 size={28} strokeWidth={2.5} style={{ color: '#1a2a3a' }} />
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-cardBorder shadow-sm p-8 animate-scale-in text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-lg font-extrabold mb-1" style={{ color: '#1e1b2e' }}>Şifre Sıfırlandı</h2>
              <p className="text-sm text-gray-400 font-medium mb-6">
                Yeni şifreniz başarıyla oluşturuldu. Yeni şifrenizle giriş yapabilirsiniz.
              </p>
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-extrabold shadow-lg"
                style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
              >
                <LogIn size={16} strokeWidth={2.5} />
                Giriş Yap
              </Link>
              <p className="text-xs text-gray-400 font-medium mt-3">
                Test hesabı: <span className="font-bold" style={{ color: '#1e1b2e' }}>test</span> / <span className="font-bold" style={{ color: '#1e1b2e' }}>test</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
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
            {step === 'email' && (
              <>
                <div className="text-center mb-5">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
                    <KeyRound size={22} className="text-amber-500" />
                  </div>
                  <h2 className="text-base font-extrabold" style={{ color: '#1e1b2e' }}>Şifremi Unuttum</h2>
                  <p className="text-xs text-gray-400 font-medium mt-1">E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.</p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">E-posta Adresi</label>
                    <input
                      type="email"
                      className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all duration-200 ${fieldErrors.email || authError ? 'border-red-300' : 'border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)]'}`}
                      style={{ color: '#1e1b2e' }}
                      placeholder="ornek@email.com"
                      value={email}
                      autoFocus
                      onChange={e => { setEmail(e.target.value); clearError() }}
                    />
                    {fieldErrors.email && <p className="text-xs text-red-400 font-medium mt-1">{fieldErrors.email}</p>}
                  </div>

                  {authError && (
                    <div className="bg-softPink rounded-2xl p-3 animate-shake">
                      <p className="text-xs font-bold text-red-500 text-center">{authError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl text-sm font-extrabold shadow-lg flex items-center justify-center gap-2 transition-all duration-200"
                    style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} strokeWidth={2.5} />}
                    {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                  </button>
                </form>

                <div className="mt-5 pt-5 border-t border-cardBorder">
                  <p className="text-[10px] text-gray-400 font-semibold text-center mb-3">veya</p>
                  <button
                    type="button"
                    disabled={googleLoading}
                    onClick={handleGoogle}
                    className="w-full py-3 rounded-2xl text-xs font-extrabold border-2 border-cardBorder flex items-center justify-center gap-2 hover:bg-cream transition-all duration-200"
                    style={{ color: '#1e1b2e' }}
                  >
                    {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                    Google ile Devam Et
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-deep transition-colors duration-200">
                    <ArrowLeft size={12} />
                    Giriş sayfasına dön
                  </Link>
                </div>
              </>
            )}

            {step === 'reset' && (
              <>
                <div className="text-center mb-5">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                    <KeyRound size={22} className="text-blue-500" />
                  </div>
                  <h2 className="text-base font-extrabold" style={{ color: '#1e1b2e' }}>Yeni Şifre Belirleyin</h2>
                  <p className="text-xs text-gray-400 font-medium mt-1">Hesabınız için yeni bir şifre oluşturun.</p>
                </div>

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Yeni Şifre</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all duration-200 pr-11 ${fieldErrors.password ? 'border-red-300' : 'border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)]'}`}
                        style={{ color: '#1e1b2e' }}
                        placeholder="En az 3 karakter"
                        value={newPassword}
                        autoFocus
                        onChange={e => setNewPassword(e.target.value)}
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="text-xs text-red-400 font-medium mt-1">{fieldErrors.password}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Yeni Şifre (Tekrar)</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all duration-200 pr-11 ${fieldErrors.confirm ? 'border-red-300' : 'border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)]'}`}
                        style={{ color: '#1e1b2e' }}
                        placeholder="Şifreyi tekrar girin"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {fieldErrors.confirm && <p className="text-xs text-red-400 font-medium mt-1">{fieldErrors.confirm}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl text-sm font-extrabold shadow-lg flex items-center justify-center gap-2 transition-all duration-200"
                    style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} strokeWidth={2.5} />}
                    {loading ? 'Kaydediliyor...' : 'Şifreyi Kaydet'}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-deep transition-colors duration-200"
                  >
                    <ArrowLeft size={12} />
                    Geri dön
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
