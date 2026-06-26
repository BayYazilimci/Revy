import { useState, useEffect } from 'react'
import { useAiAssistant } from '../context/AiAssistantContext'
import {
  Bot, Star, Clock, Bell, BellOff, X,
  Search, Play, Loader, CheckCircle,
  MessageCircle, Calendar, FileText, Ban,
  Sparkles, ArrowLeft, Home, Box, Camera, Globe, Video, Zap, Shield
} from 'lucide-react'

function StarRating({ value, onChange, size = 16 }) { // eslint-disable-line react/prop-types
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          onClick={() => onChange?.(i)}
          className="btn p-0.5"
        >
          <Star
            size={size}
            className={i <= value ? 'fill-current' : 'text-gray-300'}
            style={{ color: i <= value ? '#e3d10d' : undefined }}
          />
        </button>
      ))}
    </div>
  )
}

function formatTime(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'Az önce'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} dk önce`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} sa önce`
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const TOOL_CATEGORIES = [
  {
    id: 'gorsel-olusturma',
    title: 'AI Görsel Oluşturma',
    desc: 'Metin açıklamalarından yapay zeka ile etkileyici görseller oluşturun.',
    icon: Sparkles,
    color: '#8b5cf6',
    bg: 'from-purple-500/20 to-purple-600/5',
    examples: ['Modern ev tasarımı', 'Bahçe düzenlemesi', 'İç mekan konsepti']
  },
  {
    id: 'ev-dizme',
    title: 'Ev Dizme',
    desc: 'Hayalinizdeki evi yapay zeka yardımıyla tasarlayın ve düzenleyin.',
    icon: Home,
    color: '#059669',
    bg: 'from-emerald-500/20 to-emerald-600/5',
    examples: ['Oda yerleşimi', 'Mobilya düzeni', 'Renk paleti']
  },
  {
    id: '3d-ev',
    title: '3D Ev Modelleme',
    desc: 'Profesyonel 3D ev modelleri ve sanal turlar oluşturun.',
    icon: Box,
    color: '#3b82f6',
    bg: 'from-blue-500/20 to-blue-600/5',
    examples: ['Dış cephe modeli', 'İç mekan 3D tur', 'Kat planı']
  },
  {
    id: 'drone-cekim',
    title: '3D Drone Çekimi',
    desc: 'Drone ile hava görüntüleri alın ve 3D model oluşturun.',
    icon: Camera,
    color: '#dc2626',
    bg: 'from-red-500/20 to-red-600/5',
    examples: ['Arsa görüntüleme', 'Mahalle turu', 'Hava panoraması']
  },
  {
    id: 'sanal-tur',
    title: 'Sanal Tur',
    desc: '360 derece sanal turlar ile gayrimenkulleri uzaktan keşfedin.',
    icon: Globe,
    color: '#d97706',
    bg: 'from-amber-500/20 to-amber-600/5',
    examples: ['İç mekan 360', 'Dış mekan 360', 'Sokak görünümü']
  },
  {
    id: 'video-olusturma',
    title: 'AI Video Oluşturma',
    desc: 'Metin ve görsellerden yapay zeka ile profesyonel videolar üretin.',
    icon: Video,
    color: '#ec4899',
    bg: 'from-pink-500/20 to-pink-600/5',
    examples: ['Emlak tanıtımı', 'Mahalle rehberi', 'Özellik turları']
  },
]

