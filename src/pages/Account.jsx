import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { PLANS } from '../config'
import DefaultAvatar from '../components/DefaultAvatar'
import {
  User, Lock, Camera, Check, X, Shield,
  Crown, CreditCard, ArrowLeft,
  FileText, Download, Loader2, LogOut, Settings,
  Phone, Star, Globe, Briefcase, Award, GraduationCap, Calendar, BookHeart, Plus
} from 'lucide-react'

const CANCEL_REASONS = [
  { id: 'pahali', label: 'Çok pahalı' },
  { id: 'kullanmiyorum', label: 'Yeterince kullanmıyorum' },
  { id: 'alternatif', label: 'Alternatif bir hizmet buldum' },
  { id: 'ozellikler', label: 'İhtiyacım olan özellikler yok' },
  { id: 'kalite', label: 'Hizmet kalitesinden memnun değilim' },
  { id: 'diger', label: 'Diğer' },
]

const planLabels = { free: 'Ücretsiz', pro: 'Pro', enterprise: 'Kurumsal' }

const accountTabs = [
  { key: 'kisisel', label: 'Kişisel Bilgiler', icon: User },
  { key: 'abonelik', label: 'Abonelik & Faturalama', icon: Crown },
  { key: 'islemler', label: 'Hesap İşlemleri', icon: Settings },
]

