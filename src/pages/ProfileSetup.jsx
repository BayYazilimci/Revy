import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Building2, User, Calendar, GraduationCap, BookHeart, Phone, ArrowRight, Camera, Loader2, Check, Briefcase, Award, Globe, X, Plus } from 'lucide-react'

const EDUCATION_OPTIONS = [
  'İlköğretim', 'Lise', 'Ön Lisans', 'Lisans', 'Yüksek Lisans', 'Doktora',
]

const INTEREST_OPTIONS = [
  'Kiralık Ev', 'Satılık Ev', 'Villa', 'Daire', 'Arsa', 'Ofis', 'Yatırımlık', 'Tatillik',
]

const PLATFORM_OPTIONS = [
  { key: 'hepsiemlak', label: 'Hepsiemlak' },
  { key: 'emlakjet', label: 'Emlak Jet' },
  { key: 'hurriyetemlak', label: 'Hürriyet Emlak' },
  { key: 'sahibinden', label: 'Sahibinden' },
]

export default function ProfileSetup() {
  const navigate = useNavigate()
  const { user, completeProfile } = useAuth()
  const fileInputRef = useRef(null)
  const certInputRef = useRef(null)

  const [nick, setNick] = useState(user?.name || '')
  const [age, setAge] = useState('')
  const [education, setEducation] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [interests, setInterests] = useState([])
  const [platforms, setPlatforms] = useState([])
  const [title, setTitle] = useState('')
  const [certificates, setCertificates] = useState([])
  const [certInput, setCertInput] = useState('')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const toggleInterest = (val) => {
    setInterests(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val])
  }

  const togglePlatform = (key) => {
    setPlatforms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key])
  }

  const addCertificate = () => {
    const val = certInput.trim()
    if (!val) return
    if (certificates.includes(val)) return
    setCertificates(prev => [...prev, val])
    setCertInput('')
    certInputRef.current?.focus()
  }

  const removeCertificate = (val) => {
    setCertificates(prev => prev.filter(c => c !== val))
  }

  const handleCertKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCertificate()
    }
  }

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setLoading(true)
    await completeProfile({
      nick: nick || user?.name || '',
      age,
      education,
      bio,
      phone,
      avatar: avatarPreview || avatar,
      interests,
      platforms,
      title,
      certificates,
    })
    setLoading(false)
    navigate('/', { replace: true })
  }

  const canContinue = () => {
    if (step === 1) return nick.trim().length > 0
    return true
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#faf7f2' }}>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6 animate-fade-up">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg" style={{ background: '#e3d10d' }}>
              <Building2 size={28} strokeWidth={2.5} style={{ color: '#1a2a3a' }} />
            </div>
            <h1 className="text-xl font-extrabold" style={{ color: '#1e1b2e' }}>Profilini Tamamla</h1>
            <p className="text-sm text-gray-400 font-medium mt-1">Deneyimini kisilestirmek icin bir kac bilgi daha</p>
          </div>

          <div className="flex items-center gap-2 justify-center mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold transition-all ${
                    step >= s ? 'text-white shadow-sm' : 'bg-cream border border-cardBorder text-gray-400'
                  }`}
                  style={step >= s ? { background: '#1e1b2e' } : {}}
                >
                  {step > s ? <Check size={14} /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 rounded ${step > s ? 'bg-deep' : 'bg-cardBorder'}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-cardBorder shadow-sm p-6 animate-scale-in">
            {step === 1 && (
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-400 mb-3">Profil Fotografi</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-20 h-20 rounded-2xl mx-auto flex items-center justify-center overflow-hidden border-2 border-dashed border-cardBorder hover:border-accent transition-all cursor-pointer btn"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={22} className="text-gray-300" />
                    )}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                        <Camera size={12} style={{ color: '#1e1b2e' }} />
                      </div>
                    </div>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <User size={13} />
                    Profil Adi (gorunen isminiz)
                  </label>
                  <input
                    type="text"
                    value={nick}
                    onChange={(e) => setNick(e.target.value)}
                    placeholder="Orn: Ahmet E."
                    className="w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)]"
                    style={{ color: '#1e1b2e' }}
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                      <Calendar size={13} />
                      Yas
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="25"
                      min="18"
                      max="120"
                      className="w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)]"
                      style={{ color: '#1e1b2e' }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                      <GraduationCap size={13} />
                      Egitim
                    </label>
                    <select
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all border-cardBorder focus:border-accent cursor-pointer appearance-none"
                      style={{ color: education ? '#1e1b2e' : '#9ca3af' }}
                    >
                      <option value="">Seciniz</option>
                      {EDUCATION_OPTIONS.map(e => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} />
                    Telefon (opsiyonel)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    className="w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)]"
                    style={{ color: '#1e1b2e' }}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <BookHeart size={13} />
                    Ilgilendiginiz emlak turleri
                  </label>
                  <p className="text-[10px] text-gray-400 font-medium mb-3">Birden fazla secebilirsiniz</p>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => toggleInterest(val)}
                        className={`px-3.5 py-2 rounded-xl text-[11px] font-bold btn transition-all ${
                          interests.includes(val)
                            ? 'text-white shadow-sm'
                            : 'bg-cream border border-cardBorder text-gray-500 hover:border-accent'
                        }`}
                        style={interests.includes(val) ? { background: '#1e1b2e' } : {}}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <Globe size={13} />
                    Kullandiginiz platformlar
                  </label>
                  <p className="text-[10px] text-gray-400 font-medium mb-3">Emlak ilanlarini takip ettiginiz platformlar</p>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORM_OPTIONS.map(p => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => togglePlatform(p.key)}
                        className={`px-3.5 py-2 rounded-xl text-[11px] font-bold btn transition-all ${
                          platforms.includes(p.key)
                            ? 'text-white shadow-sm'
                            : 'bg-cream border border-cardBorder text-gray-500 hover:border-accent'
                        }`}
                        style={platforms.includes(p.key) ? { background: '#1e1b2e' } : {}}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Kendinizden bahsedin (opsiyonel)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Orn: Istanbul'da 3+1 kiralik daire ariyorum..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] resize-none"
                    style={{ color: '#1e1b2e' }}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <Briefcase size={13} />
                    Unvaniniz
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Orn: Gayrimenkul Danismani, Broker, Eksper..."
                    className="w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)]"
                    style={{ color: '#1e1b2e' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <Award size={13} />
                    Sertifikalar
                  </label>
                  <p className="text-[10px] text-gray-400 font-medium mb-3">Emlak ile ilgili sertifikalarınız</p>
                  <div className="flex gap-2">
                    <input
                      ref={certInputRef}
                      type="text"
                      value={certInput}
                      onChange={(e) => setCertInput(e.target.value)}
                      onKeyDown={handleCertKeyDown}
                      placeholder="Sertifika adi yazip ekleyin..."
                      className="flex-1 px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)]"
                      style={{ color: '#1e1b2e' }}
                    />
                    <button
                      type="button"
                      onClick={addCertificate}
                      disabled={!certInput.trim()}
                      className="px-4 py-3 rounded-2xl text-xs font-extrabold transition-all btn disabled:opacity-40"
                      style={{ background: '#e3d10d', color: '#1e1b2e' }}
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                  {certificates.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {certificates.map(cert => (
                        <span
                          key={cert}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm text-white"
                          style={{ background: '#1e1b2e' }}
                        >
                          {cert}
                          <button
                            type="button"
                            onClick={() => removeCertificate(cert)}
                            className="hover:opacity-70 transition-opacity btn"
                          >
                            <X size={12} strokeWidth={2.5} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6 pt-4 border-t border-cardBorder">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev - 1)}
                  className="flex-1 py-3 rounded-2xl text-xs font-extrabold border-2 border-cardBorder hover:bg-cream transition-all btn"
                  style={{ color: '#1e1b2e' }}
                >
                  Geri
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  disabled={!canContinue()}
                  onClick={() => setStep(prev => prev + 1)}
                  className="flex-1 py-3 rounded-2xl text-xs font-extrabold shadow-lg flex items-center justify-center gap-2 transition-all btn disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
                >
                  Devam Et
                  <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-2xl text-xs font-extrabold shadow-lg flex items-center justify-center gap-2 transition-all btn"
                  style={{ background: '#1e1b2e', color: '#fff', boxShadow: '0 8px 24px rgba(30,27,46,.2)' }}
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={2.5} />}
                  {loading ? 'Kaydediliyor...' : 'Tamamla ve Basla'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
