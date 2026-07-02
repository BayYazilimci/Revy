import { useState } from 'react'
import {
  Image, Sparkles, ArrowLeft, Upload, Wand2, Download,
  CheckCircle, Clock, Zap, Palette, Maximize, Layers,
  Star, Eye, RefreshCw, SlidersHorizontal
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const STYLE_OPTIONS = [
  { id: 'gercekci', label: 'Gerçekçi', desc: 'Fotoğraf kalitesinde gerçekçi görseller', color: '#059669' },
  { id: 'modern', label: 'Modern', desc: 'Minimalist ve contemporary tasarım', color: '#3b82f6' },
  { id: 'klasik', label: 'Klasik', desc: 'Geleneksel ve şık mimari stil', color: '#8b5cf6' },
  { id: 'lukks', label: 'Lüks', desc: 'Premium ve gösterişli villa tasarımları', color: '#d97706' },
  { id: 'doga', label: 'Doğa', desc: 'Yeşillikler içinde天然 evler', color: '#059669' },
  { id: 'sehir', label: 'Şehir', desc: 'Modern şehir yaşam alanları', color: '#dc2626' },
]

const SAMPLE_PROMPTS = [
  'Modern minimalist villa, beyaz cephe, geniş cam yüzeyler, havuz',
  'Ahşap detaylı dağ evi, şömine, doğa manzarası',
  'Şehir merkezinde çatı katı, panoramik manzara, teras',
  'Akdeniz tarzı beyaz badanalı ev, zeytin ağaçları',
]

const FEATURES_TABS = [
  {
    id: 'ozellikler',
    label: 'Özellikler',
    icon: Sparkles,
    content: [
      { title: 'Gerçekçi Görsel Oluşturma', desc: 'En son yapay zeka modelleri ile fotoğraf kalitesinde görseller üretin.' },
      { title: 'Çoklu Stil Seçeneği', desc: 'Gerçekçi, modern, klasik, lüks ve daha birçok stilde görsel oluşturun.' },
      { title: 'Yüksek Çözünürlük', desc: '4K\'ya kadar yüksek çözünürlüklü çıktılar alın.' },
      { title: 'Hızlı Sonuç', desc: '30 saniye içinde görseliniz hazır.' },
      { title: 'Toplu Üretim', desc: 'Aynı anda birden fazla görsel oluşturun.' },
      { title: 'Özelleştirme', desc: 'Renk, kompozisyon ve açıyı tam olarak kontrol edin.' },
    ]
  },
  {
    id: 'nasil-calisir',
    label: 'Nasıl Çalışır?',
    icon: Zap,
    content: [
      { step: 1, title: 'Açıklama Yazın', desc: 'Oluşturmak istediğiniz görseli metin olarak tarif edin.' },
      { step: 2, title: 'Stil Seçin', desc: 'Gerçekçi, modern, klasik gibi bir stil tercih edin.' },
      { step: 3, title: 'Boyut Belirleyin', desc: 'Görselin boyut ve en-boy oranını ayarlayın.' },
      { step: 4, title: 'Oluştur', desc: 'AI butonuna basarak görselinizi oluşturun.' },
      { step: 5, title: 'İndir veya Paylaş', desc: 'Oluşturulan görseli indirin veya doğrudan paylaşın.' },
    ]
  },
  {
    id: 'ornekler',
    label: 'Örnekler',
    icon: Eye,
    content: [
      { title: 'Villa Tasarımı', desc: 'Modern villa dış cephe görselleştirmesi', tag: 'Popüler' },
      { title: 'İç Mekan', desc: 'Oturma odası ve mutfak düzenlemesi', tag: 'Yeni' },
      { title: 'Bahçe Peyzajı', desc: 'Açık alan ve bahçe düzenlemesi', tag: 'Trend' },
      { title: 'Çatı Katı', desc: 'Modern çatı katı tasarımı', tag: 'Premium' },
    ]
  },
]

export default function FSBOGorsel() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ozellikler')
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('gercekci')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const handleGenerate = () => {
    if (!prompt.trim()) return
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
    }, 2000)
  }

  return (
    <div className="flex flex-col min-h-0 h-full">
      {/* HERO */}
      <div className="px-4 sm:px-6 lg:px-8 mt-4 mb-2">
        <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b2e 0%, #4c1d95 50%, #1e1b2e 100%)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <button onClick={() => navigate('/ai')} className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white mb-3 btn transition-colors">
              <ArrowLeft size={14} />Tüm AI Araçları
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}>
                <Image size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">AI Görsel Oluştur</h1>
                <p className="text-[10px] font-semibold text-white/50">Metin ile Emlak Görseli Üretimi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="px-4 sm:px-6 lg:px-8 mb-3">
        <div className="flex gap-1 bg-white rounded-2xl border border-cardBorder p-1 shadow-sm">
          {FEATURES_TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive ? 'text-white shadow-md' : 'text-gray-400 hover:text-deep hover:bg-cream'
                }`}
                style={isActive ? { background: '#8b5cf6' } : {}}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* CREATE SECTION */}
        <div className="bg-white rounded-2xl border border-cardBorder p-5 shadow-sm mb-4">
          <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1e1b2e' }}>
            <Wand2 size={16} style={{ color: '#8b5cf6' }} />Görsel Oluştur
          </h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Hayalindeki evi tarif et... Örnek: Modern minimalist villa, beyaz cephe, geniş cam yüzeyler, havuz"
            className="w-full px-4 py-3 rounded-xl border border-cardBorder text-sm font-medium outline-none resize-none h-24"
            style={{ color: '#1e1b2e' }}
          />
          <div className="mt-3">
            <p className="text-[10px] font-semibold text-gray-400 mb-2">Stil Seçin:</p>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                    selectedStyle === style.id ? 'text-white shadow-md' : 'bg-cream text-deep/60 hover:bg-gray-100'
                  }`}
                  style={selectedStyle === style.id ? { background: style.color } : {}}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating}
              className="flex-1 py-3 rounded-xl text-xs font-extrabold shadow-lg btn flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: '#8b5cf6', color: '#fff', boxShadow: '0 8px 24px rgba(139,92,246,.25)' }}
            >
              {generating ? <><RefreshCw size={14} className="animate-spin" />Oluşturuluyor...</> : <><Sparkles size={14} />Görsel Oluştur</>}
            </button>
          </div>
          {generated && (
            <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-xs font-bold" style={{ color: '#1e1b2e' }}>Görsel başarıyla oluşturuldu!</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-video rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                    <Image size={20} className="text-purple-300" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-2 rounded-xl text-[10px] font-bold btn flex items-center justify-center gap-1" style={{ background: '#8b5cf6', color: '#fff' }}>
                  <Download size={12} />İndir
                </button>
                <button className="flex-1 py-2 rounded-xl text-[10px] font-bold btn border border-cardBorder flex items-center justify-center gap-1" style={{ color: '#1e1b2e' }}>
                  <RefreshCw size={12} />Yeniden Oluştur
                </button>
              </div>
            </div>
          )}
        </div>

        {/* QUICK PROMPTS */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold text-gray-400 mb-2">Hızlı Örnekler:</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((sp, i) => (
              <button
                key={i}
                onClick={() => setPrompt(sp)}
                className="px-3 py-2 rounded-xl text-[10px] font-bold btn bg-white border border-cardBorder hover:bg-cream transition-all shadow-sm"
                style={{ color: '#1e1b2e' }}
              >
                {sp}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="space-y-3">
          {activeTab === 'ozellikler' && FEATURES_TABS[0].content.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#8b5cf615' }}>
                <CheckCircle size={14} style={{ color: '#8b5cf6' }} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{item.title}</h4>
                <p className="text-[11px] font-medium text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
          {activeTab === 'nasil-calisir' && FEATURES_TABS[1].content.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold text-white" style={{ background: '#8b5cf6' }}>
                {item.step}
              </div>
              <div>
                <h4 className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{item.title}</h4>
                <p className="text-[11px] font-medium text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
          {activeTab === 'ornekler' && (
            <div className="grid grid-cols-2 gap-3">
              {FEATURES_TABS[2].content.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm">
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mb-3">
                    <Image size={24} className="text-purple-300" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{item.title}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[7px] font-bold" style={{ background: '#8b5cf615', color: '#8b5cf6' }}>{item.tag}</span>
                  </div>
                  <p className="text-[10px] font-medium text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
