import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bot, Sparkles, Home, Video, Eye, Compass, Layers,
  Search, ArrowRight, Star, Zap, Shield, CheckCircle,
  Brain, Image, Film, Globe, MessageCircle, Bell
} from 'lucide-react'

const AI_FEATURES = [
  {
    id: 'ev-bulucu',
    title: 'Ev Bulucu',
    subtitle: 'AI Destekli Akıllı Ev Arama',
    desc: 'Doğal dille yazın, yapay zeka size en uygun evleri bulsun. Şehir, oda, bütçe ve özellik kriterlerinize göre mükemmel eşleşmeleri keşfedin.',
    icon: Home,
    color: '#059669',
    bg: 'from-emerald-500/20 to-emerald-600/5',
    route: '/ai/ev-bulucu',
    features: ['Doğal dil ile arama', 'Akıllı eşleşme motoru', 'Puanlama ve sıralama', 'Detaylı filtreleme', 'Anlık sonuç'],
    tab: 'chat',
  },
  {
    id: 'gorsel',
    title: 'Görsel Oluştur',
    subtitle: 'AI ile Emlak Görseli',
    desc: 'Metin açıklamalarınızdan yapay zeka ile etkileyici emlak görselleri oluşturun. Hayalinizdeki evi kelimelerle tarif edin, AI görselleştirsin.',
    icon: Image,
    color: '#8b5cf6',
    bg: 'from-purple-500/20 to-purple-600/5',
    route: '/ai/gorsel',
    features: ['Gerçekçi görsel oluşturma', 'Farklı stiller', 'Yüksek çözünürlük', 'Hızlı sonuç', 'Toplu üretim'],
    tab: 'gorsel',
  },
  {
    id: 'video',
    title: 'Video Oluştur',
    subtitle: 'AI ile Tanıtım Videosu',
    desc: 'Metin ve görsellerden yapay zeka ile profesyonel emlak tanıtım videoları üretin. Sosyal medya için optimize edilmiş çıktılar alın.',
    icon: Film,
    color: '#ec4899',
    bg: 'from-pink-500/20 to-pink-600/5',
    route: '/ai/video',
    features: ['AI montaj', 'Otomatik altyazı', 'Müzik ve seslendirme', 'HD kalite', 'Sosyal medya uyumlu'],
    tab: 'video',
  },
  {
    id: 'sanal-tur',
    title: 'Sanal Tur',
    subtitle: '360° Sanal Tur Deneyimi',
    desc: '360 derece sanal turlar ile gayrimenkulleri uzaktan keşfedin. Alıcılar evi görmeden önce detaylıca inceleyebilsin.',
    icon: Eye,
    color: '#d97706',
    bg: 'from-amber-500/20 to-amber-600/5',
    route: '/ai/sanal-tur',
    features: ['360° görüntüleme', 'Oda geçişleri', 'Bilgi noktaları', 'Mobil uyumlu', 'VR desteği'],
    tab: 'sanal-tur',
  },
  {
    id: '3d-ev',
    title: '3D Modelleme',
    subtitle: '3D Ev Modelleme',
    desc: 'Profesyonel 3D ev modelleri oluşturun. Dış cephe, iç mekan ve kat planlarını üç boyutlu olarak görüntüleyin.',
    icon: Layers,
    color: '#3b82f6',
    bg: 'from-blue-500/20 to-blue-600/5',
    route: '/ai/3d-ev',
    features: ['Gerçekçi 3D modelleme', 'Işık simülasyonu', 'Malzeme seçenekleri', 'Sanal tur entegrasyonu', 'Kat planı'],
    tab: '3d-ev',
  },
  {
    id: 'drone',
    title: 'Drone Çekimi',
    subtitle: '3D Drone Çekimi',
    desc: 'Drone ile hava görüntüleri alın, gayrimenkullerin kuş bakışı görünümlerini ve 3D modellerini oluşturun.',
    icon: Compass,
    color: '#dc2626',
    bg: 'from-red-500/20 to-red-600/5',
    route: '/ai/drone',
    features: ['Profesyonel drone çekimi', 'Hava panoramaları', '3D arazi modelleme', 'Mahalle görüntüleme', 'HD video'],
    tab: 'drone',
  },
]

