import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers, ArrowLeft, Sparkles, CheckCircle, Zap, Box,
  Sun, Palette, RotateCcw, Download, Share2, Eye
} from 'lucide-react'

const FEATURES_TABS = [
  {
    id: 'ozellikler',
    label: 'Özellikler',
    icon: Sparkles,
    items: [
      { title: 'Gerçekçi 3D Modelleme', desc: 'Yüksek detaylı, gerçekçi 3D ev modelleri oluşturun.' },
      { title: 'Işık ve Gölge Simülasyonu', desc: 'Gerçek zamanlı ışık ve gölge efektleri.' },
      { title: 'Malzeme ve Doku Seçenekleri', desc: 'Ahşap, taş, cam gibi yüzeylerde gerçekçi dokular.' },
      { title: 'Sanal Tur Entegrasyonu', desc: '3D modeli sanal tur olarak paylaşın.' },
      { title: 'Kat Planı Oluşturma', desc: 'Otomatik kat planı ve yerleşim planı.' },
      { title: 'Dış Mekan Görselleştirme', desc: 'Peyzaj ve çevre düzenlemesi 3D olarak.' },
    ]
  },
  {
    id: 'nasil-calisir',
    label: 'Nasıl Çalışır?',
    icon: Zap,
    items: [
      { step: 1, title: 'Plan Yükleyin', desc: 'Evinizin kat planını veya ölçülerini girin.' },
      { step: 2, title: 'Malzeme Seçin', desc: 'Duvar, zemin ve çatı malzemelerini belirleyin.' },
      { step: 3, title: 'Renk Ayarlayın', desc: 'Renk paleti ve dekorasyon tercihlerinizi seçin.' },
      { step: 4, title: 'AI Modellesin', desc: 'Yapay zeka 3D modelinizi oluştursun.' },
      { step: 5, title: 'Keşfedin', desc: '360 derece modelinizi döndürerek inceleyin.' },
    ]
  },
  {
    id: 'ornekler',
    label: 'Örnekler',
    icon: Eye,
    items: [
      { title: 'Müstakil Ev', tag: 'Popüler', style: 'Modern' },
      { title: 'Apartman Dairesi', tag: 'Yeni', style: 'Klasik' },
      { title: 'Villa', tag: 'Trend', style: 'Lüks' },
      { title: 'Ofis Binası', tag: 'Premium', style: 'Endüstriyel' },
    ]
  },
]

export default function FSBO3D() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ozellikler')

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="px-4 sm:px-6 lg:px-8 mt-4 mb-2">
        <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b2e 0%, #1e3a5f 50%, #1e1b2e 100%)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <button onClick={() => navigate('/ai')} className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white mb-3 btn transition-colors">
              <ArrowLeft size={14} />Tüm AI Araçları
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)' }}>
                <Layers size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">3D Ev Modelleme</h1>
                <p className="text-[10px] font-semibold text-white/50">Profesyonel 3D Ev Modelleri</p>
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
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === tab.id ? 'text-white shadow-md' : 'text-gray-400 hover:text-deep hover:bg-cream'}`} style={activeTab === tab.id ? { background: '#3b82f6' } : {}}>
                <Icon size={14} /><span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* 3D PREVIEW */}
        <div className="bg-white rounded-2xl border border-cardBorder p-5 shadow-sm mb-4">
          <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1e1b2e' }}>
            <Box size={16} style={{ color: '#3b82f6' }} />3D Önizleme
          </h3>
          <div className="aspect-video rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative">
            <div className="w-24 h-16 bg-gradient-to-t from-blue-200 to-blue-100 rounded-lg border border-blue-300 flex items-center justify-center" style={{ transform: 'perspective(200px) rotateX(20deg) rotateY(-10deg)' }}>
              <div className="w-20 h-12 bg-gradient-to-t from-blue-300 to-blue-200 rounded-t-lg" />
            </div>
            <Layers size={24} className="text-blue-300 absolute" />
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 py-2 rounded-xl text-[10px] font-bold btn flex items-center justify-center gap-1" style={{ background: '#3b82f6', color: '#fff' }}><Box size={12} />3D Oluştur</button>
            <button className="flex-1 py-2 rounded-xl text-[10px] font-bold btn border border-cardBorder flex items-center justify-center gap-1" style={{ color: '#1e1b2e' }}><Download size={12} />İndir</button>
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="space-y-3">
          {activeTab === 'ozellikler' && FEATURES_TABS[0].items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#3b82f615' }}><CheckCircle size={14} style={{ color: '#3b82f6' }} /></div>
              <div><h4 className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{item.title}</h4><p className="text-[11px] font-medium text-gray-400 mt-0.5">{item.desc}</p></div>
            </div>
          ))}
          {activeTab === 'nasil-calisir' && FEATURES_TABS[1].items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold text-white" style={{ background: '#3b82f6' }}>{item.step}</div>
              <div><h4 className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{item.title}</h4><p className="text-[11px] font-medium text-gray-400 mt-0.5">{item.desc}</p></div>
            </div>
          ))}
          {activeTab === 'ornekler' && (
            <div className="grid grid-cols-2 gap-3">
              {FEATURES_TABS[2].items.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm">
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-3">
                    <Layers size={24} className="text-blue-300" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{item.title}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[7px] font-bold" style={{ background: '#3b82f615', color: '#3b82f6' }}>{item.tag}</span>
                  </div>
                  <p className="text-[10px] font-medium text-gray-400">{item.style}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
