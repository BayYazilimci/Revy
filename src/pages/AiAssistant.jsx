import { useState, useEffect, useContext, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAiAssistant } from '../context/AiAssistantContext'
import { usePropertyData } from '../context/PropertiesContext'
import { useApp } from '../context/AppContext'
import { TabContext } from '../context/TabContext'
import {
  Bot, Star, Clock, Bell, BellOff, X,
  Search, Play, Loader, CheckCircle,
  MessageCircle, Calendar, FileText, Ban,
  Sparkles, ArrowLeft, Home, MapPin, Video, Zap, Shield, Send,
  List, ArrowUpDown, Eye, FolderPlus, RefreshCw, SlidersHorizontal,
  Compass, Brain, History, Layers
} from 'lucide-react'
import { parseUserMessage, findBestMatches, generateResponse } from '../utils/evBulucuUtils'

function StarRating({ value, onChange, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} onClick={() => onChange?.(i)} className="btn p-0.5">
          <Star size={size} className={i <= value ? 'fill-current' : 'text-gray-300'} style={{ color: i <= value ? '#e3d10d' : undefined }} />
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
    id: 'gorsel-olusturma', title: 'AI Görsel Oluşturma',
    desc: 'Metin açıklamalarından yapay zeka ile etkileyici görseller oluşturun.',
    icon: Sparkles, color: '#8b5cf6', bg: 'from-purple-500/20 to-purple-600/5',
    examples: ['Modern ev tasarımı', 'Bahçe düzenlemesi', 'İç mekan konsepti']
  },
  {
    id: 'ev-dizme', title: 'Ev Dizme',
    desc: 'Hayalinizdeki evi yapay zeka yardımıyla tasarlayın ve düzenleyin.',
    icon: Home, color: '#059669', bg: 'from-emerald-500/20 to-emerald-600/5',
    examples: ['Oda yerleşimi', 'Mobilya düzeni', 'Renk paleti']
  },
  {
    id: '3d-ev', title: '3D Ev Modelleme',
    desc: 'Profesyonel 3D ev modelleri ve sanal turlar oluşturun.',
    icon: Layers, color: '#3b82f6', bg: 'from-blue-500/20 to-blue-600/5',
    examples: ['Dış cephe modeli', 'İç mekan 3D tur', 'Kat planı']
  },
  {
    id: 'drone-cekim', title: '3D Drone Çekimi',
    desc: 'Drone ile hava görüntüleri alın ve 3D model oluşturun.',
    icon: Compass, color: '#dc2626', bg: 'from-red-500/20 to-red-600/5',
    examples: ['Arsa görüntüleme', 'Mahalle turu', 'Hava panoraması']
  },
  {
    id: 'sanal-tur', title: 'Sanal Tur',
    desc: '360 derece sanal turlar ile gayrimenkulleri uzaktan keşfedin.',
    icon: Eye, color: '#d97706', bg: 'from-amber-500/20 to-amber-600/5',
    examples: ['İç mekan 360', 'Dış mekan 360', 'Sokak görünümü']
  },
  {
    id: 'video-olusturma', title: 'AI Video Oluşturma',
    desc: 'Metin ve görsellerden yapay zeka ile profesyonel videolar üretin.',
    icon: Video, color: '#ec4899', bg: 'from-pink-500/20 to-pink-600/5',
    examples: ['Emlak tanıtımı', 'Mahalle rehberi', 'Özellik turları']
  },
]

const TOOL_DETAILS = {
  'gorsel-olusturma': {
    title: 'AI Görsel Oluşturma', icon: Sparkles, color: '#8b5cf6',
    desc: 'Metin açıklamalarınızı yapay zeka ile etkileyici görsellere dönüştürün. Hayalinizdeki ev, bahçe veya iç mekanı kelimelerle tarif edin, AI sizin için görselleştirsin.',
    features: ['Gerçekçi görsel oluşturma', 'Farklı stiller ve renk paletleri', 'Yüksek çözünürlüklü çıktı', 'Hızlı sonuç (30 saniye)', 'Toplu görsel oluşturma'],
    howItWorks: ['Oluşturmak istediğiniz görseli metin olarak tarif edin', 'Stil ve boyut tercihlerinizi seçin', 'AI görselinizi oluştursun', 'Görseli indirin veya düzenleyin'],
    samples: ['Modern villa tasarımı', 'Bahçe peyzajı', 'İç mekan dekorasyonu', 'Mutfak yenileme']
  },
  'ev-dizme': {
    title: 'Ev Dizme', icon: Home, color: '#059669',
    desc: 'Yapay zeka yardımıyla evinizi en verimli şekilde düzenleyin. Oda yerleşiminden mobilya seçimine kadar her aşamada size rehberlik eder.',
    features: ['Akıllı oda yerleşimi', 'Mobilya önerileri', 'Renk ve doku analizi', 'Alan optimizasyonu', '3D önizleme'],
    howItWorks: ['Oda ölçülerinizi girin', 'İhtiyaçlarınızı belirtin', 'AI size en uygun düzeni sunsun', 'Beğendiğiniz düzeni kaydedin'],
    samples: ['Oturma odası düzeni', 'Yatak odası tasarımı', 'Çalışma odası', 'Açık mutfak']
  },
  '3d-ev': {
    title: '3D Ev Modelleme', icon: Layers, color: '#3b82f6',
    desc: 'Profesyonel 3D ev modelleri oluşturun. Dış cephe, iç mekan ve kat planlarını üç boyutlu olarak görüntüleyin.',
    features: ['Gerçekçi 3D modelleme', 'İç ve dış mekan görselleştirme', 'Işık ve gölge simülasyonu', 'Malzeme ve doku seçenekleri', 'Sanal tur entegrasyonu'],
    howItWorks: ['Evinizin planını yükleyin', 'Malzeme ve renkleri seçin', 'AI 3D modeli oluştursun', 'Modeli 360 derece keşfedin'],
    samples: ['Müstakil ev', 'Apartman dairesi', 'Villa modeli', 'Ofis binası']
  },
  'drone-cekim': {
    title: '3D Drone Çekimi', icon: Compass, color: '#dc2626',
    desc: 'Drone ile hava görüntüleri alın, gayrimenkullerin kuş bakışı görünümlerini ve 3D modellerini oluşturun.',
    features: ['Profesyonel drone çekimi', 'Hava panoramaları', '3D arazi modelleme', 'Mahalle ve çevre görüntüleme', 'HD video çekimi'],
    howItWorks: ['Çekim bölgesini belirleyin', 'Drone uçuş rotasını planlayın', 'Görüntüleri alın', 'AI ile 3D model oluşturun'],
    samples: ['Arsa görüntüleme', 'Site hava çekimi', 'Mahalle turu', 'Arazi analizi']
  },
  'sanal-tur': {
    title: 'Sanal Tur', icon: Eye, color: '#d97706',
    desc: '360 derece sanal turlar ile gayrimenkulleri uzaktan keşfedin. Alıcılar evi görmeden önce detaylıca inceleyebilsin.',
    features: ['360 derece görüntüleme', 'Oda geçişleri', 'Bilgi noktaları', 'Mobil uyumlu', 'VR desteği'],
    howItWorks: ['Mekanı 360 kamera ile çekin', 'AI görüntüleri birleştirsin', 'Sanal turu oluşturun', 'Link ile paylaşın'],
    samples: ['İç mekan turu', 'Dış mekan turu', 'Kat planı entegrasyonu', 'Mahalle keşfi']
  },
  'video-olusturma': {
    title: 'AI Video Oluşturma', icon: Video, color: '#ec4899',
    desc: 'Metin ve görsellerden yapay zeka ile profesyonel tanıtım videoları oluşturun. Gayrimenkullerinizi etkileyici videolarla tanıtın.',
    features: ['AI destekli video montaj', 'Otomatik altyazı', 'Müzik ve seslendirme', 'HD kalite', 'Sosyal medya optimizasyonu'],
    howItWorks: ['Görsel ve metinlerinizi yükleyin', 'Video şablonu seçin', 'AI videonuzu oluştursun', 'Düzenleyip paylaşın'],
    samples: ['Emlak tanıtım videosu', 'Mahalle rehberi', 'Özellik turları', 'Karşılaştırma videoları']
  },
}