const TOOL_DETAILS = {
  'gorsel-olusturma': {
    title: 'AI Görsel Oluşturma',
    icon: Sparkles,
    color: '#8b5cf6',
    desc: 'Metin açıklamalarınızı yapay zeka ile etkileyici görsellere dönüştürün. Hayalinizdeki ev, bahçe veya iç mekanı kelimelerle tarif edin, AI sizin için görselleştirsin.',
    features: [
      'Gerçekçi görsel oluşturma',
      'Farklı stiller ve renk paletleri',
      'Yüksek çözünürlüklü çıktı',
      'Hızlı sonuç (30 saniye)',
      'Toplu görsel oluşturma'
    ],
    howItWorks: [
      'Oluşturmak istediğiniz görseli metin olarak tarif edin',
      'Stil ve boyut tercihlerinizi seçin',
      'AI görselinizi oluştursun',
      'Görseli indirin veya düzenleyin'
    ],
    samples: ['Modern villa tasarımı', 'Bahçe peyzajı', 'İç mekan dekorasyonu', 'Mutfak yenileme']
  },
  'ev-dizme': {
    title: 'Ev Dizme',
    icon: Home,
    color: '#059669',
    desc: 'Yapay zeka yardımıyla evinizi en verimli şekilde düzenleyin. Oda yerleşiminden mobilya seçimine kadar her aşamada size rehberlik eder.',
    features: [
      'Akıllı oda yerleşimi',
      'Mobilya önerileri',
      'Renk ve doku analizi',
      'Alan optimizasyonu',
      '3D önizleme'
    ],
    howItWorks: [
      'Oda ölçülerinizi girin',
      'İhtiyaçlarınızı belirtin',
      'AI size en uygun düzeni sunsun',
      'Beğendiğiniz düzeni kaydedin'
    ],
    samples: ['Oturma odası düzeni', 'Yatak odası tasarımı', 'Çalışma odası', 'Açık mutfak']
  },
  '3d-ev': {
    title: '3D Ev Modelleme',
    icon: Box,
    color: '#3b82f6',
    desc: 'Profesyonel 3D ev modelleri oluşturun. Dış cephe, iç mekan ve kat planlarını üç boyutlu olarak görüntüleyin.',
    features: [
      'Gerçekçi 3D modelleme',
      'İç ve dış mekan görselleştirme',
      'Işık ve gölge simülasyonu',
      'Malzeme ve doku seçenekleri',
      'Sanal tur entegrasyonu'
    ],
    howItWorks: [
      'Evinizin planını yükleyin',
      'Malzeme ve renkleri seçin',
      'AI 3D modeli oluştursun',
      'Modeli 360 derece keşfedin'
    ],
    samples: ['Müstakil ev', 'Apartman dairesi', 'Villa modeli', 'Ofis binası']
  },
  'drone-cekim': {
    title: '3D Drone Çekimi',
    icon: Camera,
    color: '#dc2626',
    desc: 'Drone ile hava görüntüleri alın, gayrimenkullerin kuş bakışı görünümlerini ve 3D modellerini oluşturun.',
    features: [
      'Profesyonel drone çekimi',
      'Hava panoramaları',
      '3D arazi modelleme',
      'Mahalle ve çevre görüntüleme',
      'HD video çekimi'
    ],
    howItWorks: [
      'Çekim bölgesini belirleyin',
      'Drone uçuş rotasını planlayın',
      'Görüntüleri alın',
      'AI ile 3D model oluşturun'
    ],
    samples: ['Arsa görüntüleme', 'Site hava çekimi', 'Mahalle turu', 'Arazi analizi']
  },
  'sanal-tur': {
    title: 'Sanal Tur',
    icon: Globe,
    color: '#d97706',
    desc: '360 derece sanal turlar ile gayrimenkulleri uzaktan keşfedin. Alıcılar evi görmeden önce detaylıca inceleyebilsin.',
    features: [
      '360 derece görüntüleme',
      'Oda geçişleri',
      'Bilgi noktaları',
      'Mobil uyumlu',
      'VR desteği'
    ],
    howItWorks: [
      'Mekanı 360 kamera ile çekin',
      'AI görüntüleri birleştirsin',
      'Sanal turu oluşturun',
      'Link ile paylaşın'
    ],
    samples: ['İç mekan turu', 'Dış mekan turu', 'Kat planı entegrasyonu', 'Mahalle keşfi']
  },
  'video-olusturma': {
    title: 'AI Video Oluşturma',
    icon: Video,
    color: '#ec4899',
    desc: 'Metin ve görsellerden yapay zeka ile profesyonel tanıtım videoları oluşturun. Gayrimenkullerinizi etkileyici videolarla tanıtın.',
    features: [
      'AI destekli video montaj',
      'Otomatik altyazı',
      'Müzik ve seslendirme',
      'HD kalite',
      'Sosyal medya optimizasyonu'
    ],
    howItWorks: [
      'Görsel ve metinlerinizi yükleyin',
      'Video şablonu seçin',
      'AI videonuzu oluştursun',
      'Düzenleyip paylaşın'
    ],
    samples: ['Emlak tanıtım videosu', 'Mahalle rehberi', 'Özellik turları', 'Karşılaştırma videoları']
  },
}

