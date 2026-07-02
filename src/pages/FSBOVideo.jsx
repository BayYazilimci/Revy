import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Film, ArrowLeft, Sparkles, CheckCircle, Zap, Eye,
  Music, Subtitles, Monitor, Share2, Download, RefreshCw,
  Play, Clock, Star
} from 'lucide-react'

const VIDEO_TYPES = [
  { id: 'tanitim', label: 'Emlak Tanıtımı', desc: 'Mülkünüzü video ile tanıtın', color: '#ec4899' },
  { id: 'mahalle', label: 'Mahalle Rehberi', desc: 'Çevreyi videoyla gösterin', color: '#8b5cf6' },
  { id: 'ozellik', label: 'Özellik Turu', desc: 'Önemli özellikleri vurgulayın', color: '#3b82f6' },
  { id: 'karsilastirma', label: 'Karşılaştırma', desc: 'Birden fazla mülkü karşılaştırın', color: '#059669' },
]

const FEATURES_TABS = [
  {
    id: 'ozellikler',
    label: 'Özellikler',
    icon: Sparkles,
    items: [
      { title: 'AI Montaj', desc: 'Yapay zeka ile otomatik video düzenleme ve montaj.' },
      { title: 'Otomatik Altyazı', desc: 'Sesli anlatımdan otomatik altyazı üretimi.' },
      { title: 'Müzik ve Seslendirme', desc: 'Profesyonel müzik ve yapay zeka seslendirmesi.' },
      { title: 'HD Kalite', desc: '1080p ve 4K kalitede video çıktısı.' },
      { title: 'Sosyal Medya Uyumu', desc: 'Instagram, YouTube, TikTok için optimize.' },
      { title: 'Şablon Kütüphanesi', desc: 'Onlarca profesyonel video şablonu.' },
    ]
  },
  {
    id: 'nasil-calisir',
    label: 'Nasıl Çalışır?',
    icon: Zap,
    items: [
      { step: 1, title: 'Görselleri Yükleyin', desc: 'Mülkünüzün fotoğraflarını veya videolarını yükleyin.' },
      { step: 2, title: 'Video Türünü Seçin', desc: 'Tanıtım, mahalle rehberi veya özellik turu.' },
      { step: 3, title: 'Metinleri Girin', desc: 'Video açıklamaları ve başlıklarınızı yazın.' },
      { step: 4, title: 'AI Üretsin', desc: 'Yapay zeka profesyonel videonuzu oluştursun.' },
      { step: 5, title: 'Paylaşın', desc: 'Sosyal medyada veya web sitenizde paylaşın.' },
    ]
  },
  {
    id: 'ornekler',
    label: 'Örnekler',
    icon: Eye,
    items: [
      { title: 'Villa Tanıtım Videosu', tag: 'Popüler', duration: '0:45' },
      { title: 'Mahalle Gezintisi', tag: 'Yeni', duration: '1:20' },
      { title: 'İç Mekan Turu', tag: 'Trend', duration: '0:30' },
      { title: 'Karşılaştırma Videosu', tag: 'Premium', duration: '1:00' },
    ]
  },
]

export default function FSBOVideo() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ozellikler')
  const [selectedType, setSelectedType] = useState('tanitim')
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => { setGenerating(false); setGenerated(true) }, 2500)
  }

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="px-4 sm:px-6 lg:px-8 mt-4 mb-2">
        <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b2e 0%, #831843 50%, #1e1b2e 100%)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <button onClick={() => navigate('/ai')} className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white mb-3 btn transition-colors">
              <ArrowLeft size={14} />Tüm AI Araçları
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
                <Film size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">AI Video Oluştur</h1>
                <p className="text-[10px] font-semibold text-white/50">Profesyonel Emlak Tanıtım Videoları</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mb-3">
        <div className="flex gap-1 bg-white rounded-2xl border border-cardBorder p-1 shadow-sm">
          {FEATURES_TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === tab.id ? 'text-white shadow-md' : 'text-gray-400 hover:text-deep hover:bg-cream'}`} style={activeTab === tab.id ? { background: '#ec4899' } : {}}>
                <Icon size={14} /><span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* CREATE */}
        <div className="bg-white rounded-2xl border border-cardBorder p-5 shadow-sm mb-4">
          <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1e1b2e' }}>
            <Play size={16} style={{ color: '#ec4899' }} />Video Oluştur
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {VIDEO_TYPES.map(type => (
              <button key={type.id} onClick={() => setSelectedType(type.id)} className={`p-3 rounded-xl text-left transition-all ${selectedType === type.id ? 'text-white shadow-md' : 'bg-cream hover:bg-gray-100'}`} style={selectedType === type.id ? { background: type.color } : {}}>
                <p className="text-[10px] font-extrabold">{type.label}</p>
                <p className="text-[9px] font-medium mt-0.5" style={{ color: selectedType === type.id ? 'rgba(255,255,255,.7)' : '#9ca3af' }}>{type.desc}</p>
              </button>
            ))}
          </div>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Videonuzun içeriğini tarif edin..." className="w-full px-4 py-3 rounded-xl border border-cardBorder text-sm font-medium outline-none resize-none h-20" style={{ color: '#1e1b2e' }} />
          <button onClick={handleGenerate} disabled={generating} className="w-full mt-3 py-3 rounded-xl text-xs font-extrabold shadow-lg btn flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: '#ec4899', color: '#fff', boxShadow: '0 8px 24px rgba(236,72,153,.25)' }}>
            {generating ? <><RefreshCw size={14} className="animate-spin" />Oluşturuluyor...</> : <><Film size={14} />Video Oluştur</>}
          </button>
          {generated && (
            <div className="mt-4 p-4 rounded-xl bg-pink-50 border border-pink-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-xs font-bold" style={{ color: '#1e1b2e' }}>Video hazır!</span>
              </div>
              <div className="aspect-video rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center">
                <Play size={32} className="text-pink-300" />
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-2 rounded-xl text-[10px] font-bold btn flex items-center justify-center gap-1" style={{ background: '#ec4899', color: '#fff' }}><Download size={12} />İndir</button>
                <button className="flex-1 py-2 rounded-xl text-[10px] font-bold btn border border-cardBorder flex items-center justify-center gap-1" style={{ color: '#1e1b2e' }}><Share2 size={12} />Paylaş</button>
              </div>
            </div>
          )}
        </div>

        {/* TAB CONTENT */}
        <div className="space-y-3">
          {activeTab === 'ozellikler' && FEATURES_TABS[0].items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ec489915' }}><CheckCircle size={14} style={{ color: '#ec4899' }} /></div>
              <div><h4 className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{item.title}</h4><p className="text-[11px] font-medium text-gray-400 mt-0.5">{item.desc}</p></div>
            </div>
          ))}
          {activeTab === 'nasil-calisir' && FEATURES_TABS[1].items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold text-white" style={{ background: '#ec4899' }}>{item.step}</div>
              <div><h4 className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{item.title}</h4><p className="text-[11px] font-medium text-gray-400 mt-0.5">{item.desc}</p></div>
            </div>
          ))}
          {activeTab === 'ornekler' && (
            <div className="grid grid-cols-2 gap-3">
              {FEATURES_TABS[2].items.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm">
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center mb-3 relative">
                    <Play size={20} className="text-pink-300" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[7px] font-bold bg-black/50 text-white">{item.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{item.title}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[7px] font-bold" style={{ background: '#ec489915', color: '#ec4899' }}>{item.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
