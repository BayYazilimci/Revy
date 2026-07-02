import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye, ArrowLeft, Sparkles, CheckCircle, Zap, Globe,
  Smartphone, Glasses, Move, RotateCcw, Share2, Play
} from 'lucide-react'

const FEATURES_TABS = [
  {
    id: 'ozellikler',
    label: 'Özellikler',
    icon: Sparkles,
    items: [
      { title: '360° Görüntüleme', desc: 'Mekanı her açıdan 360 derece içindeymiş gibi görüntüleyin.' },
      { title: 'Oda Geçişleri', desc: 'Odalar arasında sorunsuz ve akıcı geçişler yapın.' },
      { title: 'Bilgi Noktaları', desc: 'Önemli noktalara tıklanabilir bilgi etiketleri yerleştirin.' },
      { title: 'Mobil Uyumlu', desc: 'Tüm cihazlarda mükemmel çalışan responsive tasarım.' },
      { title: 'VR Desteği', desc: 'Sanal gerçeklik gözlükleri ile tam沉浸 deneyim.' },
      { title: 'Link Paylaşımı', desc: 'Oluşturulan turları link ile kolayca paylaşın.' },
    ]
  },
  {
    id: 'nasil-calisir',
    label: 'Nasıl Çalışır?',
    icon: Zap,
    items: [
      { step: 1, title: 'Mekanı Çekin', desc: '360 kamera ile mekanın görüntülerini alın.' },
      { step: 2, title: 'Görüntüleri Yükleyin', desc: 'Çekilen 360 görüntüleri platforma yükleyin.' },
      { step: 3, title: 'AI Birleştirsin', desc: 'Yapay zeka görüntüleri sorunsuz birleştirdir.' },
      { step: 4, title: 'Tur Oluşturun', desc: 'Oda geçişlerini ve bilgi noktalarını ayarlayın.' },
      { step: 5, title: 'Paylaşın', desc: 'Link ile paylaşın veya web sitenize gömün.' },
    ]
  },
  {
    id: 'ornekler',
    label: 'Örnekler',
    icon: Globe,
    items: [
      { title: 'Lüks Villa Turu', tag: 'Popüler', rooms: 8 },
      { title: 'Stüdyo Daire', tag: 'Yeni', rooms: 2 },
      { title: 'Ofis Alanı', tag: 'Trend', rooms: 5 },
      { title: 'Bahçe & Havuz', tag: 'Premium', rooms: 3 },
    ]
  },
]

export default function FSBOSanalTur() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ozellikler')
  const [selectedRoom, setSelectedRoom] = useState(null)

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="px-4 sm:px-6 lg:px-8 mt-4 mb-2">
        <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b2e 0%, #92400e 50%, #1e1b2e 100%)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <button onClick={() => navigate('/ai')} className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white mb-3 btn transition-colors">
              <ArrowLeft size={14} />Tüm AI Araçları
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #d97706, #fbbf24)' }}>
                <Eye size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">Sanal Tur</h1>
                <p className="text-[10px] font-semibold text-white/50">360° Sanal Tur Deneyimi</p>
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
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === tab.id ? 'text-white shadow-md' : 'text-gray-400 hover:text-deep hover:bg-cream'}`} style={activeTab === tab.id ? { background: '#d97706' } : {}}>
                <Icon size={14} /><span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* 360 PREVIEW */}
        <div className="bg-white rounded-2xl border border-cardBorder p-5 shadow-sm mb-4">
          <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1e1b2e' }}>
            <Globe size={16} style={{ color: '#d97706' }} />360° Önizleme
          </h3>
          <div className="aspect-video rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-amber-300 flex items-center justify-center animate-spin" style={{ animationDuration: '10s' }}>
                <Move size={24} className="text-amber-400" />
              </div>
            </div>
            <div className="relative z-10 text-center">
              <Eye size={32} className="text-amber-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-amber-600">360° Görünüm</p>
              <p className="text-[10px] font-medium text-amber-400">Sürükleyerek döndürün</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 py-2 rounded-xl text-[10px] font-bold btn flex items-center justify-center gap-1" style={{ background: '#d97706', color: '#fff' }}><Play size={12} />Tur Başlat</button>
            <button className="flex-1 py-2 rounded-xl text-[10px] font-bold btn border border-cardBorder flex items-center justify-center gap-1" style={{ color: '#1e1b2e' }}><Share2 size={12} />Paylaş</button>
          </div>
        </div>

        {/* ROOM NAVIGATION */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold text-gray-400 mb-2">Odalar:</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {['Giriş', 'Oturma Odası', 'Mutfak', 'Yatak Odası', 'Banyo', 'Teras'].map((room, i) => (
              <button key={i} onClick={() => setSelectedRoom(room)} className={`px-3 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${selectedRoom === room ? 'text-white shadow-md' : 'bg-white border border-cardBorder text-deep/60'}`} style={selectedRoom === room ? { background: '#d97706' } : {}}>
                {room}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="space-y-3">
          {activeTab === 'ozellikler' && FEATURES_TABS[0].items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#d9770615' }}><CheckCircle size={14} style={{ color: '#d97706' }} /></div>
              <div><h4 className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{item.title}</h4><p className="text-[11px] font-medium text-gray-400 mt-0.5">{item.desc}</p></div>
            </div>
          ))}
          {activeTab === 'nasil-calisir' && FEATURES_TABS[1].items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold text-white" style={{ background: '#d97706' }}>{item.step}</div>
              <div><h4 className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{item.title}</h4><p className="text-[11px] font-medium text-gray-400 mt-0.5">{item.desc}</p></div>
            </div>
          ))}
          {activeTab === 'ornekler' && (
            <div className="grid grid-cols-2 gap-3">
              {FEATURES_TABS[2].items.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm">
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center mb-3">
                    <Eye size={24} className="text-amber-300" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{item.title}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[7px] font-bold" style={{ background: '#d9770615', color: '#d97706' }}>{item.tag}</span>
                  </div>
                  <p className="text-[10px] font-medium text-gray-400">{item.rooms} oda</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