const ACTION_OPTIONS = [
  { id: 'whatsapp-bilgi', label: 'WhatsApp ile bilgilendir', desc: 'Müşteriye bulunan ilanları WhatsApp üzerinden ilet', icon: MessageCircle, color: '#25D366' },
  { id: 'whatsapp-randevu', label: 'WhatsApp ile randevu ayarla', desc: 'Müşteriye randevu teklifi gönder', icon: Calendar, color: '#8b5cf6' },
  { id: 'whatsapp-detay', label: 'Detaylı rapor gönder', desc: 'Arama sonuçlarının detaylı raporunu WhatsApp ile paylaş', icon: FileText, color: '#3b82f6' },
]

const SORT_OPTIONS = [
  { label: 'Son eklenen', value: 'newest' },
  { label: 'Fiyat (Artan)', value: 'price_asc' },
  { label: 'Fiyat (Azalan)', value: 'price_desc' },
]

const CAT_COLORS = {
  'Tümü': '#1e1b2e', 'Satılık': '#059669', 'Kiralık': '#3b82f6',
  'Villa': '#8b5cf6', 'Daire': '#dc2626'
}

const MAIN_TABS = [
  { id: 'kesfet', label: 'Keşfet', icon: Compass },
  { id: 'chat', label: 'AI Chat', icon: Bot },
  { id: 'araclar', label: 'AI Araçlar', icon: Brain },
  { id: 'gecmis', label: 'Geçmiş', icon: History },
]