function InvoiceTemplate({ inv, user }) {
  return (
    <div style={{ width: '794px', background: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '48px 56px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e3d10d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: '#1a2a3a' }}>F</div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#1e1b2e' }}>FSBO</span>
          </div>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0', fontWeight: 500 }}>Emlak Paneli</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e1b2e', margin: 0, lineHeight: 1.1 }}>FATURA</h1>
          <p style={{ fontSize: '13px', color: '#e3d10d', fontWeight: 700, margin: '4px 0 0' }}>{inv.id}</p>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '36px', padding: '20px 24px', background: '#faf7f2', borderRadius: '12px' }}>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>Fatura Tarihi</p>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b2e', margin: 0 }}>{new Date(inv.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>Durum</p>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#059669', margin: 0 }}>{inv.status === 'paid' ? 'Ödendi' : 'Bekliyor'}</p>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>Müşteri</p>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b2e', margin: 0 }}>{user?.name || 'Kullanıcı'}</p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>{user?.email || ''}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>Ödeme Yöntemi</p>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b2e', margin: 0 }}>Kredi Kartı</p>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #f0ece6' }}>
            <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Açıklama</th>
            <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tutar</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #f0ece6' }}>
            <td style={{ padding: '16px 0' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b2e', margin: 0 }}>{inv.plan} Planı</p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>{inv.date} - {new Date(new Date(inv.date).getTime() + 30 * 86400000).toISOString().split('T')[0]} dönemi</p>
            </td>
            <td style={{ textAlign: 'right', padding: '16px 0', fontSize: '14px', fontWeight: 700, color: '#1e1b2e' }}>{inv.amount}.00 TL</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style={{ padding: '16px 0', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>KDV (%20)</td>
            <td style={{ textAlign: 'right', padding: '16px 0', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>{(inv.amount * 0.2).toFixed(2)} TL</td>
          </tr>
          <tr style={{ borderTop: '2px solid #1e1b2e' }}>
            <td style={{ padding: '16px 0', fontSize: '18px', fontWeight: 800, color: '#1e1b2e' }}>Toplam</td>
            <td style={{ textAlign: 'right', padding: '16px 0', fontSize: '22px', fontWeight: 900, color: '#1e1b2e' }}>{(inv.amount * 1.2).toFixed(2)} TL</td>
          </tr>
        </tfoot>
      </table>
      <div style={{ borderTop: '1px solid #f0ece6', paddingTop: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', color: '#d4d0c8', margin: 0 }}>© 2026 REVY · Bu fatura FSBO.app üzerinden oluşturulmuştur.</p>
        <p style={{ fontSize: '10px', color: '#d4d0c8', margin: '2px 0 0' }}>FSBO Emlak Paneli · Levent, Beşiktaş, İstanbul</p>
      </div>
    </div>
  )
}

export default function Account() {
  const navigate = useNavigate()
  const {
    user, authError, clearError,
    updateProfile, updatePassword, logout,
    subscribeToPlan, cancelSubscription, getInvoices,
  } = useAuth()
  const { addToast } = useApp()
  const fileRef = useRef(null)
  const invoiceRef = useRef(null)

  const [activeTab, setActiveTab] = useState('kisisel')

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [age, setAge] = useState(user?.profile?.age || '')
  const [education, setEducation] = useState(user?.profile?.education || '')
  const [phoneProfile, setPhoneProfile] = useState(user?.profile?.phone || '')
  const [bioProfile, setBioProfile] = useState(user?.profile?.bio || '')
  const [interests, setInterests] = useState(user?.profile?.interests || [])
  const [platforms, setPlatforms] = useState(user?.profile?.platforms || [])
  const [title, setTitle] = useState(user?.profile?.title || '')
  const [certificates, setCertificates] = useState(user?.profile?.certificates || [])
  const [certInput, setCertInput] = useState('')
  const certInputRef = useRef(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [selectedPlan, setSelectedPlan] = useState(null)
  const [payStep, setPayStep] = useState('plans')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')

  const [invoices, setInvoices] = useState([])
  const [invoicesLoading, setInvoicesLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)

  const [cancelStep, setCancelStep] = useState(null)
  const [cancelReasons, setCancelReasons] = useState([])
  const [cancelOtherText, setCancelOtherText] = useState('')
  const [callbackRequested, setCallbackRequested] = useState(false)
  const [callbackPhone, setCallbackPhone] = useState('')
  const [rating, setRating] = useState(0)
  const [ratingHover, setRatingHover] = useState(0)

  const currentPlan = user?.subscription

  useEffect(() => {
    getInvoices().then(data => { setInvoices(data); setInvoicesLoading(false) })
  }, [getInvoices])

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    clearError()
    await updateProfile({ name, email, avatar: avatarPreview || avatar })
    addToast('Profil güncellendi')
  }

  const toggleInterest = (val) => {
    setInterests(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val])
  }

  const togglePlatform = (key) => {
    setPlatforms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key])
  }

  const addCertificate = () => {
    const val = certInput.trim()
    if (!val || certificates.includes(val)) return
    setCertificates(prev => [...prev, val])
    setCertInput('')
    certInputRef.current?.focus()
  }

  const removeCertificate = (val) => {
    setCertificates(prev => prev.filter(c => c !== val))
  }

  const handleSaveProfileDetails = async () => {
    await updateProfile({
      profile: {
        ...user?.profile,
        age, education, phone: phoneProfile, bio: bioProfile,
        interests, platforms, title, certificates,
      },
    })
    addToast('Profil detaylari guncellendi')
  }

  const handleChangePassword = async () => {
    clearError()
    if (newPassword !== confirmPassword) { addToast('Yeni şifreler eşleşmiyor', 'error'); return }
    const ok = await updatePassword(currentPassword, newPassword)
    if (ok) {
      addToast('Şifre değiştirildi')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    }
  }

  const handleSelectPlan = (plan) => {
    if (plan.price === 0) { handleSubscribe(plan.id); return }
    setSelectedPlan(plan); setPayStep('payment')
  }

  const handleSubscribe = async (planId) => {
    const ok = await subscribeToPlan(planId)
    if (ok) { addToast('Abonelik aktifleştirildi'); setPayStep('plans'); setSelectedPlan(null) }
  }

  const startCancelFlow = () => {
    setCancelStep(1)
    setCancelReasons([])
    setCancelOtherText('')
    setCallbackRequested(false)
    setCallbackPhone('')
    setRating(0)
  }

  const handleCancelConfirm = async () => {
    const ok = await cancelSubscription()
    if (ok) {
      addToast('Aboneliğiniz iptal edildi')
      setCancelStep(null)
    }
  }

  const closeCancelFlow = () => setCancelStep(null)

  const downloadInvoice = useCallback(async (inv) => {
    setDownloading(inv.id)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const container = invoiceRef.current
      if (!container) return
      const children = [...container.children]
      const targetEl = children.find(c => c.textContent.includes(inv.id))
      if (!targetEl) return
      const temp = document.createElement('div')
      temp.style.cssText = 'position:fixed;left:0;top:0;width:794px;z-index:9999;background:#fff;pointer-events:none'
      temp.appendChild(targetEl.cloneNode(true))
      document.body.appendChild(temp)
      await html2pdf().set({ margin: 0, filename: `${inv.id} - ${inv.plan} Plani.pdf`, image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2, useCORS: true, logging: false }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } }).from(temp).outputPdf('blob').then((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `${inv.id} - ${inv.plan} Plani.pdf`
        document.body.appendChild(a); a.click()
        document.body.removeChild(a); URL.revokeObjectURL(url)
        addToast(`${inv.id} indiriliyor...`)
      })
      document.body.removeChild(temp)
    } catch { addToast('Fatura indirilirken hata oluştu.', 'error') }
    finally { setDownloading(null) }
  }, [addToast])

  const handleChangePlanBack = () => { setPayStep('plans'); setSelectedPlan(null); setCardNumber(''); setCardExpiry(''); setCardCvc('') }

  const inputClass = 'w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200 border-cardBorder'

  if (payStep === 'payment' && selectedPlan) {
    return (
      <div className="min-h-screen bg-cream antialiased">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <button onClick={handleChangePlanBack} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-deep transition-colors">
            <ArrowLeft size={14} /> Planlara Dön
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-deep">Ödeme</h1>
            <p className="text-sm text-gray-500 font-medium mt-1"><span className="font-bold">{selectedPlan.name}</span> planına geçiyorsunuz</p>
          </div>
          <div className="bg-white rounded-3xl border border-cardBorder p-6 space-y-5">
            <div className="flex items-center gap-2"><CreditCard size={16} className="text-gray-400" /><h2 className="text-sm font-extrabold text-deep">Kart Bilgileri</h2></div>
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Kart Numarası</label>
                <input value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))} placeholder="1234 5678 9012 3456" className={inputClass} style={{ color: '#1e1b2e' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Son Kullanma</label>
                  <input value={cardExpiry} onChange={e => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); setCardExpiry(v) }} placeholder="AA/YY" className={inputClass} style={{ color: '#1e1b2e' }} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">CVC</label>
                  <input value={cardCvc} onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="123" className={inputClass} style={{ color: '#1e1b2e' }} />
                </div>
              </div>
            </div>
            <div className="bg-cream rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-500"><span>{selectedPlan.name} Planı</span><span>{selectedPlan.price} TL / ay</span></div>
              <div className="border-t border-cardBorder pt-2 flex justify-between text-sm font-extrabold text-deep"><span>Toplam</span><span>{selectedPlan.price} TL</span></div>
            </div>
            <button onClick={() => handleSubscribe(selectedPlan.id)}
              className="w-full inline-flex items-center justify-center gap-2 font-extrabold rounded-2xl transition-all duration-200 btn px-4 py-2.5 text-xs text-deep shadow-lg"
              style={{ background: '#e3d10d', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}>
              {selectedPlan.price} TL Öde</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream antialiased">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-deep">Hesabım</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Profil, abonelik ve fatura bilgilerinizi yönetin</p>
        </div>

        {/* Account Tabs */}
        <div className="flex gap-2 border-b border-cardBorder pb-0.5">
          {accountTabs.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all duration-200 ${
                  active
                    ? 'text-deep bg-white border border-cardBorder border-b-white -mb-px shadow-sm'
                    : 'text-gray-400 hover:text-deep hover:bg-white/50'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* === KİŞİSEL BİLGİLER === */}
        {activeTab === 'kisisel' && (
          <div className="animate-fadeIn space-y-6">
            <div className="bg-white rounded-3xl border border-cardBorder p-6 space-y-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cardBorder">
                    {avatarPreview || avatar ? (
                      <img src={avatarPreview || avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <DefaultAvatar className="w-full h-full" size={80} />
                    )}
                  </div>
                  <button onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-deep flex items-center justify-center shadow-md hover:bg-accentDark transition-colors">
                    <Camera size={13} strokeWidth={2.5} /></button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-deep">{user?.name}</p>
                  <p className="text-xs text-gray-400 font-medium">{user?.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}</p>
                  {currentPlan && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-softMint text-green-700">
                      <Check size={10} />{planLabels[currentPlan.planId] || currentPlan.planId}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-cardBorder p-6 space-y-5">
              <div className="flex items-center gap-2"><User size={16} className="text-gray-400" /><h2 className="text-sm font-extrabold text-deep">Kişisel Bilgiler</h2></div>
              <div className="grid gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Ad Soyad</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Adınız" className={inputClass} style={{ color: '#1e1b2e' }} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">E-posta</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta adresiniz" className={inputClass} style={{ color: '#1e1b2e' }} />
                </div>
              </div>
              {authError && <p className="text-xs text-red-400 font-medium">{authError}</p>}
              <button onClick={handleSaveProfile}
                className="w-full inline-flex items-center justify-center gap-2 font-extrabold rounded-2xl transition-all duration-200 btn px-4 py-2.5 text-xs text-deep shadow-lg"
                style={{ background: '#e3d10d', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}>Kaydet</button>
            </div>

            <div className="bg-white rounded-3xl border border-cardBorder p-6 space-y-5">
              <div className="flex items-center gap-2"><User size={16} className="text-gray-400" /><h2 className="text-sm font-extrabold text-deep">Profil Detaylari</h2></div>
              <div className="grid gap-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                      <Calendar size={13} />Yas
                    </label>
                    <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25" min="18" max="120" className={inputClass} style={{ color: '#1e1b2e' }} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                      <GraduationCap size={13} />Egitim
                    </label>
                    <select value={education} onChange={e => setEducation(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] appearance-none cursor-pointer"
                      style={{ color: education ? '#1e1b2e' : '#9ca3af' }}>
                      <option value="">Seciniz</option>
                      {['İlköğretim','Lise','Ön Lisans','Lisans','Yüksek Lisans','Doktora'].map(e => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} />Telefon
                  </label>
                  <input type="tel" value={phoneProfile} onChange={e => setPhoneProfile(e.target.value)} placeholder="+90 5XX XXX XX XX" className={inputClass} style={{ color: '#1e1b2e' }} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <Briefcase size={13} />Unvan
                  </label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Gayrimenkul Danismani, Broker..." className={inputClass} style={{ color: '#1e1b2e' }} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <BookHeart size={13} />Ilgilendiginiz emlak turleri
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Kiralık Ev','Satılık Ev','Villa','Daire','Arsa','Ofis','Yatırımlık','Tatillik'].map(val => (
                      <button key={val} type="button" onClick={() => toggleInterest(val)}
                        className={`px-3.5 py-2 rounded-xl text-[11px] font-bold btn transition-all ${
                          interests.includes(val) ? 'text-white shadow-sm' : 'bg-cream border border-cardBorder text-gray-500 hover:border-accent'
                        }`}
                        style={interests.includes(val) ? { background: '#1e1b2e' } : {}}>{val}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <Globe size={13} />Kullandiginiz platformlar
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[{key:'hepsiemlak',label:'Hepsiemlak'},{key:'emlakjet',label:'Emlak Jet'},{key:'hurriyetemlak',label:'Hürriyet Emlak'},{key:'sahibinden',label:'Sahibinden'}].map(p => (
                      <button key={p.key} type="button" onClick={() => togglePlatform(p.key)}
                        className={`px-3.5 py-2 rounded-xl text-[11px] font-bold btn transition-all ${
                          platforms.includes(p.key) ? 'text-white shadow-sm' : 'bg-cream border border-cardBorder text-gray-500 hover:border-accent'
                        }`}
                        style={platforms.includes(p.key) ? { background: '#1e1b2e' } : {}}>{p.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <Award size={13} />Sertifikalar
                  </label>
                  <div className="flex gap-2">
                    <input ref={certInputRef} type="text" value={certInput} onChange={e => setCertInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCertificate() }}}
                      placeholder="Sertifika adi yazip ekleyin..." className="flex-1 px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)]"
                      style={{ color: '#1e1b2e' }} />
                    <button type="button" onClick={addCertificate} disabled={!certInput.trim()}
                      className="px-4 py-3 rounded-2xl text-xs font-extrabold transition-all btn disabled:opacity-40"
                      style={{ background: '#e3d10d', color: '#1e1b2e' }}><Plus size={16} strokeWidth={2.5} /></button>
                  </div>
                  {certificates.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {certificates.map(cert => (
                        <span key={cert} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm text-white"
                          style={{ background: '#1e1b2e' }}>
                          {cert}
                          <button type="button" onClick={() => removeCertificate(cert)} className="hover:opacity-70 transition-opacity btn"><X size={12} strokeWidth={2.5} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Kendinizden bahsedin</label>
                  <textarea value={bioProfile} onChange={e => setBioProfile(e.target.value)}
                    placeholder="Kendinizden bahsedin..." rows={3}
                    className="w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold outline-none transition-all border-cardBorder focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] resize-none"
                    style={{ color: '#1e1b2e' }} />
                </div>
              </div>
              <button onClick={handleSaveProfileDetails}
                className="w-full inline-flex items-center justify-center gap-2 font-extrabold rounded-2xl transition-all duration-200 btn px-4 py-2.5 text-xs text-deep shadow-lg"
                style={{ background: '#e3d10d', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}>Profil Detaylarini Kaydet</button>
            </div>

            <div className="bg-white rounded-3xl border border-cardBorder p-6 space-y-5">
              <div className="flex items-center gap-2"><Lock size={16} className="text-gray-400" /><h2 className="text-sm font-extrabold text-deep">Şifre Değiştir</h2></div>
              <div className="grid gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Mevcut Şifre</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••" className={inputClass} style={{ color: '#1e1b2e' }} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Yeni Şifre</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••" className={inputClass} style={{ color: '#1e1b2e' }} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Yeni Şifre (Tekrar)</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••" className={inputClass} style={{ color: '#1e1b2e' }} />
                </div>
              </div>
              {authError && <p className="text-xs text-red-400 font-medium">{authError}</p>}
              <button onClick={handleChangePassword}
                className="w-full inline-flex items-center justify-center gap-2 font-extrabold rounded-2xl transition-all duration-200 btn px-4 py-2.5 text-xs border-2 border-cardBorder text-deep">
                Şifreyi Güncelle</button>
            </div>
          </div>
        )}

        {/* === ABONELİK & FATURALAMA === */}
        {activeTab === 'abonelik' && (
          <div className="animate-fadeIn space-y-6">
            <div className="bg-white rounded-3xl border border-cardBorder p-6 space-y-4">
              <div className="flex items-center gap-2"><Crown size={16} className="text-gray-400" /><h2 className="text-sm font-extrabold text-deep">Abonelik</h2></div>
              {currentPlan ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-extrabold text-deep">{planLabels[currentPlan.planId] || currentPlan.planId}</p>
                      <p className="text-xs text-gray-400 font-medium">{currentPlan.status === 'active' ? 'Aktif' : 'İptal Edildi'} &middot; {currentPlan.since} tarihinden beri</p>
                      {currentPlan.status === 'active' && currentPlan.renewsAt && <p className="text-xs text-gray-400 font-medium">{currentPlan.renewsAt} tarihinde yenilenecek</p>}
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${currentPlan.status === 'active' ? 'bg-softMint text-green-700' : 'bg-softPink text-red-600'}`}>
                      {currentPlan.status === 'active' ? <Check size={10} /> : <X size={10} />}{currentPlan.status === 'active' ? 'Aktif' : 'İptal Edildi'}</span>
                  </div>
                  {currentPlan.status === 'active' && !cancelStep && (
                    <button onClick={startCancelFlow} className="w-full inline-flex items-center justify-center gap-2 font-extrabold rounded-2xl transition-all duration-200 btn px-4 py-2.5 text-xs text-white"
                      style={{ background: '#dc2626' }}>Aboneliği İptal Et</button>
                  )}

                  {cancelStep === 1 && (
                    <div className="space-y-4 pt-2 border-t border-cardBorder animate-slide-down">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold text-deep">Aboneliğinizi neden iptal etmek istiyorsunuz?</h3>
                        <button onClick={closeCancelFlow} className="text-[10px] font-bold text-gray-400 hover:text-deep transition-colors">Vazgeç</button>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium">Birden fazla seçenek işaretleyebilirsiniz</p>
                      <div className="space-y-1.5">
                        {CANCEL_REASONS.map(reason => (
                          <label
                            key={reason.id}
                            onClick={() => setCancelReasons(prev =>
                              prev.includes(reason.id) ? prev.filter(r => r !== reason.id) : [...prev, reason.id]
                            )}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                              cancelReasons.includes(reason.id)
                                ? 'border-accent bg-accent/5'
                                : 'border-cardBorder hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                              cancelReasons.includes(reason.id) ? 'bg-accent border-accent' : 'border-gray-300'
                            }`}>
                              {cancelReasons.includes(reason.id) && <Check size={10} className="text-deep" strokeWidth={3} />}
                            </div>
                            <span className="text-[11px] font-semibold text-deep">{reason.label}</span>
                          </label>
                        ))}
                        {cancelReasons.includes('diger') && (
                          <textarea value={cancelOtherText} onChange={e => setCancelOtherText(e.target.value)}
                            placeholder="Açıklamanızı yazın..." rows={2}
                            className="w-full px-3 py-2 rounded-xl border-2 bg-cream text-xs font-semibold focus:border-accent outline-none transition-all duration-200 border-cardBorder mt-1"
                            style={{ color: '#1e1b2e' }} />
                        )}
                      </div>
                      <button onClick={() => setCancelStep(2)} disabled={cancelReasons.length === 0}
                        className="w-full inline-flex items-center justify-center gap-2 font-extrabold rounded-2xl transition-all duration-200 btn px-4 py-2 text-xs text-deep shadow-lg disabled:opacity-40"
                        style={{ background: '#e3d10d' }}>Devam Et</button>
                    </div>
                  )}

                  {cancelStep === 2 && (
                    <div className="space-y-4 pt-2 border-t border-cardBorder animate-slide-down">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold text-deep">Sizi geri aramamızı ister misiniz?</h3>
                        <button onClick={closeCancelFlow} className="text-[10px] font-bold text-gray-400 hover:text-deep transition-colors">Vazgeç</button>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium">İptal talebinizle ilgili size yardımcı olabiliriz</p>
                      <label
                        onClick={() => setCallbackRequested(!callbackRequested)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border-2 border-cardBorder cursor-pointer hover:border-gray-300 transition-all duration-200"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          callbackRequested ? 'bg-accent border-accent' : 'border-gray-300'
                        }`}>
                          {callbackRequested && <Check size={10} className="text-deep" strokeWidth={3} />}
                        </div>
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-[11px] font-semibold text-deep">Beni geri arayın</span>
                      </label>
                      {callbackRequested && (
                        <div className="animate-slide-down">
                          <label className="text-[10px] font-bold text-gray-500 mb-1 block">Telefon Numarası</label>
                          <input value={callbackPhone} onChange={e => setCallbackPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                            placeholder="5XX XXX XX XX"
                            className="w-full px-3 py-2 rounded-xl border-2 bg-cream text-xs font-semibold focus:border-accent outline-none transition-all duration-200 border-cardBorder"
                            style={{ color: '#1e1b2e' }} />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => setCancelStep(1)}
                          className="flex-1 inline-flex items-center justify-center gap-2 font-extrabold rounded-2xl transition-all duration-200 btn px-4 py-2 text-xs border-2 border-cardBorder text-deep">Geri</button>
                        <button onClick={() => setCancelStep(3)}
                          className="flex-1 inline-flex items-center justify-center gap-2 font-extrabold rounded-2xl transition-all duration-200 btn px-4 py-2 text-xs text-deep shadow-lg"
                          style={{ background: '#e3d10d' }}>Devam Et</button>
                      </div>
                    </div>
                  )}

                  {cancelStep === 3 && (
                    <div className="space-y-4 pt-2 border-t border-cardBorder animate-slide-down">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold text-deep">Deneyiminizi puanlandırın</h3>
                        <button onClick={closeCancelFlow} className="text-[10px] font-bold text-gray-400 hover:text-deep transition-colors">Vazgeç</button>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium">FSBO deneyiminizi nasıl buldunuz?</p>
                      <div className="flex justify-center gap-1.5 py-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} onClick={() => setRating(star)}
                            onMouseEnter={() => setRatingHover(star)} onMouseLeave={() => setRatingHover(0)}
                            className="transition-all duration-150 hover:scale-110 active:scale-90">
                            <Star size={28} className={`transition-all duration-200 ${
                              (ratingHover || rating) >= star ? 'fill-accent text-accent' : 'text-gray-200'
                            }`} strokeWidth={1.5} />
                          </button>
                        ))}
                      </div>
                      {rating > 0 && rating <= 2 && <p className="text-center text-[10px] font-bold text-red-400">Üzgünüz, sizi memnun edemedik.</p>}
                      {rating === 3 && <p className="text-center text-[10px] font-bold text-amber-500">Geri bildiriminizle gelişelim!</p>}
                      {rating >= 4 && <p className="text-center text-[10px] font-bold text-green-600">Güzel! Sizi kaybetmek istemeyiz.</p>}
                      <div className="flex gap-2">
                        <button onClick={() => setCancelStep(2)}
                          className="flex-1 inline-flex items-center justify-center gap-2 font-extrabold rounded-2xl transition-all duration-200 btn px-4 py-2 text-xs border-2 border-cardBorder text-deep">Geri</button>
                        <button onClick={handleCancelConfirm} disabled={rating === 0}
                          className="flex-1 inline-flex items-center justify-center gap-2 font-extrabold rounded-2xl transition-all duration-200 btn px-4 py-2 text-xs text-white disabled:opacity-40"
                          style={{ background: '#dc2626' }}>Aboneliği İptal Et</button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-500 font-medium">Aktif aboneliğiniz bulunmuyor. Aşağıdan bir plan seçin.</p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {PLANS.map(plan => {
                const isCurrent = currentPlan?.planId === plan.id && currentPlan?.status === 'active'
                return (
                  <div key={plan.id}
                    className={`relative bg-white rounded-3xl border-2 p-6 flex flex-col transition-all duration-200 ${plan.popular ? 'border-accent shadow-[0_8px_32px_rgba(227,209,13,.15)]' : 'border-cardBorder'} ${isCurrent ? 'ring-2 ring-accent' : ''}`}>
                    {plan.popular && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-extrabold px-3 py-1 rounded-full bg-accent text-deep uppercase tracking-wider">Popüler</span>}
                    {isCurrent && <span className="absolute -top-2.5 right-4 text-[9px] font-extrabold px-3 py-1 rounded-full bg-softMint text-green-700 uppercase tracking-wider">Aktif</span>}
                    <div className="mb-4">
                      <h3 className="text-sm font-extrabold text-deep">{plan.name}</h3>
                      <div className="mt-2 flex items-baseline gap-0.5"><span className="text-3xl font-extrabold text-deep">{plan.price}</span><span className="text-xs font-bold text-gray-400">TL / ay</span></div>
                      {plan.price === 0 && <p className="text-xs text-gray-400 font-medium mt-0.5">Ücretsiz</p>}
                    </div>
                    <ul className="space-y-2 flex-1 mb-6">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-semibold text-gray-600">
                          <Check size={13} className="text-green-500 mt-0.5 flex-shrink-0" />{f}</li>
                      ))}
                    </ul>
                    <button onClick={() => handleSelectPlan(plan)} disabled={isCurrent}
                      className={`w-full inline-flex items-center justify-center gap-2 font-extrabold rounded-2xl transition-all duration-200 btn px-4 py-2.5 text-xs ${plan.popular ? 'text-deep shadow-lg' : 'border-2 border-cardBorder text-deep'} ${isCurrent ? 'opacity-40 pointer-events-none' : ''}`}
                      style={plan.popular ? { background: '#e3d10d', boxShadow: '0 8px 24px rgba(227,209,13,.25)' } : {}}>
                      {isCurrent ? 'Mevcut Plan' : plan.price === 0 ? 'Ücretsiz Başla' : 'Seç'}</button>
                  </div>
                )
              })}
            </div>

            <div className="bg-white rounded-3xl border border-cardBorder overflow-hidden">
              <div className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-2"><FileText size={16} className="text-gray-400" /><h2 className="text-sm font-extrabold text-deep">Fatura Geçmişi</h2></div>
              </div>
              {invoicesLoading ? (
                <div className="p-8 text-center text-sm text-gray-400 font-semibold">Yükleniyor...</div>
              ) : invoices.length === 0 ? (
                <div className="p-8 text-center"><FileText size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-sm text-gray-400 font-semibold">Henüz fatura bulunmuyor</p></div>
              ) : (
                <div className="divide-y divide-cardBorder">
                  {invoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between px-6 py-4 hover:bg-cream/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center"><FileText size={16} className="text-gray-400" /></div>
                        <div>
                          <p className="text-sm font-extrabold text-deep">{inv.id}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{inv.date} &middot; {inv.plan} Planı</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-deep">{inv.amount} TL</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-softMint text-green-700"><Check size={10} /> Ödendi</span>
                        <button onClick={() => downloadInvoice(inv)} disabled={downloading === inv.id}
                          className="w-8 h-8 rounded-lg border border-cardBorder flex items-center justify-center hover:bg-cream transition-colors disabled:opacity-40" title="Faturayı İndir">
                          {downloading === inv.id ? <Loader2 size={13} className="text-gray-400 animate-spin" /> : <Download size={13} className="text-gray-400" />}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === HESAP İŞLEMLERİ === */}
        {activeTab === 'islemler' && (
          <div className="animate-fadeIn space-y-6">
            {user?.role === 'admin' && (
              <div className="bg-white rounded-3xl border border-cardBorder p-6 space-y-3">
                <div className="flex items-center gap-2"><Shield size={16} className="text-gray-400" /><h2 className="text-sm font-extrabold text-deep">Yetkiler</h2></div>
                <p className="text-xs text-gray-500 font-medium">Yönetici yetkilerine sahipsiniz.</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-softBlue text-blue-700"><Shield size={10} />Admin</span>
              </div>
            )}

            <div className="border-t border-cardBorder pt-6">
              <button onClick={() => { logout(); addToast('Çıkış yapıldı'); navigate('/giris') }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-extrabold text-red-500 hover:bg-red-50 transition-all duration-200 btn border-2 border-red-100">
                <LogOut size={16} />Çıkış Yap
              </button>
              <p className="text-[10px] text-gray-300 font-medium text-center mt-3">© 2026 REVY</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden invoice templates */}
      <div ref={invoiceRef} style={{ position: 'fixed', left: 0, top: 0, zIndex: -9999, opacity: 0.01, pointerEvents: 'none', overflow: 'hidden' }}>
        {invoices.map(inv => (<InvoiceTemplate key={inv.id} inv={inv} user={user} />))}
      </div>
    </div>
  )
}
