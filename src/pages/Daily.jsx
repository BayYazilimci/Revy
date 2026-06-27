import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useDragScroll } from '../hooks'
import { useNavigate } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import { usePropertyData } from '../context/PropertiesContext'
import { CATEGORIES } from '../config'
import { getAllPriceRatings } from '../utils/priceRating'
import { MapPin, Clock, Sun, ChevronDown, Eye, Search, X, RotateCcw, SlidersHorizontal, TrendingDown, TrendingUp, Minus } from 'lucide-react'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''
const KAGITHANE_CENTER = [28.968, 41.077]
const ZONES = ['Kağıthane, İstanbul']

const CATEGORY_OPTIONS = CATEGORIES
const STATUS_OPTIONS = ['Tümü', 'Aktif', 'Pasif', 'Satıldı', 'Kiralık']

const STATUS_FILTER_COLORS = {
  'Tümü': '#1e1b2e',
  'Aktif': '#059669',
  'Pasif': '#dc2626',
  'Satıldı': '#6b7280',
  'Kiralık': '#3b82f6',
}

mapboxgl.accessToken = MAPBOX_TOKEN

export default function Daily() {
  const navigate = useNavigate()
  const mapContainer = useRef(null)
  const map = useRef(null)
  const { dailyProperties, allProperties: allPropertiesData } = usePropertyData()
  const [activeZone] = useState(ZONES[0])
  const [selectedId, setSelectedId] = useState(null)
  const properties = dailyProperties
  const markersRef = useRef([])

  // Emsal fiyat karşılaştırma rating'lerini hesapla
  const priceRatings = useMemo(() => getAllPriceRatings(allPropertiesData), [allPropertiesData])
  const [mapLoaded, setMapLoaded] = useState(false)

  const [showFilters, setShowFilters] = useState(false)

  const { containerRef: scrollRef, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave, handleTouchStart, handleTouchMove, handleTouchEnd, wasDragged } = useDragScroll()

  const [filters, setFilters] = useState({
    category: 'Tümü',
    status: 'Tümü',
    search: '',
    dateStart: '',
    dateEnd: '',
  })

  const hasActiveFilters = filters.category !== 'Tümü' || filters.status !== 'Tümü' || filters.search || filters.dateStart || filters.dateEnd

  const activeFilterCount = [filters.category !== 'Tümü', filters.status !== 'Tümü', !!filters.search, !!filters.dateStart || !!filters.dateEnd].filter(Boolean).length

  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      if (filters.category !== 'Tümü' && prop.type !== filters.category) return false
      if (filters.status !== 'Tümü' && prop.status !== filters.status) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!prop.title.toLowerCase().includes(q) &&
            !prop.location.toLowerCase().includes(q) &&
            !prop.price.toLowerCase().includes(q) &&
            !(prop.badge || '').toLowerCase().includes(q)) return false
      }
      if (filters.dateStart && prop.createdAt) {
        const pd = new Date(prop.createdAt)
        const sd = new Date(filters.dateStart)
        sd.setHours(0, 0, 0, 0)
        if (pd < sd) return false
      }
      if (filters.dateEnd && prop.createdAt) {
        const pd = new Date(prop.createdAt)
        const ed = new Date(filters.dateEnd)
        ed.setHours(23, 59, 59, 999)
        if (pd > ed) return false
      }
      return true
    })
  }, [properties, filters])

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ category: 'Tümü', status: 'Tümü', search: '', dateStart: '', dateEnd: '' })
  }, [])

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: KAGITHANE_CENTER,
      zoom: 14,
      pitch: 55,
      bearing: 20,
      attributionControl: false,
    })

    map.current.on('load', () => {
      document.querySelectorAll('.mapboxgl-ctrl-attrib,.mapboxgl-ctrl-logo,.mapboxgl-ctrl-bottom-left,.mapboxgl-ctrl-bottom-right,.mapbox-improve-map').forEach(el => el.remove())

      map.current.setFog({})
      map.current.setLight({
        anchor: 'viewport',
        color: '#fff',
        position: [1, 90, 80],
      })

      setMapLoaded(true)
    })

    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      map.current?.remove()
      map.current = null
      setMapLoaded(false)
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded || !map.current) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    filteredProperties.forEach(prop => {
      if (!prop.coords) return
      const el = document.createElement('div')
      el.className = 'daily-marker'
      el.dataset.id = prop.id

      const rating = priceRatings[prop.id]

      const badgeHtml = prop.badge
        ? `<span class="daily-tooltip-badge">${prop.badge}</span>`
        : ''

      // Rating badge HTML for tooltip
      const ratingBadgeHtml = rating && rating.rating !== 'neutral'
        ? `<div class="daily-tooltip-rating" style="background:${rating.bgColor};border:1px solid ${rating.borderColor}">
             <span class="daily-tooltip-rating-dot" style="background:${rating.color}"></span>
             <span style="color:${rating.color};font-weight:800;font-size:10px">${rating.label}</span>
             <span style="color:rgba(255,255,255,.5);font-size:9px;font-weight:600">${rating.emoji} %${rating.percentage}</span>
           </div>`
        : ''

      const metaItems = [
        prop.size ? `<span class="daily-tooltip-meta-item"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>${prop.size}</span>` : '',
        prop.rooms ? `<span class="daily-tooltip-meta-item"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>${prop.rooms}</span>` : '',
        prop.floor ? `<span class="daily-tooltip-meta-item"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>${prop.floor}</span>` : '',
      ].filter(Boolean).join('')

      // Marker dot rengi rating'e göre değişir
      const markerDotColor = rating && rating.rating !== 'neutral' ? rating.color : '#e3d10d'

      el.innerHTML = `
        <div class="daily-marker-inner">
          <div class="daily-marker-dot" style="background:${markerDotColor}"></div>
          <div class="daily-marker-label">${prop.price}</div>
        </div>
        <div class="daily-marker-tooltip">
          <div class="daily-tooltip-img-wrap">
            ${badgeHtml}
            <img class="daily-tooltip-img" src="${prop.img}" alt="${prop.title}" loading="lazy" />
          </div>
          <div class="daily-tooltip-body">
            <div class="daily-tooltip-title">${prop.title}</div>
            <div class="daily-tooltip-price">${prop.price}</div>
            ${ratingBadgeHtml}
            <div class="daily-tooltip-meta">${metaItems}</div>
            <button class="daily-tooltip-cta" data-nav="/ilan/${prop.id}">İlanı Görüntüle →</button>
          </div>
        </div>`

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        const navBtn = e.target.closest('.daily-tooltip-cta')
        if (navBtn) {
          navigate(navBtn.dataset.nav)
          return
        }
        setSelectedId(prop.id)
      })
      el.addEventListener('mouseenter', () => setSelectedId(prop.id))

      // Navigate on tooltip CTA click
      const ctaBtn = el.querySelector('.daily-tooltip-cta')
      if (ctaBtn) {
        ctaBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          navigate(`/ilan/${prop.id}`)
        })
      }

      markersRef.current.push(
        new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(prop.coords)
          .addTo(map.current)
      )
    })
  }, [filteredProperties, mapLoaded, navigate])

  useEffect(() => {
    document.querySelectorAll('.daily-marker').forEach(el => {
      const inner = el.querySelector('.daily-marker-inner')
      if (inner) inner.classList.toggle('is-active', el.dataset.id === selectedId)
    })
  }, [selectedId])

  return (
    <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0 z-0" />

      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: 'linear-gradient(180deg, rgba(26,42,58,.65) 0%, rgba(26,42,58,.2) 25%, transparent 50%, rgba(26,42,58,.3) 100%)'
      }} />

      {/* Header */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-2 lg:py-5 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md" style={{ background: 'rgba(227,209,13,.2)', backdropFilter: 'blur(8px)' }}>
              <Sun size={17} style={{ color: '#e3d10d' }} />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-extrabold tracking-tight text-white drop-shadow-md">Günlük İlanlar</h1>
              <p className="text-[10px] font-semibold text-white/70">Son 24 saatte eklenen ilanlar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', color: '#fff' }}>
              <MapPin size={12} />
              <span>{activeZone}</span>
              <ChevronDown size={10} className="text-white/50" />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: 'rgba(227,209,13,.2)', backdropFilter: 'blur(8px)', color: '#e3d10d' }}>
              <Clock size={12} />
              <span>{filteredProperties.length} ilan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toggle Button */}
      {!showFilters && (
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-1 flex-shrink-0">
          <button
            onClick={() => setShowFilters(true)}
            className="backdrop-blur-xl rounded-2xl border px-3.5 py-2 text-xs font-bold flex items-center gap-2 transition-all duration-200 hover:brightness-110"
            style={{ background: hasActiveFilters ? 'rgba(227,209,13,.2)' : 'rgba(255,255,255,.1)', borderColor: hasActiveFilters ? 'rgba(227,209,13,.3)' : 'rgba(255,255,255,.15)', color: hasActiveFilters ? '#e3d10d' : 'rgba(255,255,255,.8)' }}
          >
            <SlidersHorizontal size={13} />
            Filtrele
            {hasActiveFilters && (
              <span className="px-1.5 py-0.5 rounded-lg text-[9px] font-bold" style={{ background: 'rgba(227,209,13,.3)', color: '#e3d10d' }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Filter Bar */}
      {showFilters && (
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-2 flex-shrink-0 animate-slide-down">
        <div className="backdrop-blur-xl rounded-2xl border p-2.5 sm:p-3" style={{ background: 'rgba(30,27,46,.8)', borderColor: 'rgba(255,255,255,.1)' }}>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
            {/* Search */}
            <div className="relative flex-shrink-0 min-w-[140px] sm:min-w-[180px]">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,.35)' }} />
              <input
                type="text"
                placeholder="İlan, konum veya fiyat ara..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl text-[11px] sm:text-xs font-medium border-none outline-none placeholder-white/30"
                style={{ background: 'rgba(255,255,255,.08)', color: '#fff' }}
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
              />
              {filters.search && (
                <button
                  onClick={() => updateFilter('search', '')}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X size={12} style={{ color: 'rgba(255,255,255,.4)' }} />
                </button>
              )}
            </div>

            <span className="w-px h-6 flex-shrink-0" style={{ background: 'rgba(255,255,255,.08)' }} />

            {/* Category pills */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {CATEGORY_OPTIONS.map(cat => (
                <button
                  key={cat}
                  onClick={() => updateFilter('category', cat)}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    filters.category === cat
                      ? 'text-white shadow-sm'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                  style={{
                    background: filters.category === cat ? 'rgba(227,209,13,.2)' : 'rgba(255,255,255,.06)',
                    color: filters.category === cat ? '#e3d10d' : 'rgba(255,255,255,.55)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="w-px h-6 flex-shrink-0" style={{ background: 'rgba(255,255,255,.08)' }} />

            {/* Status dropdown */}
            <select
              className="px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-semibold border-none outline-none cursor-pointer flex-shrink-0 appearance-none"
              style={{ background: 'rgba(255,255,255,.08)', color: filters.status !== 'Tümü' ? STATUS_FILTER_COLORS[filters.status] : 'rgba(255,255,255,.7)' }}
              value={filters.status}
              onChange={e => updateFilter('status', e.target.value)}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt} style={{ color: '#1e1b2e' }}>{opt === 'Tümü' ? 'Tüm Durumlar' : opt}</option>
              ))}
            </select>

            {/* Date range */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                type="date"
                className="px-2 py-1.5 rounded-xl text-[10px] sm:text-xs font-semibold border-none outline-none"
                style={{ background: 'rgba(255,255,255,.08)', color: '#fff', colorScheme: 'dark' }}
                value={filters.dateStart}
                onChange={e => updateFilter('dateStart', e.target.value)}
                title="Başlangıç tarihi"
              />
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,.3)' }}>-</span>
              <input
                type="date"
                className="px-2 py-1.5 rounded-xl text-[10px] sm:text-xs font-semibold border-none outline-none"
                style={{ background: 'rgba(255,255,255,.08)', color: '#fff', colorScheme: 'dark' }}
                value={filters.dateEnd}
                onChange={e => updateFilter('dateEnd', e.target.value)}
                title="Bitiş tarihi"
              />
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex-shrink-0 px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 hover:brightness-110"
                style={{ background: 'rgba(239,68,68,.15)', color: '#ef4444' }}
              >
                <RotateCcw size={11} className="inline mr-1 -mt-px" />
                Temizle
              </button>
            )}

            <span className="w-px h-6 flex-shrink-0" style={{ background: 'rgba(255,255,255,.08)' }} />

            <button
              onClick={() => setShowFilters(false)}
              className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 hover:brightness-110"
              style={{ background: 'rgba(255,255,255,.08)' }}
            >
              <X size={13} style={{ color: 'rgba(255,255,255,.5)' }} />
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Cards panel */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0 justify-end pointer-events-none">
        <div className="px-4 sm:px-6 lg:px-8 pb-[56px] lg:pb-3 pointer-events-auto">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[11px] font-semibold drop-shadow" style={{ color: 'rgba(255,255,255,.8)' }}>
              <span className="font-bold text-white">{filteredProperties.length}</span> ilan bulundu
            </p>
            {hasActiveFilters && filteredProperties.length === 0 && (
              <p className="text-[11px] font-semibold drop-shadow" style={{ color: 'rgba(255,255,255,.5)' }}>
                Filtrelere uygun ilan bulunamadı
              </p>
            )}
          </div>
          {filteredProperties.length > 0 ? (
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1 snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {filteredProperties.map((prop) => (
                <div
                  key={prop.id}
                  className={`snap-start flex-shrink-0 w-72 backdrop-blur-xl rounded-2xl border overflow-hidden shadow-xl transition-all duration-200 cursor-pointer ${
                    selectedId === prop.id
                      ? 'border-accent/70 ring-2 ring-accent/20'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  style={{ background: selectedId === prop.id ? 'rgba(30,27,46,.9)' : 'rgba(30,27,46,.7)' }}
                  onClick={() => { if (wasDragged()) return; setSelectedId(prop.id); navigate(`/ilan/${prop.id}`) }}
                  onMouseEnter={() => setSelectedId(prop.id)}
                  onMouseLeave={() => setSelectedId(null)}
                >
                  <div className="flex gap-3 p-3">
                    <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,.08)' }}>
                      <img src={prop.img} alt={prop.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Price rating */}
                      {(() => {
                        const rating = priceRatings[prop.id]
                        return (
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-extrabold leading-snug truncate text-white">{prop.title}</h3>
                            <span className="text-xs font-black whitespace-nowrap flex-shrink-0 text-white">
                              {prop.price}
                            </span>
                          </div>
                        )
                      })()}
                      <p className="text-[11px] font-medium truncate mt-0.5" style={{ color: 'rgba(255,255,255,.6)' }}>
                        <MapPin size={10} className="inline mr-0.5 -mt-px" />
                        {prop.location}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {prop.badge && (
                          <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold" style={{ background: 'rgba(227,209,13,.2)', color: '#e3d10d' }}>{prop.badge}</span>
                        )}
                        {/* Emsal fiyat göstergesi */}
                        {(() => {
                          const rating = priceRatings[prop.id]
                          if (!rating || rating.rating === 'neutral') return null
                          const Icon = rating.rating === 'good' ? TrendingDown : rating.rating === 'expensive' ? TrendingUp : Minus
                          return (
                            <span
                              className="px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 animate-fade"
                              style={{ background: rating.bgColor, color: rating.color, border: `1px solid ${rating.borderColor}` }}
                            >
                              <Icon size={9} />
                              {rating.label} %{rating.percentage}
                            </span>
                          )
                        })()}
                        <span className="text-[9px] font-semibold flex items-center gap-1" style={{ color: 'rgba(255,255,255,.5)' }}>
                          <Clock size={8} />
                          {prop.time}
                        </span>
                        <button
                          className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center btn flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,.1)' }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/ilan/${prop.id}`) }}
                        >
                          <Eye size={12} style={{ color: 'rgba(255,255,255,.6)' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-sm font-bold text-white/50">Filtrelere uygun ilan bulunamadı</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-bold"
                  style={{ background: 'rgba(227,209,13,.2)', color: '#e3d10d' }}
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