export default function AiAssistant() {
  const navigate = useNavigate()
  const {
    searchMemory, rateSearch, getGoodSearches,
    backgroundTasks, sendToBackground, removeBackgroundTask,
    notificationEnabled, setNotificationEnabled,
    pendingNotification, dismissNotification, handleNotificationAction,
    whatsappLog, recordSearch,
  } = useAiAssistant()
  const { properties, allProperties, categories } = usePropertyData()
  const { addToast, lists, addToList } = useApp()
  const { setActiveTab: setGlobalTab } = useContext(TabContext)

  const [activeSection, setActiveSection] = useState('kesfet')
  const [showWaLog, setShowWaLog] = useState(false)
  const [showMobileNotif, setShowMobileNotif] = useState(false)
  const [selectedTool, setSelectedTool] = useState(null)

  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [expandedChatId, setExpandedChatId] = useState(null)
  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)

  const [activeCategory, setActiveCategory] = useState('Tümü')
  const [showSheet, setShowSheet] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [filterDistrict, setFilterDistrict] = useState('')
  const [filterNeighborhood, setFilterNeighborhood] = useState('')
  const [filterRooms, setFilterRooms] = useState('')
  const [minSize, setMinSize] = useState('')
  const [maxSize, setMaxSize] = useState('')
  const [visibleCount, setVisibleCount] = useState(24)

  const parsePrice = (str) => typeof str === 'number' ? str : parseInt(String(str).replace(/[₺.]/g, ''))

  const parseLocation = (loc) => {
    const parts = loc.split(', ').map(s => s.trim())
    return parts.length === 3
      ? { neighborhood: parts[0], district: parts[1], city: parts[2] }
      : { neighborhood: null, district: parts[0], city: parts[1] }
  }

  const districtOptions = useMemo(() => {
    const set = new Set()
    allProperties.forEach(p => set.add(parseLocation(p.location).district))
    return Array.from(set).sort()
  }, [allProperties])

  const neighborhoodOptions = useMemo(() => {
    const set = new Set()
    allProperties.forEach(p => {
      const parsed = parseLocation(p.location)
      if (!filterDistrict || parsed.district === filterDistrict) {
        if (parsed.neighborhood) set.add(parsed.neighborhood)
      }
    })
    return Array.from(set).sort()
  }, [allProperties, filterDistrict])

  const roomOptions = useMemo(() => {
    const set = new Set()
    allProperties.forEach(p => set.add(p.rooms))
    return Array.from(set).sort()
  }, [allProperties])

  const filteredProperties = useMemo(() => {
    let result = allProperties.filter(prop => {
      if (activeCategory !== 'Tümü') {
        if (['Satılık', 'Kiralık'].includes(activeCategory)) {
          if (prop.type !== activeCategory) return false
        } else {
          if (prop.subtype !== activeCategory) return false
        }
      }
      if (minPrice || maxPrice) {
        const price = parsePrice(prop.price)
        if (minPrice && price < parseInt(minPrice)) return false
        if (maxPrice && price > parseInt(maxPrice)) return false
      }
      if (filterDistrict && parseLocation(prop.location).district !== filterDistrict) return false
      if (filterNeighborhood && parseLocation(prop.location).neighborhood !== filterNeighborhood) return false
      if (filterRooms && prop.rooms !== filterRooms) return false
      if (minSize || maxSize) {
        const size = parseInt(prop.size.replace(/[^0-9]/g, ''))
        if (minSize && size < parseInt(minSize)) return false
        if (maxSize && size > parseInt(maxSize)) return false
      }
      if (locationFilter && !prop.location.toLowerCase().includes(locationFilter.toLowerCase())) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const inTitle = prop.title.toLowerCase().includes(q)
        const inLocation = prop.location.toLowerCase().includes(q)
        const inDesc = (prop.description || '').toLowerCase().includes(q)
        if (!inTitle && !inLocation && !inDesc) return false
      }
      return true
    })
    if (sortBy === 'price_asc') result = [...result].sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
    else if (sortBy === 'price_desc') result = [...result].sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
    return result
  }, [allProperties, activeCategory, minPrice, maxPrice, filterDistrict, filterNeighborhood, filterRooms, minSize, maxSize, locationFilter, searchQuery, sortBy])

  const clearFilters = () => {
    setActiveCategory('Tümü'); setMinPrice(''); setMaxPrice('')
    setFilterDistrict(''); setFilterNeighborhood(''); setFilterRooms('')
    setMinSize(''); setMaxSize(''); setLocationFilter('')
    setSearchQuery(''); setSortBy('newest')
  }

  const hasActiveFilters = activeCategory !== 'Tümü' || minPrice || maxPrice || filterDistrict || filterNeighborhood || filterRooms || minSize || maxSize || locationFilter || searchQuery || sortBy !== 'newest'
  const goodSearches = getGoodSearches()
  const runningCount = backgroundTasks.filter(t => t.status === 'running').length

  useEffect(() => {
    if (chatMessages.length === 0) setChatMessages([{ id: 'welcome', role: 'assistant', text: '', results: [] }])
  }, [])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  useEffect(() => {
    if (pendingNotification) setShowMobileNotif(true)
    else setShowMobileNotif(false)
  }, [pendingNotification])

  useEffect(() => { setVisibleCount(24) }, [activeCategory, minPrice, maxPrice, filterDistrict, filterNeighborhood, filterRooms, minSize, maxSize, locationFilter, searchQuery, sortBy])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
        setVisibleCount(prev => Math.min(prev + 24, filteredProperties.length))
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [filteredProperties.length])

  const prevFilters = useRef('')
  useEffect(() => {
    const current = JSON.stringify({ activeCategory, minPrice, maxPrice, filterDistrict, filterNeighborhood, filterRooms, minSize, maxSize, locationFilter, searchQuery, sortBy })
    if (prevFilters.current && prevFilters.current !== current) {
      const timer = setTimeout(() => {
        recordSearch({
          query: searchQuery || `${activeCategory === 'Tümü' ? 'Tüm İlanlar' : activeCategory}`,
          filters: { category: activeCategory, minPrice, maxPrice, district: filterDistrict, neighborhood: filterNeighborhood, rooms: filterRooms, minSize, maxSize, locationFilter },
          resultCount: filteredProperties.length,
        })
      }, 800)
      prevFilters.current = current
      return () => clearTimeout(timer)
    }
    prevFilters.current = current
  }, [activeCategory, minPrice, maxPrice, filterDistrict, filterNeighborhood, filterRooms, minSize, maxSize, locationFilter, searchQuery, sortBy, filteredProperties.length])

  const handleChatSend = (text) => {
    const query = (text || chatInput).trim()
    if (!query || chatLoading) return
    const userMsg = { id: 'user-' + Date.now(), role: 'user', text: query }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)
    setTimeout(() => {
      const criteria = parseUserMessage(query)
      const results = findBestMatches(properties, criteria, 15)
      const response = generateResponse(criteria, results)
      setChatMessages(prev => [...prev, {
        id: 'asst-' + Date.now(), role: 'assistant',
        text: response.message, results: response.results, criteria,
      }])
      setChatLoading(false)
    }, 600)
  }

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend() }
  }

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
      {/* ═══ HERO ═══ */}
      <div className="px-4 sm:px-6 lg:px-8 mt-4 mb-3">
        <div className="rounded-3xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">FSBOAI</h2>
                  <p className="text-[11px] font-semibold text-white/50 -mt-0.5">
                    {runningCount > 0 ? `${runningCount} ajan çalışıyor` : 'Tüm ajanlar hazır'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNotificationEnabled(!notificationEnabled)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center btn transition-all ${notificationEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'}`}
                  title={notificationEnabled ? 'Bildirimleri Kapat' : 'Bildirimleri Aç'}
                >
                  {notificationEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                </button>
                <button
                  onClick={() => setShowWaLog(!showWaLog)}
                  className={`relative w-10 h-10 rounded-2xl flex items-center justify-center btn transition-all ${showWaLog ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  title="WhatsApp Mesaj Geçmişi"
                >
                  <MessageCircle size={18} />
                  {whatsappLog.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">{whatsappLog.length}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Agent Status Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { key: 'search', title: 'Arama', icon: Search, color: '#8b5cf6', badge: `${searchMemory.length} kayıt`, badgeColor: goodSearches.length > 0 ? '#059669' : '#9ca3af', badgeBg: goodSearches.length > 0 ? 'rgba(5,150,105,.15)' : 'rgba(255,255,255,.1)' },
                { key: 'notification', title: 'Bildirim', icon: Bell, color: '#3b82f6', badge: notificationEnabled ? 'Açık' : 'Kapalı', badgeColor: notificationEnabled ? '#059669' : '#dc2626', badgeBg: notificationEnabled ? 'rgba(5,150,105,.15)' : 'rgba(220,38,38,.15)' },
                { key: 'background', title: 'Arka Plan', icon: Clock, color: '#d97706', badge: runningCount > 0 ? `${runningCount} aktif` : 'Boşta', badgeColor: runningCount > 0 ? '#60a5fa' : '#9ca3af', badgeBg: runningCount > 0 ? 'rgba(96,165,250,.15)' : 'rgba(255,255,255,.1)' },
                { key: 'whatsapp', title: 'WhatsApp', icon: MessageCircle, color: '#25D366', badge: `${whatsappLog.length} mesaj`, badgeColor: '#9ca3af', badgeBg: 'rgba(255,255,255,.1)' },
              ].map(agent => {
                const Icon = agent.icon
                return (
                  <div key={agent.key} className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 flex-shrink-0 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: agent.color + '25' }}>
                      <Icon size={13} style={{ color: agent.color }} />
                    </div>
                    <span className="text-[10px] font-bold text-white/70 whitespace-nowrap">{agent.title}</span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold whitespace-nowrap" style={{ background: agent.badgeBg, color: agent.badgeColor }}>{agent.badge}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TAB NAVIGATION ═══ */}
      <div className="px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex gap-1 bg-white rounded-2xl border border-cardBorder p-1.5 shadow-sm">
          {MAIN_TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeSection === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveSection(tab.id); if (tab.id === 'chat') setSelectedTool(null) }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive ? 'bg-deep text-white shadow-md' : 'text-gray-400 hover:text-deep hover:bg-cream'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">

        {/* ────── KEŞFET TAB ────── */}
        {activeSection === 'kesfet' && (
          <div className="animate-fade-up">
            {/* Search Bar */}
            <div className="mb-4">
              {!isSearchOpen ? (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white border border-cardBorder shadow-sm btn hover:shadow-md transition-all"
                  style={{ color: '#1e1b2e' }}
                >
                  <Search size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-400">Emlak, şehir veya ilan no ile ara...</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-white border border-cardBorder rounded-2xl px-4 py-2 shadow-sm">
                  <Search size={18} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Emlak, şehir veya ilan no ile ara..."
                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-deep placeholder:text-gray-400" autoFocus
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-deep btn p-1"><X size={16} /></button>
                  )}
                  <button
                    className="px-5 py-2 rounded-xl text-xs font-extrabold shadow-lg btn whitespace-nowrap"
                    style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
                    onClick={() => {
                      recordSearch({
                        query: searchQuery, filters: { category: activeCategory, minPrice, maxPrice, district: filterDistrict, neighborhood: filterNeighborhood, rooms: filterRooms, minSize, maxSize },
                        resultCount: filteredProperties.length,
                      })
                      setIsSearchOpen(false)
                    }}
                  >Ara</button>
                </div>
              )}
            </div>

            {/* Category Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mb-4">
              {categories.map(cat => (
                <button
                  key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    activeCategory === cat ? 'text-white shadow-md' : 'bg-white border border-cardBorder text-deep/60 hover:bg-cream'
                  }`}
                  style={activeCategory === cat ? { background: CAT_COLORS[cat] || '#1e1b2e' } : {}}
                >{cat}</button>
              ))}
            </div>

            {/* Sort + Filter Bar */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <List size={12} /><span>{filteredProperties.length} İlan</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn transition-all ${showFilters || hasActiveFilters ? 'bg-deep text-white' : 'bg-white border border-cardBorder text-deep/60'}`}
                >
                  <SlidersHorizontal size={12} />Filtrele
                </button>
                <div className="relative">
                  <button className="text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl btn bg-white border border-cardBorder" style={{ color: '#1e1b2e' }} onClick={() => setShowSortMenu(!showSortMenu)}>
                    <ArrowUpDown size={12} />{SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sırala'}
                  </button>
                  {showSortMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-cardBorder shadow-lg z-20 py-1 min-w-[160px] animate-slide-up">
                      {SORT_OPTIONS.map(opt => (
                        <button key={opt.value} className={`w-full text-left px-4 py-2 text-xs font-bold btn hover:bg-cream ${sortBy === opt.value ? 'text-deep' : 'text-gray-400'}`} onClick={() => { setSortBy(opt.value); setShowSortMenu(false) }}>{opt.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-white rounded-2xl border border-cardBorder p-4 mb-4 animate-slide-up">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>Detaylı Filtreleme</span>
                  <button onClick={clearFilters} className="text-[10px] font-bold px-3 py-1 rounded-lg border border-cardBorder btn" style={{ color: '#1e1b2e' }}>Tümünü Temizle</button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 mb-1 block">İlçe</label>
                      <select value={filterDistrict} onChange={(e) => { setFilterDistrict(e.target.value); setFilterNeighborhood('') }} className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none appearance-none cursor-pointer" style={{ color: '#1e1b2e' }}>
                        <option value="">Tüm İlçeler</option>
                        {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Semt / Mahalle</label>
                      <select value={filterNeighborhood} onChange={(e) => setFilterNeighborhood(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none appearance-none cursor-pointer" style={{ color: '#1e1b2e' }} disabled={!filterDistrict}>
                        <option value="">Tüm Semtler</option>
                        {neighborhoodOptions.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Oda Sayısı</label>
                      <select value={filterRooms} onChange={(e) => setFilterRooms(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none appearance-none cursor-pointer" style={{ color: '#1e1b2e' }}>
                        <option value="">Tümü</option>
                        {roomOptions.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Semt Ara</label>
                      <input type="text" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} placeholder="Metin ile ara..." className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none" style={{ color: '#1e1b2e' }} />
                    </div>
                  </div>
                  <div className="w-full h-px" style={{ background: '#f0ece6' }} />
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Min. Fiyat (₺)</label>
                      <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none" style={{ color: '#1e1b2e' }} />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Maks. Fiyat (₺)</label>
                      <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="999.999.999" className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none" style={{ color: '#1e1b2e' }} />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Min. m²</label>
                      <input type="number" value={minSize} onChange={(e) => setMinSize(e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none" style={{ color: '#1e1b2e' }} />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Maks. m²</label>
                      <input type="number" value={maxSize} onChange={(e) => setMaxSize(e.target.value)} placeholder="999" className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none" style={{ color: '#1e1b2e' }} />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Kategori</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {categories.map(cat => (
                          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${activeCategory === cat ? 'text-white' : 'bg-cream text-deep/60'}`} style={activeCategory === cat ? { background: CAT_COLORS[cat] } : {}}>{cat}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Filter Tags */}
            {hasActiveFilters && !showFilters && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {activeCategory !== 'Tümü' && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1" style={{ background: CAT_COLORS[activeCategory] + '20', color: CAT_COLORS[activeCategory] }}>
                    {activeCategory}<button onClick={() => setActiveCategory('Tümü')} className="ml-0.5"><X size={10} /></button>
                  </span>
                )}
                {filterDistrict && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1" style={{ background: 'rgba(227,209,13,.15)', color: '#1e1b2e' }}>
                    <MapPin size={10} />{filterDistrict}<button onClick={() => setFilterDistrict('')} className="ml-0.5"><X size={10} /></button>
                  </span>
                )}
                {filterNeighborhood && <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>{filterNeighborhood}<button onClick={() => setFilterNeighborhood('')} className="ml-1"><X size={10} /></button></span>}
                {filterRooms && <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>{filterRooms}<button onClick={() => setFilterRooms('')} className="ml-1"><X size={10} /></button></span>}
                {minPrice && <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>Min: ₺{parseInt(minPrice).toLocaleString()}<button onClick={() => setMinPrice('')} className="ml-1"><X size={10} /></button></span>}
                {maxPrice && <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>Maks: ₺{parseInt(maxPrice).toLocaleString()}<button onClick={() => setMaxPrice('')} className="ml-1"><X size={10} /></button></span>}
                {minSize && <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>Min: {minSize} m²<button onClick={() => setMinSize('')} className="ml-1"><X size={10} /></button></span>}
                {maxSize && <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>Maks: {maxSize} m²<button onClick={() => setMaxSize('')} className="ml-1"><X size={10} /></button></span>}
                {locationFilter && <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>{locationFilter}<button onClick={() => setLocationFilter('')} className="ml-1"><X size={10} /></button></span>}
                {searchQuery && <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>&ldquo;{searchQuery}&rdquo;<button onClick={() => setSearchQuery('')} className="ml-1"><X size={10} /></button></span>}
              </div>
            )}

            {/* Property Cards */}
            {filteredProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cream flex items-center justify-center mb-4"><Search size={24} className="text-gray-400" /></div>
                <p className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>İlan bulunamadı</p>
                <p className="text-xs font-medium text-gray-400 mt-1">Filtreleri değiştirerek tekrar deneyin.</p>
                <button onClick={clearFilters} className="mt-4 px-5 py-2 rounded-xl text-xs font-bold btn" style={{ background: '#e3d10d', color: '#1e1b2e' }}>Filtreleri Temizle</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProperties.slice(0, visibleCount).map((prop, i) => (
                    <div key={prop.id} className="listing-card bg-white rounded-2xl border border-cardBorder overflow-hidden shadow-sm opacity-0" style={{ animation: `fadeInUp .4s ease-out ${i * 0.04}s forwards` }}>
                      <div className="card-img relative h-48 sm:h-52 overflow-hidden bg-gray-100 rounded-t-2xl">
                        <img src={prop.img} alt={prop.title} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          {prop.badge && <span className="tag px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 backdrop-blur-sm" style={{ color: '#1e1b2e' }}>{prop.badge}</span>}
                        </div>
                        <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm" aria-label="Listeye ekle" onClick={(e) => { e.stopPropagation(); setShowSheet(showSheet === prop.id ? null : prop.id) }}>
                          <FolderPlus size={15} className="text-gray-500" />
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="text-sm font-extrabold leading-snug" style={{ color: '#1e1b2e' }}>{prop.title}</h3>
                          <span className="text-xs font-black whitespace-nowrap" style={{ color: '#1e1b2e' }}>{prop.priceText || prop.price}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-2.5">
                          <MapPin size={12} /><span>{prop.location}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{prop.sizeText || prop.size}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 rounded-xl text-[10px] font-extrabold shadow-sm flex items-center justify-center gap-1 btn" style={{ background: 'rgba(227,209,13,.15)', color: '#1e1b2e' }} onClick={(e) => { e.stopPropagation(); setShowSheet(showSheet === prop.id ? null : prop.id) }}>
                            <FolderPlus size={12} />Listeye Ekle
                          </button>
                          <button className="flex-1 py-2 rounded-xl text-[10px] font-extrabold border border-cardBorder btn flex items-center justify-center gap-1" style={{ color: '#1e1b2e' }} onClick={(e) => { e.stopPropagation(); navigate(`/ilan/${prop.id}`) }}>
                            <Eye size={12} />Detay
                          </button>
                        </div>
                        {showSheet === prop.id && (
                          <div className="mt-2 pt-2 border-t border-cardBorder animate-slide-up">
                            <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Listeye ekle:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.values(lists).map(list => {
                                const inList = list.items.includes(prop.id)
                                return (
                                  <button key={list.id} className="px-2.5 py-1 rounded-lg text-[10px] font-bold btn whitespace-nowrap" style={{ background: inList ? '#e3d10d' : 'rgba(227,209,13,.1)', color: '#1e1b2e' }} onClick={(e) => { e.stopPropagation(); addToList(list.id, prop.id); addToast(`"${prop.title}" "${list.name}" listesine eklendi`); setShowSheet(null) }}>
                                    {list.name}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {visibleCount < filteredProperties.length && (
                  <div className="flex justify-center mt-8">
                    <button className="px-8 py-3 rounded-2xl text-sm font-extrabold shadow-lg btn flex items-center gap-2" style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }} onClick={() => setVisibleCount(prev => Math.min(prev + 24, filteredProperties.length))}>
                      <RefreshCw size={14} strokeWidth={2.5} />Daha Fazla İlan
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ────── AI CHAT TAB ────── */}
        {activeSection === 'chat' && (
          <div className="animate-fade-up max-w-2xl mx-auto">
            {chatMessages.length === 1 && chatMessages[0].id === 'welcome' ? (
              <div>
                <div className="bg-white rounded-2xl border border-cardBorder p-6 shadow-sm text-center mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md" style={{ background: '#1e1b2e' }}>
                    <Home size={24} className="text-white" />
                  </div>
                  <h3 className="text-base font-extrabold mb-1" style={{ color: '#1e1b2e' }}>Hayalindeki evi bul</h3>
                  <p className="text-xs font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Kriterlerini yaz, AI sana en uygun ilanları sıralasın. Ne kadar detaylı yazarsan o kadar doğru eşleşme buluruz.
                  </p>
                </div>
                <p className="text-[10px] font-semibold text-gray-400 mb-2.5 text-center">Hızlı başlangıç için birini seç:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { icon: Search, label: '3+1 kiralık, İstanbul' },
                    { icon: Sparkles, label: 'Fiber internetli ev' },
                    { icon: Home, label: "Ankara'da 2+1 satılık" },
                    { icon: Star, label: 'Havuzlu site içinde' },
                  ].map((s, i) => {
                    const Icon = s.icon
                    return (
                      <button key={i} onClick={() => { setChatInput(s.label); handleChatSend(s.label) }} className="flex items-center gap-2 px-3.5 py-3 rounded-xl text-[11px] font-bold btn bg-white border border-cardBorder hover:bg-cream transition-all shadow-sm" style={{ color: '#1e1b2e' }}>
                        <Icon size={14} className="text-gray-400 shrink-0" /><span className="truncate">{s.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chatMessages.map(msg => (
                  <div key={msg.id}>
                    {msg.role === 'assistant' ? (
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: '#1e1b2e' }}>
                          <Bot size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                          {msg.text && (
                            <div className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm">
                              <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap" style={{ color: '#1e1b2e' }}>{msg.text}</p>
                            </div>
                          )}
                          {msg.results?.length > 0 && (
                            <div className="space-y-2">
                              {msg.results.map((result, i) => {
                                const p = result.property
                                if (!p) return null
                                const isExpanded = expandedChatId === p.id
                                const matchPct = result.matchPercent
                                const stars = Math.min(5, Math.max(1, Math.round(matchPct / 20)))
                                return (
                                  <div key={p.id} style={{ animation: `fadeInUp .35s ease-out ${i * 0.04}s forwards` }} className="opacity-0">
                                    <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm btn transition-all ${isExpanded ? 'border-accent/40 ring-1 ring-accent/20' : 'border-cardBorder hover:shadow-md'}`} onClick={() => setExpandedChatId(isExpanded ? null : p.id)}>
                                      <div className="flex gap-3 p-3">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                                          <img src={p.img || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60'} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h3 className="text-xs font-extrabold leading-snug line-clamp-2 mb-1" style={{ color: '#1e1b2e' }}>{p.title}</h3>
                                          <p className="text-[10px] font-medium text-gray-400 flex items-center gap-1"><MapPin size={9} />{p.location}</p>
                                          <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold">
                                            <span style={{ color: '#1e1b2e' }}>{p.rooms || '?'}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-gray-500">{p.size}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="font-extrabold" style={{ color: '#059669' }}>{p.priceText || p.price}</span>
                                          </div>
                                          <div className="flex items-center justify-between mt-1.5">
                                            <div className="flex items-center gap-1.5">
                                              <div className="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-500" style={{ width: matchPct + '%', background: matchPct >= 80 ? '#059669' : matchPct >= 60 ? '#3b82f6' : matchPct >= 30 ? '#d97706' : '#dc2626' }} />
                                              </div>
                                              <span className="text-[9px] font-bold" style={{ color: matchPct >= 80 ? '#059669' : matchPct >= 60 ? '#3b82f6' : matchPct >= 30 ? '#d97706' : '#dc2626' }}>%{matchPct}</span>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                              {[1, 2, 3, 4, 5].map(si => (
                                                <Star key={si} size={9} className={si <= stars ? 'fill-current' : 'text-gray-200'} style={{ color: si <= stars ? '#e3d10d' : undefined }} />
                                              ))}
                                            </div>
                                          </div>
                                          {result.reasons?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                              {result.reasons.slice(0, 2).map((r, ri) => (
                                                <span key={ri} className="px-1.5 py-0.5 rounded text-[7px] font-bold" style={{ background: '#f0ece6', color: '#1e1b2e' }}>{r}</span>
                                              ))}
                                              {result.reasons.length > 2 && <span className="text-[7px] font-medium text-gray-400">+{result.reasons.length - 2}</span>}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {isExpanded && (
                                        <div className="border-t border-cardBorder">
                                          <div className="px-3 py-3 text-xs space-y-2" style={{ background: '#faf7f2' }}>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                                              <span>{p.rooms || '-'}</span><span>{p.size}</span>
                                              <span className="font-bold" style={{ color: '#059669' }}>{p.priceText || p.price}</span>
                                              <span>{p.location}</span>
                                            </div>
                                            {p.description && <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">{p.description}</p>}
                                            <div className="flex items-center gap-3 pt-1">
                                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white border border-cardBorder">%{matchPct} eşleşme</span>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 justify-end">
                        <div className="bg-deep rounded-2xl px-4 py-3 shadow-sm max-w-[75%]">
                          <p className="text-sm font-medium text-white whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 bg-cream border border-cardBorder">
                          <span className="text-[10px] font-extrabold" style={{ color: '#1e1b2e' }}>S</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: '#1e1b2e' }}><Bot size={16} className="text-white" /></div>
                    <div className="bg-white rounded-2xl border border-cardBorder px-5 py-4 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-deep animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-deep animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-deep animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Chat Input */}
            <div className="mt-4">
              <div className="flex items-center gap-2 bg-white rounded-2xl border border-cardBorder shadow-sm px-4 py-1.5">
                <Search size={16} className="text-gray-400 shrink-0" />
                <input
                  ref={chatInputRef} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleChatKeyDown}
                  placeholder="Şehir, oda sayısı, bütçe, özellikler..."
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium py-2.5"
                  style={{ color: '#1e1b2e' }} disabled={chatLoading}
                />
                <button
                  onClick={() => handleChatSend()}
                  disabled={!chatInput.trim() || chatLoading}
                  className="w-9 h-9 rounded-xl flex items-center justify-center btn transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: !chatInput.trim() || chatLoading ? '#e5e7eb' : '#1e1b2e' }}
                >
                  <Send size={14} className={!chatInput.trim() || chatLoading ? 'text-gray-400' : 'text-white'} />
                </button>
              </div>
              <p className="text-[9px] font-medium text-gray-400 mt-1.5 text-center">
                Örnek: &ldquo;İstanbul Beşiktaş&apos;ta 3+1 kiralık, bütçem 25.000 TL, fiber internetli&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* ────── AI ARAÇLAR TAB ────── */}
        {activeSection === 'araclar' && (
          <div className="animate-fade-up">
            {selectedTool ? (
              <div>
                <button onClick={() => setSelectedTool(null)} className="flex items-center gap-2 text-xs font-bold btn mb-4" style={{ color: '#1e1b2e' }}>
                  <ArrowLeft size={16} />Tüm Araçlar
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
                      <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1e1b2e' }}><CheckCircle size={16} style={{ color: selectedTool.color }} />Özellikler</h3>
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
                      <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1e1b2e' }}><Zap size={16} style={{ color: selectedTool.color }} />Nasıl Çalışır?</h3>
                      <div className="space-y-3">
                        {selectedTool.howItWorks.map((step, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0" style={{ background: selectedTool.color }}>{i + 1}</div>
                            <span className="text-xs font-semibold text-gray-500 pt-1">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-cardBorder p-4">
                      <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1e1b2e' }}><Clock size={16} style={{ color: selectedTool.color }} />Örnek Çalışmalar</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTool.samples.map((s, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-xl text-[11px] font-bold btn" style={{ background: selectedTool.color + '12', color: selectedTool.color }}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-cardBorder p-4">
                      <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1e1b2e' }}><Shield size={16} style={{ color: selectedTool.color }} />Neden Biz?</h3>
                      <p className="text-xs font-semibold text-gray-500 leading-relaxed">En son yapay zeka teknolojileri ile çalışıyor, size en kaliteli sonuçları en hızlı şekilde sunuyoruz. Profesyonel ekibimiz her adımda size destek oluyor.</p>
                      <button className="w-full mt-3 py-3 rounded-xl text-xs font-extrabold shadow-lg btn" style={{ background: selectedTool.color, color: '#fff', boxShadow: `0 8px 24px ${selectedTool.color}40` }}>Hemen Başla</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {TOOL_CATEGORIES.map((cat, i) => {
                  const Icon = cat.icon
                  return (
                    <button key={cat.id} onClick={() => setSelectedTool(TOOL_DETAILS[cat.id])} className="bg-white rounded-2xl border border-cardBorder overflow-hidden shadow-sm text-left w-full opacity-0 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" style={{ animation: `fadeInUp .4s ease-out ${i * 0.06}s forwards` }}>
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
                            <span key={j} className="px-2 py-0.5 rounded-lg text-[9px] font-bold" style={{ background: cat.color + '15', color: cat.color }}>{ex}</span>
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

        {/* ────── GEÇMİŞ TAB ────── */}
        {activeSection === 'gecmis' && (
          <div className="animate-fade-up space-y-8">
            {/* Search History */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-yellow-400" />
                <h3 className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>Arama Geçmişi</h3>
                {goodSearches.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold" style={{ background: '#e3d10d20', color: '#1e1b2e' }}>{goodSearches.length} başarılı</span>
                )}
              </div>
              {searchMemory.length === 0 ? (
                <div className="bg-white rounded-2xl border border-cardBorder p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center mx-auto mb-3"><Search size={22} className="text-gray-300" /></div>
                  <p className="text-sm font-bold" style={{ color: '#1e1b2e' }}>Henüz arama kaydı yok</p>
                  <p className="text-xs text-gray-400 mt-1">Keşfet sayfasından arama yapınca burada görünecek</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchMemory.map(search => (
                    <div key={search.id} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold truncate" style={{ color: '#1e1b2e' }}>{search.query || 'Filtre araması'}</p>
                          <p className="text-[11px] font-medium text-gray-400">{search.resultCount} sonuç · {formatTime(search.timestamp)}</p>
                        </div>
                        <StarRating value={search.rating} onChange={(r) => rateSearch(search.id, r)} size={14} />
                      </div>
                      <div className="flex items-center gap-2">
                        {search.rating >= 3 && (
                          <>
                            <button onClick={() => sendToBackground({ label: `Arama: ${search.query || 'Kriterler'}`, type: 'search', data: { query: search.query, filters: search.filters } })} className="px-3 py-1.5 rounded-xl text-[10px] font-bold btn flex items-center gap-1 border border-cardBorder hover:bg-cream transition-all" style={{ color: '#1e1b2e' }}>
                              <Play size={11} />Meşgule At
                            </button>
                            <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-green-50 text-green-600">{search.rating}/5 ★ Başarılı</span>
                          </>
                        )}
                        {search.rating > 0 && search.rating < 3 && <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-cream text-gray-400">{search.rating}/5</span>}
                        {search.rating === 0 && <span className="text-[10px] font-medium text-gray-400">Henüz puanlanmamış</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Background Tasks */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-orange-400" />
                <h3 className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>İşlemler</h3>
                {runningCount > 0 && <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-500 text-white">{runningCount} aktif</span>}
              </div>
              {backgroundTasks.length === 0 ? (
                <div className="bg-white rounded-2xl border border-cardBorder p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center mx-auto mb-3"><Clock size={22} className="text-gray-300" /></div>
                  <p className="text-sm font-bold" style={{ color: '#1e1b2e' }}>Aktif işlem yok</p>
                  <p className="text-xs text-gray-400 mt-1">Başarılı aramaları meşgule atıp takip edebilirsiniz</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {backgroundTasks.map(task => (
                    <div key={task.id} className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: task.status === 'running' ? 'rgba(59,130,246,.1)' : 'rgba(5,150,105,.1)' }}>
                        {getTaskIcon(task)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: '#1e1b2e' }}>{task.label}</p>
                        <p className="text-[10px] font-medium text-gray-400">{task.status === 'running' ? 'Çalışıyor...' : 'Tamamlandı'} · {formatTime(task.startedAt)}</p>
                      </div>
                      {task.status === 'completed' && (
                        <button onClick={() => removeBackgroundTask(task.id)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 btn transition-all">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Agent Cards */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #8b5cf6, #3b82f6)' }} />
                <h3 className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>FSBOAI Ajanları</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {[
                  { key: 'search', title: 'Arama Asistanı', desc: 'Keşfet sayfasındaki aramalarını takip eder, başarılı aramaları hatırlar.', icon: Search, color: '#8b5cf6', bgLight: 'rgba(139,92,246,.08)', stat: { value: searchMemory.length, label: 'arama' }, badge: goodSearches.length > 0 ? { text: `${goodSearches.length} başarılı`, color: '#059669', bg: '#d1fae5' } : null, status: searchMemory.length > 0 ? 'active' : 'idle' },
                  { key: 'notification', title: 'Bildirim Asistanı', desc: 'Başarılı aramaları tespit eder, bildirim pop-up\'ı gösterir.', icon: Bell, color: '#3b82f6', bgLight: 'rgba(59,130,246,.08)', stat: null, badge: notificationEnabled ? { text: 'Açık', color: '#059669', bg: '#d1fae5' } : { text: 'Kapalı', color: '#dc2626', bg: '#fde8e8' }, status: notificationEnabled ? 'active' : 'idle', toggle: true },
                  { key: 'background', title: 'Arka Plan Asistanı', desc: 'Aramaları arka planda çalıştırır, tamamlanınca bildirir.', icon: Clock, color: '#d97706', bgLight: 'rgba(245,158,11,.08)', stat: { value: backgroundTasks.length, label: 'işlem' }, badge: runningCount > 0 ? { text: `${runningCount} aktif`, color: '#2563eb', bg: '#dbeafe' } : { text: 'Boşta', color: '#9ca3af', bg: '#f3f4f6' }, status: runningCount > 0 ? 'running' : 'idle' },
                  { key: 'whatsapp', title: 'WhatsApp Asistanı', desc: 'Seçilen aksiyona göre WhatsApp mesajı hazırlar (test modu).', icon: MessageCircle, color: '#25D366', bgLight: 'rgba(37,211,102,.08)', stat: { value: whatsappLog.length, label: 'mesaj' }, badge: { text: 'Test', color: '#9ca3af', bg: '#f3f4f6' }, status: 'idle' },
                  { key: 'ev-bulucu', title: 'Ev Bulucu (Chat)', desc: 'Doğal dille ev araması yapar, ihtiyaçlarınıza en uygun mülkleri bulur.', icon: Home, color: '#059669', bgLight: 'rgba(5,150,105,.08)', stat: null, badge: { text: 'Chat', color: '#059669', bg: '#d1fae5' }, status: 'new' },
                ].map((agent, i) => {
                  const Icon = agent.icon
                  return (
                    <div key={agent.key} className="group bg-white rounded-2xl border border-cardBorder overflow-hidden shadow-sm text-left w-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-transparent opacity-0" style={{ animation: `fadeInUp .4s ease-out ${i * 0.06}s forwards` }}>
                      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${agent.color}, ${agent.color}80)` }} />
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: agent.bgLight }}>
                            <Icon size={18} style={{ color: agent.color }} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: agent.status === 'active' || agent.status === 'running' ? agent.color : agent.status === 'new' ? '#059669' : '#d1d5db' }} />
                            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: agent.status === 'active' || agent.status === 'running' ? agent.color : agent.status === 'new' ? '#059669' : '#9ca3af' }}>
                              {agent.status === 'active' ? 'Aktif' : agent.status === 'running' ? 'Çalışıyor' : agent.status === 'new' ? 'Yeni' : 'Hazır'}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-sm font-extrabold mb-1" style={{ color: '#1e1b2e' }}>{agent.title}</h3>
                        <p className="text-[11px] font-medium text-gray-400 leading-relaxed mb-3">{agent.desc}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          {agent.stat && <span className="text-[10px] font-semibold text-gray-400">{agent.stat.value} {agent.stat.label}</span>}
                          {agent.badge && <span className="px-2 py-0.5 rounded-md text-[9px] font-bold" style={{ background: agent.badge.bg, color: agent.badge.color }}>{agent.badge.text}</span>}
                          {agent.toggle && (
                            <button onClick={(e) => { e.stopPropagation(); setNotificationEnabled(!notificationEnabled) }} className={`relative w-9 h-5 rounded-full transition-all btn ${notificationEnabled ? '' : 'bg-gray-200'}`} style={notificationEnabled ? { background: agent.color } : {}}>
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${notificationEnabled ? 'left-[18px]' : 'left-0.5'}`} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ NOTIFICATION POPUP ═══ */}
      {pendingNotification && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-modal-fade" onClick={dismissNotification} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-auto p-6 animate-scale-in">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}><Bot size={20} className="text-white" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>FSBOAI Bildirimi</h3>
                <p className="text-[10px] font-medium text-gray-400 mt-0.5">{formatTime(pendingNotification.timestamp)}</p>
              </div>
              <button onClick={dismissNotification} className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center shrink-0"><X size={16} className="text-gray-500" /></button>
            </div>
            <div className="mb-5">
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#1e1b2e' }}>
                Merhaba, ben FSBOAI asistanınız. <span className="font-extrabold">&ldquo;{pendingNotification.query}&rdquo;</span> aramanızla ilgili <span className="font-extrabold">{pendingNotification.resultCount} adet</span> uygun ilan bulduk. Ne yapmak istersiniz?
              </p>
            </div>
            <div className="space-y-2">
              {ACTION_OPTIONS.map(opt => {
                const Icon = opt.icon
                return (
                  <button key={opt.id} onClick={() => handleAction(opt.id)} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-cardBorder hover:bg-cream btn transition-all text-left">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: opt.color + '18' }}><Icon size={16} style={{ color: opt.color }} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{opt.label}</p>
                      <p className="text-[10px] font-medium text-gray-400">{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            <button onClick={() => handleAction('nothing')} className="w-full mt-3 py-3 rounded-2xl text-xs font-bold btn border border-cardBorder hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all" style={{ color: '#1e1b2e' }}>
              <Ban size={14} className="mr-1.5" />Hiçbir şey yapma
            </button>
          </div>
        </div>
      )}

      {/* ═══ WHATSAPP LOG DRAWER ═══ */}
      {showWaLog && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowWaLog(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-[420px] bg-white shadow-2xl animate-drawer-in-right flex flex-col">
            <div className="shrink-0 px-5 py-4 border-b border-cardBorder flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center gap-2" style={{ color: '#1e1b2e' }}>
                <MessageCircle size={16} style={{ color: '#25D366' }} />WhatsApp Mesaj Geçmişi
              </h3>
              <button onClick={() => setShowWaLog(false)} className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center"><X size={16} className="text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {whatsappLog.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center mx-auto mb-3"><MessageCircle size={22} className="text-gray-300" /></div>
                  <p className="text-sm font-bold" style={{ color: '#1e1b2e' }}>Henüz mesaj gönderilmedi</p>
                  <p className="text-xs text-gray-400 mt-1">Bildirim aksiyonları burada görünecek</p>
                </div>
              ) : (
                <div className="divide-y divide-cardBorder">
                  {whatsappLog.map(entry => (
                    <div key={entry.id} className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#25D36618' }}><MessageCircle size={13} style={{ color: '#25D366' }} /></div>
                        <div>
                          <p className="text-[11px] font-extrabold" style={{ color: '#1e1b2e' }}>{entry.action}</p>
                          <p className="text-[9px] font-medium text-gray-400">{formatTime(entry.timestamp)} · {entry.searchQuery}</p>
                        </div>
                      </div>
                      <div className="bg-cream rounded-2xl p-3 text-[11px] font-medium leading-relaxed whitespace-pre-wrap" style={{ color: '#1e1b2e' }}>{entry.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {whatsappLog.length > 0 && (
              <div className="shrink-0 px-5 py-3 border-t border-cardBorder">
                <p className="text-[9px] font-medium text-gray-400 text-center">* Test modu: Gerçek WhatsApp mesajı gönderilmez</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ MOBILE NOTIFICATION DRAWER ═══ */}
      {showMobileNotif && pendingNotification && (
        <div className="fixed inset-0 z-[65] flex items-end sm:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { dismissNotification(); setShowMobileNotif(false) }} />
          <div className="relative w-full bg-white rounded-t-3xl shadow-2xl p-5 pb-8 animate-slide-up">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}><Bot size={20} className="text-white" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>FSBOAI Bildirimi</h3>
                <p className="text-[10px] font-medium text-gray-400">{formatTime(pendingNotification.timestamp)}</p>
              </div>
              <button onClick={() => { dismissNotification(); setShowMobileNotif(false) }} className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center"><X size={16} className="text-gray-500" /></button>
            </div>
            <p className="text-sm font-medium leading-relaxed mb-4" style={{ color: '#1e1b2e' }}>
              Merhaba, ben FSBOAI asistanınız. <span className="font-extrabold">&ldquo;{pendingNotification.query}&rdquo;</span> aramanızla ilgili <span className="font-extrabold">{pendingNotification.resultCount} adet</span> uygun ilan bulduk. Ne yapmak istersiniz?
            </p>
            <div className="space-y-2 mb-3">
              {ACTION_OPTIONS.map(opt => {
                const Icon = opt.icon
                return (
                  <button key={opt.id} onClick={() => handleAction(opt.id)} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-cardBorder hover:bg-cream btn transition-all text-left">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: opt.color + '18' }}><Icon size={16} style={{ color: opt.color }} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{opt.label}</p>
                      <p className="text-[9px] font-medium text-gray-400">{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            <button onClick={() => handleAction('nothing')} className="w-full py-3 rounded-2xl text-xs font-bold btn border border-cardBorder hover:bg-red-50 hover:text-red-500 transition-all" style={{ color: '#1e1b2e' }}>
              Hiçbir şey yapma
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
