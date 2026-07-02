import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Compass,
  Heart,
  Bookmark,
  Users,
  Bot,
  Sun,
  ArrowRight,
  Check,
  Star,
  MessageSquare,
  Calendar,
  MapPin,
  Maximize2,
  SlidersHorizontal,
  Shield,
  Zap,
  Lock,
  Menu,
  X,
  Plus,
  Send,
  AlertTriangle
} from 'lucide-react'
import { usePropertyData } from '../context/PropertiesContext'
import { PLANS } from '../config'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const navigate = useNavigate()
  const { properties } = usePropertyData()
  const { isAuthenticated } = useAuth()

  // State Declarations
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDemoTab, setActiveDemoTab] = useState('map')
  const [faqOpen, setFaqOpen] = useState({})
  
  // Interactive Simulator States
  const [hoveredPrice, setHoveredPrice] = useState(false)
  const [aiChatMessages, setAiChatMessages] = useState([
    { sender: 'ai', text: 'Merhaba! Ben FSBOAI. Takip ettiğiniz emlaklar hakkında bilgi alabilir, pazar analizi isteyebilir veya randevularınızı sorgulayabilirsiniz. Size nasıl yardımcı olabilirim?' }
  ])
  const [aiTyping, setAiTyping] = useState(false)
  const [calendarAppointments, setCalendarAppointments] = useState([
    { id: 1, title: 'Serencebey İlan Sahibi Görüşmesi', time: '10:00 - 11:30', client: 'Ahmet Yılmaz', type: 'approved' },
    { id: 2, title: 'Levazım Daire Sunumu', time: '14:00 - 15:30', client: 'Buse Demir', type: 'pending' }
  ])
  const [calendarConflictMsg, setCalendarConflictMsg] = useState('')
  const [shakeCalendar, setShakeCalendar] = useState(false)
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false)

  // Auto-scroll helper
  const chatBottomRef = useRef(null)
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [aiChatMessages, aiTyping])

  // Navigation handlers
  const handleNavClick = (e, targetId) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMobileMenuOpen(false)
    }
  }

  const navigateToLogin = (mode = 'login') => {
    navigate('/giris', { state: { mode } })
  }

  // FAQ Toggle Helper
  const toggleFaq = (index) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  // Interactive AI Assistant Simulation
  const simulateAiResponse = (userText, aiText) => {
    if (aiTyping) return
    setAiChatMessages(prev => [...prev, { sender: 'user', text: userText }])
    setAiTyping(true)

    setTimeout(() => {
      setAiTyping(false)
      setAiChatMessages(prev => [...prev, { sender: 'ai', text: aiText }])
    }, 1500)
  }

  // Calendar Conflict Simulator
  const handleAddConflictingAppointment = () => {
    setShakeCalendar(true)
    setCalendarConflictMsg('⚠️ ÇAKIŞMA UYARISI: Saat 14:30 - 15:30 arasında "Buse Demir" ile zaten beklemede olan bir randevunuz var! Çakışma nedeniyle randevu eklenemedi.')
    
    setTimeout(() => {
      setShakeCalendar(false)
    }, 600)
  }

  // Form Submits
  const handleContactSubmit = (e) => {
    e.preventDefault()
    setContactSubmitted(true)
    setTimeout(() => setContactSubmitted(false), 5000)
  }

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (!newsletterEmail) return
    setNewsletterSubmitted(true)
    setNewsletterEmail('')
    setTimeout(() => setNewsletterSubmitted(false), 5000)
  }

  // Extract featured listings from properties.js
  const featuredProperties = [properties.p1, properties.p3, properties.p6].filter(Boolean)

  const faqData = [
    {
      q: 'FSBO Emlak Platformu tam olarak ne işe yarar?',
      a: 'FSBO, emlak danışmanları ve bireysel yatırımcılar için geliştirilmiş akıllı bir yönetim panelidir. Sahibi tarafından satılık/kiralık ilanları takip etmenizi, bunları harita üzerinde filtrelemenizi, portföyünüzünü yönetmenizi, randevularınızı çakışma kontrolüyle planlamanızı ve yapay zeka yardımıyla pazar analizi yapmanızı sağlar.'
    },
    {
      q: 'Yapay zeka asistanı (FSBOAI) hangi konularda yardımcı olur?',
      a: 'FSBOAI, bölge bazlı fiyat analizleri yapabilir, yeni oluşturduğunuz ilanlar için SEO uyumlu ve yüksek dönüşümlü ilan açıklamaları yazabilir, portföyünüzdeki mülklere en uygun alıcı/kiracı müşteri adaylarını eşleştirebilir.'
    },
    {
      q: 'Randevu takvimindeki çakışma tespiti nasıl çalışır?',
      a: 'Takvim sistemimiz, eklemek istediğiniz yeni bir randevunun gün ve saat aralığını mevcut aktif ve bekleyen randevularınızla karşılaştırır. Eğer çakışan bir zaman dilimi tespit edilirse, sistem sizi uyararak çakışmayı önler ve hatalı planlamaların önüne geçer.'
    },
    {
      q: 'İstediğim zaman aboneliğimi iptal edebilir miyim?',
      a: 'Evet, Pro ve Kurumsal aboneliklerinizi herhangi bir taahhüt olmadan dilediğiniz an iptal edebilirsiniz. İptal durumunda o dönem sonuna kadar premium özellikleri kullanmaya devam edersiniz.'
    }
  ]

  return (
    <div className="min-h-screen bg-cream font-jakarta text-deep antialiased">
      {/* 1. Header & Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-cardBorder/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md bg-deep text-accent">
                <Building2 size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-deep">FSBO</span>
                <span className="block text-[9px] font-bold text-accentDark uppercase tracking-widest -mt-1">Emlak Platformu</span>
              </div>
            </div>

            {/* Desktop Nav Items */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#ozellikler" onClick={(e) => handleNavClick(e, 'ozellikler')} className="text-sm font-bold text-gray-500 hover:text-deep transition-colors duration-200">Özellikler</a>
              <a href="#kesfet" onClick={(e) => handleNavClick(e, 'kesfet')} className="text-sm font-bold text-gray-500 hover:text-deep transition-colors duration-200">İnteraktif Arayüz</a>
              <a href="#ilanlar" onClick={(e) => handleNavClick(e, 'ilanlar')} className="text-sm font-bold text-gray-500 hover:text-deep transition-colors duration-200">Öne Çıkanlar</a>
              <a href="#fiyatlar" onClick={(e) => handleNavClick(e, 'fiyatlar')} className="text-sm font-bold text-gray-500 hover:text-deep transition-colors duration-200">Fiyatlar</a>
              <a href="#sss" onClick={(e) => handleNavClick(e, 'sss')} className="text-sm font-bold text-gray-500 hover:text-deep transition-colors duration-200">SSS</a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/')}
                  className="px-5 py-2.5 rounded-2xl text-sm font-extrabold shadow-md flex items-center gap-1.5 transition-all duration-200 btn"
                  style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 4px 16px rgba(227,209,13,.2)' }}
                >
                  Panele Git
                  <ArrowRight size={15} strokeWidth={2.5} />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigateToLogin('login')}
                    className="px-5 py-2.5 rounded-2xl text-sm font-extrabold text-deep hover:bg-gray-100/80 transition-all duration-200"
                  >
                    Giriş Yap
                  </button>
                  <button
                    onClick={() => navigateToLogin('register')}
                    className="px-5 py-2.5 rounded-2xl text-sm font-extrabold shadow-md flex items-center gap-1.5 transition-all duration-200 btn"
                    style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 4px 16px rgba(227,209,13,.2)' }}
                  >
                    Ücretsiz Başla
                    <ArrowRight size={15} strokeWidth={2.5} />
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X size={22} className="text-deep" /> : <Menu size={22} className="text-deep" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-cardBorder px-4 pt-2 pb-6 space-y-3 shadow-lg animate-slide-down">
            <a href="#ozellikler" onClick={(e) => handleNavClick(e, 'ozellikler')} className="block px-3 py-2.5 rounded-xl text-base font-bold text-gray-600 hover:bg-cream hover:text-deep">Özellikler</a>
            <a href="#kesfet" onClick={(e) => handleNavClick(e, 'kesfet')} className="block px-3 py-2.5 rounded-xl text-base font-bold text-gray-600 hover:bg-cream hover:text-deep">İnteraktif Arayüz</a>
            <a href="#ilanlar" onClick={(e) => handleNavClick(e, 'ilanlar')} className="block px-3 py-2.5 rounded-xl text-base font-bold text-gray-600 hover:bg-cream hover:text-deep">Öne Çıkanlar</a>
            <a href="#fiyatlar" onClick={(e) => handleNavClick(e, 'fiyatlar')} className="block px-3 py-2.5 rounded-xl text-base font-bold text-gray-600 hover:bg-cream hover:text-deep">Fiyatlar</a>
            <a href="#sss" onClick={(e) => handleNavClick(e, 'sss')} className="block px-3 py-2.5 rounded-xl text-base font-bold text-gray-600 hover:bg-cream hover:text-deep">SSS</a>
            <div className="pt-4 border-t border-cardBorder flex flex-col gap-3">
              {isAuthenticated ? (
                <button
                  onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                  className="w-full py-3 rounded-2xl text-center font-extrabold text-deep flex items-center justify-center gap-2 transition-all duration-200"
                  style={{ background: '#e3d10d' }}
                >
                  Panele Git
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigateToLogin('login')}
                    className="w-full py-3 rounded-2xl text-center font-extrabold text-deep border-2 border-cardBorder hover:bg-cream transition-all duration-200"
                  >
                    Giriş Yap
                  </button>
                  <button
                    onClick={() => navigateToLogin('register')}
                    className="w-full py-3 rounded-2xl text-center font-extrabold text-deep flex items-center justify-center gap-2 transition-all duration-200"
                    style={{ background: '#e3d10d' }}
                  >
                    Ücretsiz Başla
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-6 pb-24 md:pt-16 md:pb-32 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute top-1/2 right-10 w-[300px] h-[300px] rounded-full bg-orange/5 blur-[90px] pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Info */}
            <div className="lg:col-span-5 text-center lg:text-left space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/15 border border-accent/25 rounded-full text-accentDark text-xs font-bold uppercase tracking-wider animate-pulse">
                <SparklesIcon /> Yapay Zeka Destekli Yeni Nesil Emlakçılık
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-deep">
                Emlak Portföyünüzü <br />
                <span className="relative inline-block text-accentDark">
                  Yapay Zekayla
                  <span className="absolute bottom-1.5 left-0 w-full h-2 bg-accent/30 rounded-full -z-10"></span>
                </span> <br className="hidden sm:inline" />
                Yönetin!
              </h1>
              <p className="text-base sm:text-lg text-gray-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                FSBO ile ilanlarınızı harita üzerinde konumlandırın, FSBOAI ile pazar analizi çıkartın ve randevu takviminizi akıllı çakışma tespiti ile sıfır hata ile planlayın.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => isAuthenticated ? navigate('/') : navigateToLogin('register')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base shadow-xl flex items-center justify-center gap-2 hover:shadow-2xl transition-all duration-300 btn"
                  style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 32px rgba(227,209,13,.25)' }}
                >
                  {isAuthenticated ? 'Panele Git' : 'Ücretsiz Denemeye Başla'}
                  <ArrowRight size={18} strokeWidth={2.5} />
                </button>
                <a
                  href="#kesfet"
                  onClick={(e) => handleNavClick(e, 'kesfet')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base border-2 border-cardBorder bg-white/60 backdrop-blur-sm text-deep hover:bg-white transition-all duration-300 text-center"
                >
                  Sistemi İncele
                </a>
              </div>
            </div>

            {/* Right Interactive Mockup Dashboard */}
            <div className="lg:col-span-7 relative">
              <div className="relative mx-auto max-w-[620px] bg-white rounded-[32px] border border-cardBorder shadow-[0_24px_70px_rgba(30,27,46,.08)] p-4 sm:p-5 animate-scale-in">
                {/* Header elements in mock */}
                <div className="flex items-center justify-between pb-4 border-b border-cardBorder mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    <span className="text-[10px] font-extrabold text-gray-300 ml-2">FSBO_DASHBOARD_V2.0</span>
                  </div>
                  <div className="w-28 h-6 rounded-full bg-cream border border-cardBorder flex items-center justify-center">
                    <span className="text-[9px] font-extrabold text-accentDark">● AKTİF ÇALIŞIYOR</span>
                  </div>
                </div>

                {/* Grid Body */}
                <div className="grid grid-cols-12 gap-3 sm:gap-4">
                  {/* Left stats */}
                  <div className="col-span-12 sm:col-span-4 space-y-3 sm:space-y-4">
                    <div className="bg-cream rounded-2xl p-4 border border-cardBorder relative overflow-hidden group hover:border-accent transition-colors duration-200">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-accent/10 rounded-bl-xl flex items-center justify-center text-accentDark">
                        <Compass size={14} />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">İlan Sayısı</p>
                      <h4 className="text-2xl font-extrabold text-deep mt-1">1,248</h4>
                      <span className="text-[8px] font-bold text-emerald-500 mt-1 block">▲ Bugün +14 yeni ilan</span>
                    </div>

                    <div className="bg-cream rounded-2xl p-4 border border-cardBorder relative overflow-hidden group hover:border-accent transition-colors duration-200">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-500/10 rounded-bl-xl flex items-center justify-center text-indigo-500">
                        <Calendar size={14} />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Görüşmeler</p>
                      <h4 className="text-2xl font-extrabold text-deep mt-1">28</h4>
                      <span className="text-[8px] font-bold text-emerald-500 mt-1 block">✓ %100 Çakışmasız</span>
                    </div>
                  </div>

                  {/* Right mock UI */}
                  <div className="col-span-12 sm:col-span-8 bg-deep rounded-2xl p-4 border border-deep flex flex-col justify-between min-h-[220px] text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center text-deep">
                          <Bot size={12} strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-extrabold tracking-tight">FSBOAI Önerisi</span>
                      </div>
                      <span className="text-[8px] font-bold text-accent/80 uppercase">Valuation Engine</span>
                    </div>

                    <div className="my-4 bg-white/5 border border-white/10 rounded-xl p-3 text-xs leading-relaxed space-y-2">
                      <p className="text-white/60 font-semibold italic">"Serencebey Apartmanı'ndaki 3+1 portföyünüz için önerilen satış fiyatı..."</p>
                      <div className="flex items-center justify-between bg-accent/10 border border-accent/20 rounded-lg p-2">
                        <span className="text-[10px] font-bold text-accent">Pazar Ortalaması:</span>
                        <span className="text-sm font-black text-accent">₺14.600.000</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[9px] font-bold text-white/40">
                      <Shield size={10} /> Veriler anlık olarak Sahibinden.com veri tabanından analiz edilmektedir.
                    </div>
                  </div>
                </div>

                {/* Bottom Overlay Card */}
                <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 bg-white border border-cardBorder rounded-2xl shadow-xl p-3.5 max-w-[280px] animate-float">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Check size={18} strokeWidth={3} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-deep">Randevu Çakışması Engellendi</h5>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Sistem çakışan 2 randevuyu otomatik olarak düzeltti.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stats / Social Proof Section */}
      <section className="bg-white border-y border-cardBorder py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-cardBorder">
            <div className="text-center md:px-4 py-2">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-deep">10.000+</h3>
              <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wider mt-1.5">Günlük İlan Kontrolü</p>
            </div>
            <div className="text-center pt-8 md:pt-2 md:px-4">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-deep">%98.4</h3>
              <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wider mt-1.5">Randevu Başarı Oranı</p>
            </div>
            <div className="text-center pt-8 md:pt-2 md:px-4">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-deep">2 Saniye</h3>
              <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wider mt-1.5">AI Pazar Değerlemesi</p>
            </div>
            <div className="text-center pt-8 md:pt-2 md:px-4">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-deep">0 Çakışma</h3>
              <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wider mt-1.5">Akıllı Takvim Koruması</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Grid (Özellikler) */}
      <section id="ozellikler" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-black text-accentDark uppercase tracking-widest">Neler Yapabilirsiniz?</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-deep">Emlak Yönetimindeki Tüm Süreçleri Tek Ekrandan Yönetin</h3>
            <p className="text-base text-gray-500 font-semibold">
              FSBO platformu, emlak ilanlarını bulmaktan satış kapamaya kadar geçen tüm süreçlerinizi kolaylaştıran modern araçlar sunar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl border border-cardBorder p-8 hover:-translate-y-2 hover:shadow-xl hover:border-accent transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center text-accentDark group-hover:scale-110 transition-transform mb-6">
                <Compass size={22} strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-black text-deep mb-3">Harita Üzerinde Keşif</h4>
              <p className="text-sm text-gray-400 font-semibold leading-relaxed">
                İlanları İstanbul'un tüm mahallelerine göre harita üzerinde görüntüleyin. Detaylı harita filtresi ile tam aradığınız bölgedeki fırsat ilanlarını saniyeler içinde belirleyin.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl border border-cardBorder p-8 hover:-translate-y-2 hover:shadow-xl hover:border-accent transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform mb-6">
                <Bot size={22} strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-black text-deep mb-3">FSBOAI</h4>
              <p className="text-sm text-gray-400 font-semibold leading-relaxed">
                Asistanınızla sohbet ederek bölge fiyat analizleri alın, portföyünüzdeki mülklere en uygun alıcıları eşleştirin ve saniyeler içinde yüksek etkileşimli ilan metinleri yazdırın.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl border border-cardBorder p-8 hover:-translate-y-2 hover:shadow-xl hover:border-accent transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform mb-6">
                <Calendar size={22} strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-black text-deep mb-3">Akıllı Randevu Takvimi</h4>
              <p className="text-sm text-gray-400 font-semibold leading-relaxed">
                Müşteri randevularınızı haftalık ve aylık görünümlerde yönetin. Çakışma algılama motoru sayesinde, çakışan görüşmeleri sistem anında tespit ederek hata payını sıfıra indirir.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-3xl border border-cardBorder p-8 hover:-translate-y-2 hover:shadow-xl hover:border-accent transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform mb-6">
                <Bookmark size={22} strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-black text-deep mb-3">Portföy & Koleksiyonlar</h4>
              <p className="text-sm text-gray-400 font-semibold leading-relaxed">
                Beğendiğiniz ilanları favori listelerine kaydedin, arkadaşlarınızla veya müşterilerinizle paylaşmak için özel koleksiyonlar halinde gruplandırın.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-3xl border border-cardBorder p-8 hover:-translate-y-2 hover:shadow-xl hover:border-accent transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform mb-6">
                <Users size={22} strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-black text-deep mb-3">Gelişmiş Müşteri CRM</h4>
              <p className="text-sm text-gray-400 font-semibold leading-relaxed">
                Müşteri iletişim bilgileri, ilgilendikleri mülk türleri ve geçmiş randevu verilerini entegre CRM panelinde tutarak kurumsal hafızanızı koruyun.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-3xl border border-cardBorder p-8 hover:-translate-y-2 hover:shadow-xl hover:border-accent transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform mb-6">
                <Sun size={22} strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-black text-deep mb-3">Günlük İlan Bülteni</h4>
              <p className="text-sm text-gray-400 font-semibold leading-relaxed">
                Sisteme yeni düşen sahibi tarafından ilanları, interaktif hover önizleme özellikleri ile günlük akış halinde takip edin. Fırsatları ilk siz yakalayın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Demo Section */}
      <section id="kesfet" className="py-24 bg-white border-y border-cardBorder relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <h2 className="text-xs font-black text-accentDark uppercase tracking-widest">Deneyimleyin</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-deep">Sistemin Nasıl Çalıştığını Anında Test Edin</h3>
            <p className="text-base text-gray-500 font-semibold">
              Kayıt olmadan önce, projenin bazı öne çıkan işlevlerini aşağıda canlı olarak simüle edebilirsiniz.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Simulation Tabs */}
            <div className="flex bg-cream rounded-2xl p-1.5 max-w-xl mx-auto mb-8 border border-cardBorder shadow-sm">
              <button
                onClick={() => setActiveDemoTab('map')}
                className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeDemoTab === 'map' ? 'bg-white text-deep shadow-sm border border-cardBorder/40' : 'text-gray-400 hover:text-deep'
                }`}
              >
                <Compass size={16} />
                İlan Hover Kartı
              </button>
              <button
                onClick={() => setActiveDemoTab('ai')}
                className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeDemoTab === 'ai' ? 'bg-white text-deep shadow-sm border border-cardBorder/40' : 'text-gray-400 hover:text-deep'
                }`}
              >
                <Bot size={16} />
                AI Sohbet
              </button>
              <button
                onClick={() => setActiveDemoTab('calendar')}
                className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeDemoTab === 'calendar' ? 'bg-white text-deep shadow-sm border border-cardBorder/40' : 'text-gray-400 hover:text-deep'
                }`}
              >
                <Calendar size={16} />
                Çakışma Önleyici Takvim
              </button>
            </div>

            {/* Tab Contents */}
            <div className="bg-cream rounded-[32px] border border-cardBorder p-6 sm:p-8 min-h-[380px] flex items-center justify-center relative overflow-hidden shadow-inner">
              
              {/* TAB 1: HARİTA VE HOVER KARTI */}
              {activeDemoTab === 'map' && (
                <div className="w-full flex flex-col items-center gap-6 animate-scale-in">
                  <p className="text-xs font-bold text-gray-400 text-center max-w-md">
                    Haritadaki fiyat etiketinin üzerine gelerek (hover), projede kurulu olan dinamik ilan önizleme kartı animasyonunu görebilirsiniz.
                  </p>
                  
                  {/* Mock Map Arena */}
                  <div className="w-full max-w-[500px] h-[240px] rounded-3xl bg-slate-200 border-4 border-white shadow-lg relative overflow-hidden flex items-center justify-center">
                    {/* Simulated Abstract Map Lines */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <div className="absolute top-1/3 left-0 w-full h-1 bg-deep/50 transform -rotate-12"></div>
                      <div className="absolute top-2/3 left-0 w-full h-2 bg-deep/50 transform rotate-6"></div>
                      <div className="absolute top-0 left-1/4 w-1 h-full bg-deep/50 transform rotate-12"></div>
                      <div className="absolute top-0 left-2/3 w-2 h-full bg-deep/50 transform -rotate-6"></div>
                    </div>
                    
                    {/* Map Marker Pin */}
                    <div
                      className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 explore-marker"
                      onMouseEnter={() => setHoveredPrice(true)}
                      onMouseLeave={() => setHoveredPrice(false)}
                    >
                      <div className="explore-marker-inner">
                        <div className="explore-marker-label text-xs px-3 py-1.5 rounded-xl bg-deep text-accent font-black shadow-lg cursor-pointer transition-transform hover:scale-110">
                          ₺14.600.000
                        </div>
                        <div className="explore-marker-dot"></div>
                      </div>
                    </div>

                    <span className="absolute bottom-3 right-3 text-[9px] font-bold text-gray-400 bg-white/70 px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none">
                      İstanbul Beşiktaş Haritası (Simüle)
                    </span>

                    {/* Hover Card Popup */}
                    {hoveredPrice && (
                      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[240px] bg-deep/95 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-20 animate-toast-in pointer-events-none">
                        <img
                          src="https://i0.shbdn.com/photos/42/62/20/lthmb_1317426220amd.jpg"
                          alt=""
                          className="w-full h-28 object-cover"
                        />
                        <div className="p-3 space-y-1 text-white">
                          <span className="text-[8px] font-bold text-accent px-1.5 py-0.5 rounded bg-accent/20">Manzaralı</span>
                          <h5 className="text-[10px] font-extrabold text-white truncate mt-1">Serencebey Yokuşu Deniz Apt.</h5>
                          <p className="text-xs font-black text-accent">₺14.600.000</p>
                          <div className="flex gap-2 text-[8px] text-white/50 font-bold pt-1 border-t border-white/10 mt-1">
                            <span>130 m²</span>
                            <span>●</span>
                            <span>3+1</span>
                            <span>●</span>
                            <span>Beşiktaş</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: AI ASSISTANT CHAT */}
              {activeDemoTab === 'ai' && (
                <div className="w-full max-w-[500px] flex flex-col h-[340px] bg-white rounded-3xl border border-cardBorder shadow-lg overflow-hidden animate-scale-in">
                  {/* Chat Head */}
                  <div className="bg-deep px-4 py-3 text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-deep">
                      <Bot size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h5 className="text-xs font-black">FSBOAI</h5>
                      <span className="text-[8px] font-semibold text-accent/80">Çevrimiçi Emlak Danışmanı</span>
                    </div>
                  </div>

                  {/* Chat Message Box */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                    {aiChatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
                      >
                        <div
                          className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-accent text-deep rounded-tr-none'
                              : 'bg-cream text-deep border border-cardBorder rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {aiTyping && (
                      <div className="flex justify-start">
                        <div className="bg-cream text-deep border border-cardBorder px-4 py-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-deep animate-pulse"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-deep animate-pulse [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-deep animate-pulse [animation-delay:0.4s]"></span>
                          <span>Asistan yazıyor...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Chat Suggestions */}
                  <div className="px-3 pb-2 pt-1 border-t border-cardBorder flex gap-1.5 overflow-x-auto scrollbar-thin">
                    <button
                      onClick={() => simulateAiResponse('Beşiktaş 3+1 daire fiyatları?', 'İstanbul Beşiktaş ilçesindeki 3+1 dairelerin ortalama satış fiyatı Haziran 2026 itibariyle 14.500.000 ₺ ile 22.000.000 ₺ arasındadır. Serencebey ve Levazım bölgelerinde talep oldukça yüksektir.')}
                      className="px-2.5 py-1.5 bg-cream hover:bg-gray-100 rounded-lg text-[9px] font-bold border border-cardBorder text-gray-500 whitespace-nowrap"
                    >
                      Beşiktaş Fiyatları?
                    </button>
                    <button
                      onClick={() => simulateAiResponse('Yeni ilan açıklaması yaz', 'Tabii! Hangi portföyünüz için ilan açıklaması yazmamı istersiniz? Oda sayısı, metrekare ve öne çıkan özelliklerini (örneğin boğaz manzaralı, sıfır bina) belirtmeniz yeterlidir.')}
                      className="px-2.5 py-1.5 bg-cream hover:bg-gray-100 rounded-lg text-[9px] font-bold border border-cardBorder text-gray-500 whitespace-nowrap"
                    >
                      Açıklama Yazdır
                    </button>
                    <button
                      onClick={() => simulateAiResponse('Fırsat ilanları listele', 'Şu an sistemde acil satılık statüsünde d4 kodlu Seyrantepe teras katı (₺3.100.000) ve d2 kodlu Kağıthane rezidans dairesi (₺5.840.000) öne çıkmaktadır.')}
                      className="px-2.5 py-1.5 bg-cream hover:bg-gray-100 rounded-lg text-[9px] font-bold border border-cardBorder text-gray-500 whitespace-nowrap"
                    >
                      Fırsat İlanları?
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: CALENDAR & CONFLICT RESOLUTION */}
              {activeDemoTab === 'calendar' && (
                <div className={`w-full max-w-[500px] bg-white rounded-3xl border border-cardBorder shadow-lg overflow-hidden flex flex-col p-4 sm:p-5 animate-scale-in ${shakeCalendar ? 'animate-shake border-red-300 shadow-red-100' : ''}`}>
                  <div className="flex items-center justify-between pb-3 border-b border-cardBorder mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-accentDark" />
                      <span className="text-xs font-black text-deep">Randevu Akışı (Haftalık Planlayıcı)</span>
                    </div>
                    <button
                      onClick={handleAddConflictingAppointment}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white font-extrabold text-[10px] flex items-center gap-1 hover:bg-red-600 transition-colors"
                    >
                      <Plus size={10} strokeWidth={3} />
                      Çakışan Randevu Ekle
                    </button>
                  </div>

                  <div className="space-y-2 flex-1">
                    {calendarAppointments.map((ap) => (
                      <div
                        key={ap.id}
                        className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                          ap.type === 'approved'
                            ? 'bg-emerald-50/50 border-emerald-100'
                            : 'bg-amber-50/50 border-amber-100'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <h6 className="text-[11px] font-black text-deep">{ap.title}</h6>
                          <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400">
                            <span>Müşteri: {ap.client}</span>
                            <span>●</span>
                            <span>Saat: {ap.time}</span>
                          </div>
                        </div>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${
                          ap.type === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {ap.type === 'approved' ? 'ONAYLI' : 'BEKLEMEDE'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Conflict warning banner */}
                  {calendarConflictMsg && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-red-700 animate-toast-in">
                      <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
                      <p className="text-[10px] font-bold leading-relaxed">{calendarConflictMsg}</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* 6. Featured Showcase Section (İlanlar) */}
      <section id="ilanlar" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-xs font-black text-accentDark uppercase tracking-widest">Seçtiklerimiz</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-deep">Öne Çıkan Aktif Portföy İlanları</h3>
              <p className="text-base text-gray-500 font-semibold">
                Sistemimizdeki en popüler ilanlardan bazıları. Bu ilanların detaylarına panel üzerinden anında ulaşabilirsiniz.
              </p>
            </div>
            <button
              onClick={() => navigateToLogin('login')}
              className="px-6 py-3 rounded-2xl bg-white border-2 border-cardBorder text-sm font-extrabold text-deep flex items-center justify-center gap-2 hover:bg-gray-50 transition-all duration-200 self-start md:self-auto"
            >
              Tüm İlanları Gör
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProperties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => navigateToLogin('login')}
                className="bg-white rounded-3xl border border-cardBorder overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
              >
                {/* Image */}
                <div className="h-56 relative overflow-hidden">
                  <img
                    src={prop.img}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {prop.badge && (
                    <span className="absolute top-4 left-4 bg-deep text-accent text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-md">
                      {prop.badge}
                    </span>
                  )}
                  <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-deep text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-md">
                    {prop.type}
                  </span>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{prop.subtype}</span>
                    <h4 className="text-base font-extrabold text-deep line-clamp-2 leading-tight group-hover:text-accentDark transition-colors">
                      {prop.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-400">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="text-xs font-bold truncate">{prop.location}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-cardBorder text-center">
                    <div>
                      <span className="block text-[10px] text-gray-400 font-semibold">Oda Sayısı</span>
                      <span className="text-xs font-extrabold text-deep">{prop.rooms}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 font-semibold">Metrekare</span>
                      <span className="text-xs font-extrabold text-deep">{prop.size}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 font-semibold">Bina Yaşı</span>
                      <span className="text-xs font-extrabold text-deep">{prop.age}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-black text-deep">{prop.price}</span>
                    <span className="text-[10px] font-extrabold text-accentDark flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      İncele <ArrowRight size={12} strokeWidth={2.5} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Pricing Section (Planlar) */}
      <section id="fiyatlar" className="py-24 bg-white border-y border-cardBorder relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-black text-accentDark uppercase tracking-widest">Planlar & Ücretler</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-deep">İhtiyacınıza En Uygun Paketi Seçin</h3>
            <p className="text-base text-gray-500 font-semibold">
              Kişisel veya kurumsal emlak portföy büyüklüğünüze göre en verimli çözümü bulun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {PLANS.map((plan) => {
              const isPopular = plan.popular;
              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-[32px] border-2 p-8 flex flex-col justify-between relative transition-all duration-300 hover:shadow-xl ${
                    isPopular
                      ? 'border-accent shadow-md scale-105 md:z-10'
                      : 'border-cardBorder'
                  }`}
                >
                  {isPopular && (
                    <span
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-deep"
                      style={{ background: '#e3d10d', boxShadow: '0 4px 12px rgba(227,209,13,.3)' }}
                    >
                      En Çok Tercih Edilen
                    </span>
                  )}

                  <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                      <h4 className="text-lg font-black text-deep">{plan.name}</h4>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-deep">
                          {plan.price === 0 ? '₺0' : `₺${plan.price}`}
                        </span>
                        {plan.price > 0 && <span className="text-xs text-gray-400 font-bold">/ Ay</span>}
                      </div>
                    </div>

                    <hr className="border-cardBorder" />

                    {/* Features List */}
                    <ul className="space-y-3.5">
                      {plan.features.map((feat, index) => (
                        <li key={index} className="flex items-start gap-3 text-xs font-bold text-gray-500">
                          <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8">
                    <button
                      onClick={() => navigateToLogin('register')}
                      className={`w-full py-3.5 rounded-2xl text-xs font-extrabold transition-all duration-200 ${
                        isPopular
                          ? 'bg-deep text-white hover:bg-deep/90 shadow-lg'
                          : 'bg-cream text-deep border border-cardBorder hover:bg-gray-100'
                      }`}
                    >
                      {plan.price === 0 ? 'Hemen Başla' : 'Planı Satın Al'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Collapsible FAQ Section (SSS) */}
      <section id="sss" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-xs font-black text-accentDark uppercase tracking-widest">Soru - Cevap</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-deep">Sıkça Sorulan Sorular</h3>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, i) => {
              const open = faqOpen[i];
              return (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-cardBorder overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  >
                    <span className="text-sm sm:text-base font-black text-deep">{faq.q}</span>
                    <span className={`w-8 h-8 rounded-xl bg-cream flex items-center justify-center text-deep transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                      <ChevronDownIcon />
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      open ? 'max-h-[300px] border-t border-cardBorder' : 'max-h-0'
                    }`}
                  >
                    <p className="p-6 text-xs sm:text-sm text-gray-400 font-semibold leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Contact / Newsletter Section */}
      <section className="py-20 bg-deep text-white relative overflow-hidden">
        {/* Abstract spheres */}
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left side: Contact Form */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-black text-accent uppercase tracking-widest">İletişim Formu</span>
                <h3 className="text-3xl font-extrabold">Bizimle İletişime Geçin</h3>
                <p className="text-xs sm:text-sm text-white/50 font-semibold leading-relaxed">
                  Sorularınız, iş ortaklıkları talepleriniz veya kurumsal demo istekleriniz için aşağıdaki formu doldurabilirsiniz.
                </p>
              </div>

              {contactSubmitted ? (
                <div className="bg-accent/10 border border-accent/20 rounded-3xl p-6 text-center text-accent animate-scale-in">
                  <h4 className="font-extrabold text-sm mb-1">✓ Mesajınız Alındı!</h4>
                  <p className="text-xs font-medium text-accent/80">En geç 24 saat içerisinde emlak danışmanlarımız sizinle irtibata geçecektir.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-white/40 mb-1.5 block uppercase">Adınız Soyadınız</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-semibold focus:border-accent outline-none transition-colors"
                        placeholder="Örn: Selim Demir"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-white/40 mb-1.5 block uppercase">E-Posta Adresiniz</label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-semibold focus:border-accent outline-none transition-colors"
                        placeholder="Örn: selim@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-white/40 mb-1.5 block uppercase">Mesajınız</label>
                    <textarea
                      rows="4"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-semibold focus:border-accent outline-none transition-colors resize-none"
                      placeholder="Sorunuzu veya talebinizi detaylıca buraya yazın..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all duration-200"
                    style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 4px 16px rgba(227,209,13,.2)' }}
                  >
                    Gönder <Send size={12} strokeWidth={2.5} />
                  </button>
                </form>
              )}
            </div>

            {/* Right side: Newsletter signup */}
            <div className="lg:col-span-6 space-y-8 bg-white/5 border border-white/10 rounded-[32px] p-8 sm:p-10 backdrop-blur-sm self-start lg:self-auto">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                  <Zap size={20} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-extrabold">Emlak Pazar Bültenine Katılın</h3>
                <p className="text-xs sm:text-sm text-white/50 font-semibold leading-relaxed">
                  İstanbul emlak pazarındaki fiyat değişimleri, haftalık fırsat ilanları ve AI analiz raporlarımızı kaçırmamak için e-bültene kaydolun.
                </p>
              </div>

              {newsletterSubmitted ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-emerald-400 text-xs font-bold text-center animate-scale-in">
                  ✓ Bültene başarıyla kaydoldunuz! Teşekkürler.
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-semibold focus:border-accent outline-none transition-colors"
                    placeholder="E-posta adresiniz"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-2xl bg-white text-deep font-extrabold text-xs hover:bg-gray-100 transition-colors"
                  >
                    Kayıt Ol
                  </button>
                </form>
              )}

              <div className="flex gap-6 text-white/30 text-[10px] font-semibold pt-4 border-t border-white/10">
                <span className="flex items-center gap-1.5"><Lock size={12} /> Spam göndermeyiz</span>
                <span className="flex items-center gap-1.5"><Shield size={12} /> Güvenli abonelik</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Footer Section */}
      <footer className="border-t border-cardBorder bg-white py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-deep text-accent">
                <Building2 size={16} strokeWidth={2.5} />
              </div>
              <span className="text-base font-extrabold text-deep">FSBO</span>
            </div>
            <p className="text-xs text-gray-300 font-bold">&copy; 2026 FSBO. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Custom Mini Icons
function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