const ACTION_OPTIONS = [
  {
    id: 'whatsapp-bilgi',
    label: 'WhatsApp ile bilgilendir',
    desc: 'Müşteriye bulunan ilanları WhatsApp üzerinden ilet',
    icon: MessageCircle,
    color: '#25D366',
  },
  {
    id: 'whatsapp-randevu',
    label: 'WhatsApp ile randevu ayarla',
    desc: 'Müşteriye randevu teklifi gönder',
    icon: Calendar,
    color: '#8b5cf6',
  },
  {
    id: 'whatsapp-detay',
    label: 'Detaylı rapor gönder',
    desc: 'Arama sonuçlarının detaylı raporunu WhatsApp ile paylaş',
    icon: FileText,
    color: '#3b82f6',
  },
]

export default function AiAssistant() {
  const {
    searchMemory, rateSearch, getGoodSearches,
    backgroundTasks, sendToBackground, removeBackgroundTask,
    notificationEnabled, setNotificationEnabled,
    pendingNotification, dismissNotification, handleNotificationAction,
    whatsappLog,
  } = useAiAssistant()
  const [activeTab, setActiveTab] = useState('agents')
  const [showWaLog, setShowWaLog] = useState(false)
  const [showMobileNotif, setShowMobileNotif] = useState(false)
  const [selectedTool, setSelectedTool] = useState(null)

  const goodSearches = getGoodSearches()
  const runningCount = backgroundTasks.filter(t => t.status === 'running').length

  useEffect(() => {
    if (pendingNotification) {
      setShowMobileNotif(true)
    } else {
      setShowMobileNotif(false)
    }
  }, [pendingNotification])

  const handleAction = (actionId) => {
    handleNotificationAction(actionId)
    setShowMobileNotif(false)
  }

  const getTaskIcon = (task) => {
    switch (task.status) {
      case 'running': return <Loader size={14} className="animate-spin text-blue-500" />
      case 'completed': return <CheckCircle size={14} className="text-green-500" />
      default: return <Clock size={14} className="text-gray-400" />
    }
  }

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="px-4 sm:px-6 lg:px-8 mt-4 mb-2">
        <div className="flex items-center justify-between animate-fade-up" style={{ animationDelay: '.04s' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold" style={{ color: '#1e1b2e' }}>AI Asistanlar</h2>
              <p className="text-[10px] font-semibold text-gray-400 -mt-0.5">
                OpenRouter destekli akıllı ajanlar
                {runningCount > 0 && (
                  <span className="ml-2 text-blue-500">· {runningCount} işlem arka planda</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setNotificationEnabled(!notificationEnabled)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center btn transition-all ${
                notificationEnabled ? 'bg-white border border-cardBorder text-gray-500' : 'bg-red-50 border border-red-200 text-red-400'
              }`}
              title={notificationEnabled ? 'Bildirimleri Kapat' : 'Bildirimleri Aç'}
            >
              {notificationEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
            <button
              onClick={() => setShowWaLog(!showWaLog)}
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center btn transition-all ${
                showWaLog ? 'bg-green-500 text-white' : 'bg-white border border-cardBorder text-gray-500'
              }`}
              title="WhatsApp Mesaj Geçmişi"
            >
              <MessageCircle size={16} />
              {whatsappLog.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {whatsappLog.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 mb-4">
          {[
            { key: 'agents', label: 'Ajanlar', icon: Bot },
            { key: 'searches', label: 'Aramalar', icon: Search },
            { key: 'tasks', label: 'İşlemler', icon: Clock },
            { key: 'tools', label: 'Araçlar', icon: Sparkles },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold btn transition-all flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? 'text-white shadow-md'
                    : 'bg-white border border-cardBorder text-deep/60 hover:bg-cream'
                }`}
                style={activeTab === tab.key ? { background: '#1e1b2e' } : {}}
              >
                <Icon size={14} />
                {tab.label}
                {tab.key === 'searches' && goodSearches.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ background: activeTab === tab.key ? 'rgba(255,255,255,.2)' : '#e3d10d' }}>
                    {goodSearches.length}
                  </span>
                )}
                {tab.key === 'tasks' && runningCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-500 text-white">
                    {runningCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'agents' && (
          <div className="animate-fade-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-cardBorder p-5 shadow-sm">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(139,92,246,.15)' }}>
                  <Search size={18} style={{ color: '#8b5cf6' }} />
                </div>
                <h3 className="text-sm font-extrabold mb-1" style={{ color: '#1e1b2e' }}>Arama Asistanı</h3>
                <p className="text-[11px] font-medium text-gray-400 mb-3">Keşfet sayfasındaki aramalarını takip eder, başarılı aramaları hatırlar.</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-400">{searchMemory.length} arama kaydedildi</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: goodSearches.length > 0 ? '#059669' : '#9ca3af' }}>
                    <Star size={10} className="fill-current" style={{ color: goodSearches.length > 0 ? '#e3d10d' : '#d1d5db' }} />
                    {goodSearches.length} başarılı
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-cardBorder p-5 shadow-sm">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(59,130,246,.15)' }}>
                  <Bell size={18} style={{ color: '#3b82f6' }} />
                </div>
                <h3 className="text-sm font-extrabold mb-1" style={{ color: '#1e1b2e' }}>Bildirim Asistanı</h3>
                <p className="text-[11px] font-medium text-gray-400 mb-3">Başarılı aramaları tespit eder, bildirim pop-up&apos;ı gösterir.</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-400">
                    {notificationEnabled ? 'Aktif' : 'Devre dışı'}
                  </span>
                  <button
                    onClick={() => setNotificationEnabled(!notificationEnabled)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg btn ${
                      notificationEnabled ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                    }`}
                  >
                    {notificationEnabled ? 'Açık' : 'Kapalı'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-cardBorder p-5 shadow-sm">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(245,158,11,.15)' }}>
                  <Clock size={18} style={{ color: '#d97706' }} />
                </div>
                <h3 className="text-sm font-extrabold mb-1" style={{ color: '#1e1b2e' }}>Arka Plan Asistanı</h3>
                <p className="text-[11px] font-medium text-gray-400 mb-3">Aramaları arka planda çalıştırır, tamamlanınca bildirir.</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-400">{backgroundTasks.length} işlem</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                    runningCount > 0 ? 'bg-blue-50 text-blue-600' : 'bg-cream text-gray-400'
                  }`}>
                    {runningCount > 0 ? `${runningCount} aktif` : 'Boşta'}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-cardBorder p-5 shadow-sm">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(37,211,102,.15)' }}>
                  <MessageCircle size={18} style={{ color: '#25D366' }} />
                </div>
                <h3 className="text-sm font-extrabold mb-1" style={{ color: '#1e1b2e' }}>WhatsApp Asistanı</h3>
                <p className="text-[11px] font-medium text-gray-400 mb-3">Seçilen aksiyona göre WhatsApp mesajı hazırlar (test modu).</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-400">{whatsappLog.length} mesaj gönderildi</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-cream text-gray-400">Test</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'searches' && (
          <div className="animate-fade-up">
            {searchMemory.length === 0 ? (
              <div className="bg-white rounded-2xl border border-cardBorder p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center mx-auto mb-3">
                  <Search size={22} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold" style={{ color: '#1e1b2e' }}>Henüz arama kaydı yok</p>
                <p className="text-xs text-gray-400 mt-1">Keşfet sayfasında arama yapınca burada görünecek</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchMemory.map(search => (
                  <div key={search.id} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate" style={{ color: '#1e1b2e' }}>
                          {search.query || 'Filtre araması'}
                        </p>
                        <p className="text-[11px] font-medium text-gray-400">
                          {search.resultCount} sonuç · {formatTime(search.timestamp)}
                        </p>
                      </div>
                      <StarRating value={search.rating} onChange={(r) => rateSearch(search.id, r)} size={14} />
                    </div>
                    <div className="flex items-center gap-2">
                      {search.rating >= 3 && (
                        <>
                          <button
                            onClick={() => {
                              sendToBackground({
                                label: `Arama: ${search.query || 'Kriterler'}`,
                                type: 'search',
                                data: { query: search.query, filters: search.filters },
                              })
                            }}
                            className="px-3 py-1.5 rounded-xl text-[10px] font-bold btn flex items-center gap-1 border border-cardBorder hover:bg-cream transition-all"
                            style={{ color: '#1e1b2e' }}
                          >
                            <Play size={11} />
                            Meşgule At
                          </button>
                          <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-green-50 text-green-600">
                            {search.rating}/5 ★ Başarılı
                          </span>
                        </>
                      )}
                      {search.rating > 0 && search.rating < 3 && (
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-cream text-gray-400">
                          {search.rating}/5
                        </span>
                      )}
                      {search.rating === 0 && (
                        <span className="text-[10px] font-medium text-gray-400">Henüz puanlanmamış</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="animate-fade-up">
            {backgroundTasks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-cardBorder p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center mx-auto mb-3">
                  <Clock size={22} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold" style={{ color: '#1e1b2e' }}>Aktif işlem yok</p>
                <p className="text-xs text-gray-400 mt-1">Başarılı aramaları meşgule atıp takip edebilirsiniz</p>
              </div>
            ) : (
              <div className="space-y-2">
                {backgroundTasks.map(task => (
                  <div key={task.id} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
                      background: task.status === 'running' ? 'rgba(59,130,246,.1)' : 'rgba(5,150,105,.1)'
                    }}>
                      {getTaskIcon(task)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: '#1e1b2e' }}>{task.label}</p>
                      <p className="text-[10px] font-medium text-gray-400">
                        {task.status === 'running' ? 'Çalışıyor...' : 'Tamamlandı'} · {formatTime(task.startedAt)}
                      </p>
                    </div>
                    {task.status === 'completed' && (
                      <button
                        onClick={() => removeBackgroundTask(task.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 btn transition-all"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="animate-fade-up">
            {selectedTool ? (
              <div>
                <button
                  onClick={() => setSelectedTool(null)}
                  className="flex items-center gap-2 text-xs font-bold btn mb-4"
                  style={{ color: '#1e1b2e' }}
                >
                  <ArrowLeft size={16} />
                  Tüm Araçlar
                </button>

                <div className="bg-white rounded-2xl border border-cardBorder p-5 shadow-sm mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: selectedTool.color }}>
                      {(() => { const Icon = selectedTool.icon; return <Icon size={22} className="text-white" /> })()}
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold" style={{ color: '#1e1b2e' }}>{selectedTool.title}</h2>
                      <p className="text-xs font-medium text-gray-400">AI Destekli Araç</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed mb-4">{selectedTool.desc}</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-cardBorder p-4">
                      <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1e1b2e' }}>
                        <CheckCircle size={16} style={{ color: selectedTool.color }} />
                        Özellikler
                      </h3>
                      <ul className="space-y-2">
                        {selectedTool.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: selectedTool.color }} />
                            <span className="text-xs font-semibold text-gray-500">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white rounded-2xl border border-cardBorder p-4">
                      <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1e1b2e' }}>
                        <Zap size={16} style={{ color: selectedTool.color }} />
                        Nasıl Çalışır?
                      </h3>
                      <div className="space-y-3">
                        {selectedTool.howItWorks.map((step, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0"
                              style={{ background: selectedTool.color }}
                            >
                              {i + 1}
                            </div>
                            <span className="text-xs font-semibold text-gray-500 pt-1">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-cardBorder p-4">
                      <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1e1b2e' }}>
                        <Clock size={16} style={{ color: selectedTool.color }} />
                        Örnek Çalışmalar
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTool.samples.map((s, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-xl text-[11px] font-bold btn"
                            style={{ background: selectedTool.color + '12', color: selectedTool.color }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-cardBorder p-4">
                      <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1e1b2e' }}>
                        <Shield size={16} style={{ color: selectedTool.color }} />
                        Neden Biz?
                      </h3>
                      <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                        En son yapay zeka teknolojileri ile çalışıyor, size en kaliteli sonuçları en hızlı şekilde sunuyoruz.
                        Profesyonel ekibimiz her adımda size destek oluyor.
                      </p>
                      <button
                        className="w-full mt-3 py-3 rounded-xl text-xs font-extrabold shadow-lg btn"
                        style={{ background: selectedTool.color, color: '#fff', boxShadow: `0 8px 24px ${selectedTool.color}40` }}
                      >
                        Hemen Başla
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {TOOL_CATEGORIES.map((cat, i) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedTool(TOOL_DETAILS[cat.id])}
                      className="bg-white rounded-2xl border border-cardBorder overflow-hidden shadow-sm text-left w-full opacity-0"
                      style={{
                        animation: `fadeInUp .4s ease-out ${i * 0.06}s forwards`
                      }}
                    >
                      <div className={`h-32 bg-gradient-to-br ${cat.bg} flex items-center justify-center relative overflow-hidden`}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: cat.color }}>
                          <Icon size={28} className="text-white" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-extrabold mb-1" style={{ color: '#1e1b2e' }}>{cat.title}</h3>
                        <p className="text-xs font-medium text-gray-400 leading-relaxed mb-3">{cat.desc}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.examples.map((ex, j) => (
                            <span
                              key={j}
                              className="px-2 py-0.5 rounded-lg text-[9px] font-bold"
                              style={{ background: cat.color + '15', color: cat.color }}
                            >
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification Popup */}
      {pendingNotification && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-modal-fade"
            onClick={dismissNotification}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-auto p-6 animate-scale-in">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
                <Bot size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>AI Asistan Bildirimi</h3>
                <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                  {formatTime(pendingNotification.timestamp)}
                </p>
              </div>
              <button
                onClick={dismissNotification}
                className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center shrink-0"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-5">
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#1e1b2e' }}>
                Merhaba, ben AI asistanınız.{' '}
                <span className="font-extrabold">&ldquo;{pendingNotification.query}&rdquo;</span>{' '}
                aramanızla ilgili{' '}
                <span className="font-extrabold">{pendingNotification.resultCount} adet</span>{' '}
                uygun ilan bulduk. Ne yapmak istersiniz?
              </p>
            </div>

            <div className="space-y-2">
              {ACTION_OPTIONS.map(opt => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleAction(opt.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-cardBorder hover:bg-cream btn transition-all text-left"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: opt.color + '18' }}
                    >
                      <Icon size={16} style={{ color: opt.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{opt.label}</p>
                      <p className="text-[10px] font-medium text-gray-400">{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => handleAction('nothing')}
              className="w-full mt-3 py-3 rounded-2xl text-xs font-bold btn border border-cardBorder hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
              style={{ color: '#1e1b2e' }}
            >
              <Ban size={14} className="mr-1.5" />
              Hiçbir şey yapma
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Log Drawer (Desktop) */}
      {showWaLog && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowWaLog(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-[420px] bg-white shadow-2xl animate-drawer-in-right flex flex-col">
            <div className="shrink-0 px-5 py-4 border-b border-cardBorder flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center gap-2" style={{ color: '#1e1b2e' }}>
                <MessageCircle size={16} style={{ color: '#25D366' }} />
                WhatsApp Mesaj Geçmişi
              </h3>
              <button onClick={() => setShowWaLog(false)} className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {whatsappLog.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center mx-auto mb-3">
                    <MessageCircle size={22} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-bold" style={{ color: '#1e1b2e' }}>Henüz mesaj gönderilmedi</p>
                  <p className="text-xs text-gray-400 mt-1">Bildirim aksiyonları burada görünecek</p>
                </div>
              ) : (
                <div className="divide-y divide-cardBorder">
                  {whatsappLog.map(entry => (
                    <div key={entry.id} className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#25D36618' }}>
                          <MessageCircle size={13} style={{ color: '#25D366' }} />
                        </div>
                        <div>
                          <p className="text-[11px] font-extrabold" style={{ color: '#1e1b2e' }}>{entry.action}</p>
                          <p className="text-[9px] font-medium text-gray-400">{formatTime(entry.timestamp)} · {entry.searchQuery}</p>
                        </div>
                      </div>
                      <div className="bg-cream rounded-2xl p-3 text-[11px] font-medium leading-relaxed whitespace-pre-wrap" style={{ color: '#1e1b2e' }}>
                        {entry.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {whatsappLog.length > 0 && (
              <div className="shrink-0 px-5 py-3 border-t border-cardBorder">
                <p className="text-[9px] font-medium text-gray-400 text-center">
                  * Test modu: Gerçek WhatsApp mesajı gönderilmez
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Notification Drawer */}
      {showMobileNotif && pendingNotification && (
        <div className="fixed inset-0 z-[65] flex items-end sm:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { dismissNotification(); setShowMobileNotif(false) }} />
          <div className="relative w-full bg-white rounded-t-3xl shadow-2xl p-5 pb-8 animate-slide-up">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
                <Bot size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>AI Asistan Bildirimi</h3>
                <p className="text-[10px] font-medium text-gray-400">
                  {formatTime(pendingNotification.timestamp)}
                </p>
              </div>
              <button
                onClick={() => { dismissNotification(); setShowMobileNotif(false) }}
                className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <p className="text-sm font-medium leading-relaxed mb-4" style={{ color: '#1e1b2e' }}>
              Merhaba, ben AI asistanınız.{' '}
              <span className="font-extrabold">&ldquo;{pendingNotification.query}&rdquo;</span>{' '}
              aramanızla ilgili{' '}
              <span className="font-extrabold">{pendingNotification.resultCount} adet</span>{' '}
              uygun ilan bulduk. Ne yapmak istersiniz?
            </p>

            <div className="space-y-2 mb-3">
              {ACTION_OPTIONS.map(opt => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleAction(opt.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-cardBorder hover:bg-cream btn transition-all text-left"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: opt.color + '18' }}
                    >
                      <Icon size={16} style={{ color: opt.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{opt.label}</p>
                      <p className="text-[9px] font-medium text-gray-400">{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => handleAction('nothing')}
              className="w-full py-3 rounded-2xl text-xs font-bold btn border border-cardBorder hover:bg-red-50 hover:text-red-500 transition-all"
              style={{ color: '#1e1b2e' }}
            >
              Hiçbir şey yapma
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