const TABS = [
  { id: 'tumu', label: 'Tümü', icon: Brain },
  { id: 'arama', label: 'Arama', icon: Search },
  { id: 'gorsel', label: 'Görsel', icon: Image },
  { id: 'video', label: 'Video', icon: Film },
  { id: 'tur', label: 'Tur', icon: Eye },
  { id: 'modelleme', label: '3D', icon: Layers },
]

const TAB_MAP = {
  tumu: null,
  arama: ['ev-bulucu'],
  gorsel: ['gorsel'],
  video: ['video'],
  tur: ['sanal-tur'],
  modelleme: ['3d-ev', 'drone'],
}

export default function FSBOMeslek() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('tumu')
  const [hoveredCard, setHoveredCard] = useState(null)

  const filteredFeatures = TAB_MAP[activeTab]
    ? AI_FEATURES.filter(f => TAB_MAP[activeTab].includes(f.id))
    : AI_FEATURES

  return (
    <div className="flex flex-col min-h-0 h-full">
      {/* HERO */}
      <div className="px-4 sm:px-6 lg:px-8 mt-4 mb-2">
        <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b2e 0%, #2c1a4d 40%, #1a2a3a 100%)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
                <Bot size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">FSBOAI</h1>
                <p className="text-xs font-semibold text-white/50">Yapay Zeka Destekli Emlak Platformu</p>
              </div>
            </div>
            <p className="text-sm font-medium text-white/70 max-w-lg leading-relaxed mb-5">
              Emlak işinizi yapay zekayla güçlendirin. Ev aramadan görsel oluşturmaya, video üretiminden sanal tura kadar tüm AI araçlarınızı tek bir çatı altında keşfedin.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Zap, label: 'Hızlı Sonuç', color: '#e3d10d' },
                { icon: Shield, label: 'Güvenli', color: '#059669' },
                { icon: Star, label: 'Profesyonel', color: '#8b5cf6' },
              ].map((chip, i) => {
                const Icon = chip.icon
                return (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm">
                    <Icon size={12} style={{ color: chip.color }} />
                    <span className="text-[10px] font-bold text-white/80">{chip.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="px-4 sm:px-6 lg:px-8 mb-3">
        <div className="flex gap-1 bg-white rounded-2xl border border-cardBorder p-1 shadow-sm overflow-x-auto scrollbar-none">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  isActive ? 'text-white shadow-md' : 'text-gray-400 hover:text-deep hover:bg-cream'
                }`}
                style={isActive ? { background: '#1e1b2e' } : {}}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* AI FEATURE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredFeatures.map((feature, i) => {
            const Icon = feature.icon
            const isHovered = hoveredCard === feature.id
            return (
              <button
                key={feature.id}
                onClick={() => navigate(feature.route)}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="bg-white rounded-2xl border border-cardBorder overflow-hidden shadow-sm text-left w-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 opacity-0 group"
                style={{ animation: `fadeInUp .4s ease-out ${i * 0.06}s forwards` }}
              >
                <div className={`h-36 bg-gradient-to-br ${feature.bg} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5" />
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                    style={{ background: feature.color }}
                  >
                    <Icon size={28} className="text-white" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={14} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>{feature.title}</h3>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ background: feature.color + '15', color: feature.color }}>YENİ</span>
                  </div>
                  <p className="text-[10px] font-semibold text-gray-400 mb-2">{feature.subtitle}</p>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed mb-3">{feature.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {feature.features.slice(0, 3).map((f, j) => (
                      <span key={j} className="px-2 py-0.5 rounded-lg text-[9px] font-bold" style={{ background: feature.color + '10', color: feature.color }}>{f}</span>
                    ))}
                    {feature.features.length > 3 && (
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-cream text-gray-400">+{feature.features.length - 3}</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* STATS */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: '6+', label: 'AI Aracı', color: '#8b5cf6' },
            { value: '30sn', label: 'Ort. Süre', color: '#059669' },
            { value: '4K', label: 'Çözünürlük', color: '#3b82f6' },
            { value: '7/24', label: 'Erişim', color: '#d97706' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-cardBorder p-4 text-center">
              <p className="text-xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
