import { useState, useEffect, useCallback } from 'react'
import {
  Compass, List, Heart, User, Bot, Calendar, MessageCircle,
  MapPin, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react'

const STEPS = [
  {
    title: 'Ana Menüye Genel Bakış',
    subtitle: 'Tüm özelliklere hızlı erişim',
    desc: 'Sol menüdeki butonlar sayesinde keşfetme, listeleme ve yönetme işlemlerinizi tek tıkla gerçekleştirin.',
    items: [
      { label: 'Keşfet', icon: Compass, color: '#e3d10d', desc: 'İlanları harita ve liste ile keşfedin' },
      { label: 'Portföyüm', icon: List, color: '#059669', desc: 'Kaydettiğiniz ilanları yönetin' },
      { label: 'Listeler', icon: Heart, color: '#dc2626', desc: 'Favori listelerinizi oluşturun' },
      { label: 'Hesap', icon: User, color: '#3b82f6', desc: 'Profil ve abonelik ayarlarınız' },
    ],
  },
  {
    title: 'Akıllı Keşif Araçları',
    subtitle: 'İstediğinizi kolayca bulun',
    desc: 'Harita görünümü, gelişmiş filtreler ve sıralama seçenekleriyle size en uygun ilanları anında keşfedin.',
    items: [
      { label: 'Harita Görünümü', icon: MapPin, color: '#e3d10d', desc: 'İlanları interaktif haritada görün' },
      { label: 'Gelişmiş Filtreler', icon: SlidersHorizontal, color: '#8b5cf6', desc: 'Fiyat, konum, oda sayısına göre filtreleyin' },
      { label: 'Sıralama', icon: ArrowUpDown, color: '#d97706', desc: 'Tarih ve fiyata göre sıralayın' },
    ],
  },
  {
    title: 'Yapay Zeka & Dahası',
    subtitle: 'Akıllı asistanınızla tanışın',
    desc: 'FSBOAI asistanınıza doğal dilde sorular sorun, günlük öneriler alın ve müşterilerinizle kolayca iletişim kurun.',
    items: [
      { label: 'FSBOAI', icon: Bot, color: '#e3d10d', desc: 'Doğal dilde sorular sorun, anında yanıt alın' },
      { label: 'Günlük', icon: Calendar, color: '#059669', desc: 'Size özel günlük ilan önerileri' },
      { label: 'Mesajlaşma', icon: MessageCircle, color: '#3b82f6', desc: 'Müşterilerinizle hızlı iletişim' },
    ],
  },
]

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [animateKey, setAnimateKey] = useState(0)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  useEffect(() => {
    if (animating) {
      const t = setTimeout(() => setAnimating(false), 400)
      return () => clearTimeout(t)
    }
  }, [animating])

  const goNext = useCallback(() => {
    if (isLast) return onComplete()
    if (animating) return
    setAnimating(true)
    setStep(s => s + 1)
    setAnimateKey(k => k + 1)
  }, [isLast, animating, onComplete])

  const goPrev = useCallback(() => {
    if (step === 0 || animating) return
    setAnimating(true)
    setStep(s => s - 1)
    setAnimateKey(k => k + 1)
  }, [step, animating])

  const handleSkip = useCallback(() => onComplete(), [onComplete])

  const renderSidebarMock = () => (
    <div className="relative">
      <div className="bg-deep rounded-2xl p-3 mx-auto max-w-[200px] shadow-xl">
        {current.items.map((item, i) => (
          <div key={i} className="relative group">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors" style={{ background: i === 0 ? 'rgba(227,209,13,0.15)' : 'transparent' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}20` }}>
                <item.icon size={16} style={{ color: item.color }} />
              </div>
              <span className="text-white text-xs font-bold">{item.label}</span>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
              <div className="ml-3 bg-deep text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1 mt-3">
        {current.items.map((item, i) => (
          <div key={i} className="relative">
            <div className="animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: item.color }}>
                <span className="text-white text-[10px] font-bold">{i + 1}</span>
              </div>
            </div>
            <div className="absolute -top-1 -right-1">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 0L7 10M7 10L3 6M7 10L11 6" stroke="#e3d10d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderFeatureCards = () => (
    <div className="space-y-2.5">
      {current.items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-md"
          style={{ borderColor: '#f0ece6' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
            <item.icon size={20} style={{ color: item.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-deep">{item.label}</span>
              <ChevronRight size={12} style={{ color: item.color }} className="flex-shrink-0" />
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-1">
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === step ? 'w-8 bg-[#e3d10d]' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="text-xs font-bold text-gray-400 hover:text-deep transition-colors uppercase tracking-wider"
          >
            Atla
          </button>
        </div>

        <div key={animateKey} className="px-6 py-5">
          <div className="animate-slide-up">
            <div className="flex justify-center mb-5">
              {step === 0 ? (
                renderSidebarMock()
              ) : (
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#faf7f2' }}>
                  {step === 1 ? (
                    <Sparkles size={32} style={{ color: '#e3d10d' }} />
                  ) : (
                    <Bot size={32} style={{ color: '#e3d10d' }} />
                  )}
                </div>
              )}
            </div>

            <h2 className="text-center text-xl font-extrabold text-deep">{current.title}</h2>
            <p className="text-center text-xs text-gray-500 mt-1 mb-5 leading-relaxed">{current.desc}</p>

            {renderFeatureCards()}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 pb-6 pt-1">
          <button
            onClick={goPrev}
            className={`flex items-center gap-1 text-sm font-bold transition-all ${
              step === 0 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-deep'
            }`}
          >
            <ChevronLeft size={16} />
            Geri
          </button>

          <button
            onClick={goNext}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-sm text-deep shadow-lg transition-all duration-200 btn"
            style={{ background: '#e3d10d', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
          >
            {isLast ? 'Başla' : 'Devam'}
            {!isLast && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
