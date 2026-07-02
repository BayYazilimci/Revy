import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Compass, ArrowLeft, Sparkles, CheckCircle, Zap, Plane,
  Mountain, Map, Video, Download, Share2, Eye
} from 'lucide-react'

const FEATURES_TABS = [
  {
    id: 'ozellikler',
    label: 'Özellikler',
    icon: Sparkles,
    items: [
      { title: 'Profesyonel Drone Çekimi', desc: 'Yüksek kaliteli hava görüntüleri ve panoramalar.' },
      { title: 'Hava Panoramaları', desc: '360 derece kuş bakışı panoramik görüntüler.' },
      { title: '3D Arazi Modelleme', desc: 'Drone verilerinden 3D arazi ve bina modelleri.' },
      { title: 'Mahalle Görüntüleme', desc: 'Çevre ve mahalle detaylı görüntüleme.' },
      { title: 'HD Video Çekimi', desc: '4K kalitede havadan video çekimi.' },
      { title: 'Otomatik Rota', desc: 'AI ile otomatik uçuş rotası planlama.' },
    ]
  },
  {
    id: 'nasil-calisir',
    label: 'Nasıl Çalışır?',
    icon: Zap,
    items: [
      { step: 1, title: 'Bölge Seçin', desc: 'Çekim yapılacak bölgeyi harita üzerinde belirleyin.' },
      { step: 2, title: 'Rotayı Planlayın', desc: 'Uçuş yüksekliği ve rotasını ayarlayın.' },
      { step: 3, title: 'Çekimi Başlatın', desc: 'Drone otomatik olarak çekime başlasın.' },
      { step: 4, title: 'Verileri İşleyin', desc: 'AI görüntüleri 3D modele dönüştürsün.' },
      { step: 5, title: 'Sonucu Alın', desc: 'Hava görüntülerini ve 3D modelleri indirin.' },
    ]
  },
  {
    id: 'ornekler',
    label: 'Örnekler',
    icon: Eye,
    items: [
      { title: 'Arsa Görüntüleme', tag: 'Popüler', type: 'Hava' },
      { title: 'Site Çekimi', tag: 'Yeni', type: 'Panoramik' },
      { title: 'Mahalle Turu', tag: 'Trend', type: 'Video' },
      { title: 'Arazi Analizi', tag: 'Premium', type: '3D' },
    ]
  },
]

export default function FSBODrone() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ozellikler')

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="px-4 sm:px-6 lg:px-8 mt-4 mb-2">
        <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b2e 0%, #7f1d1d 50%, #1e1b2e 100%)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <button onClick={() => navigate('/ai')} className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white mb-3 btn transition-colors">
              <ArrowLeft size={14} />Tüm AI Araçları
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #dc2626, #f87171)' }}>
                <Compass size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">3D Drone Çekimi</h1>
                <p className="text-[10px] font-semibold text-white/50">Hava Görüntüleme ve 3D Modelleme</p>
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
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === tab.id ? 'text-white shadow-md' : 'text-gray-400 hover:text-deep hover:bg-cream'}`} style={activeTab === tab.id ? { background: '#dc2626' } : {}}>
                <Icon size={14} /><span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* DRONE PREVIEW */}
        <div className="bg-white rounded-2xl border border-cardBorder p-5 shadow-sm mb-4">
          <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1e1b2e' }}>
            <Plane size={16} style={{ color: '#dc2626' }} />Drone Görünümü
          </h3>
          <div className="aspect-video rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border border-dashed border-red-200" />
              <div className="absolute w-24 h-24 rounded-full border border-dashed border-red-300" />
              <div className="absolute w-8 h-8 rounded-full bg-red-200 flex items-center justify-center">
                <Plane size={14} className="text-red-500" />
              </div>
            </div>
            <Mountain size={32} className="text-red-200 absolute bottom-4" />
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 py-2 rounded-xl text-[10px] font-bold btn flex items-center justify-center gap-1" style={{ background: '#dc2626', color: '#fff' }}><Plane size={12} />Uçuş Başlat</button>
            <button className="flex-1 py-2 rounded-xl text-[10px] font-bold btn border border-cardBorder flex items-center justify-center gap-1" style={{ color: '#1e1b2e' }}><Map size={12} />Rota Planla</button>
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="space-y-3">
          {activeTab === 'ozellikler' && FEATURES_TABS[0].items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#dc262615' }}><CheckCircle size={14} style={{ color: '#dc2626' }} /></div>
              <div><h4 className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{item.title}</h4><p className="text-[11px] font-medium text-gray-400 mt-0.5">{item.desc}</p></div>
            </div>
          ))}
          {activeTab === 'nasil-calisir' && FEATURES_TABS[1].items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold text-white" style={{ background: '#dc2626' }}>{item.step}</div>
              <div><h4 className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{item.title}</h4><p className="text-[11px] font-medium text-gray-400 mt-0.5">{item.desc}</p></div>
            </div>
          ))}
          {activeTab === 'ornekler' && (
            <div className="grid grid-cols-2 gap-3">
              {FEATURES_TABS[2].items.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm">
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center mb-3">
                    <Compass size={24} className="text-red-300" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{item.title}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[7px] font-bold" style={{ background: '#dc262615', color: '#dc2626' }}>{item.tag}</span>
                  </div>
                  <p className="text-[10px] font-medium text-gray-400">{item.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
