import { useState, useRef, useCallback } from 'react'
import { Loader2, MapPin, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { useNearbyPlaces, CATEGORIES } from '../hooks/useNearbyPlaces'
import { useDragScroll } from '../hooks/useDragScroll'

const ICONS = {
  transport: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 2c-4.42 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zm0 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-7H6V6h12v2z"/>
    </svg>
  ),
  school: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
    </svg>
  ),
  hospital: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
    </svg>
  ),
  market: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.1 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0023.47 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
  ),
  mall: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-4h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2h-2c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z"/>
    </svg>
  ),
  cafe: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/>
    </svg>
  ),
  entertainment: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
    </svg>
  ),
  culture: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 3L2 12h3v8h5v-5h4v5h5v-8h3L12 3zm0 12.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  ),
  sport: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
    </svg>
  ),
  mosque: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 2C10.34 2 9 3.34 9 5c0 1.1.6 2.05 1.5 2.57V9H6l-2 4h1v9h14v-9h1l-2-4h-4.5V7.57C14.4 7.05 15 6.1 15 5c0-1.66-1.34-3-3-3zm-3 11h6v7H9v-7z"/>
    </svg>
  ),
  park: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M17 12h-5V7h2l-4-5-4 5h2v5H3l4 5H5v2h14v-2h-2l4-5zm-7 5v-5h4l-2-2.5V7h-2v2.5L8 12h2v5z"/>
    </svg>
  ),
  residential: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zm-8 4H7v-2h2v2zm0-4H7V9h2v2zm0-4H7V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/>
    </svg>
  ),
}

const WalkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2"/>
    <path d="M10 22V18L7 15l1-5 4 2 4-4 3 3"/>
    <path d="m7 15 5-3"/>
  </svg>
)

const CarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
    <circle cx="7" cy="17" r="2"/>
    <path d="M9 17h6"/>
    <circle cx="17" cy="17" r="2"/>
  </svg>
)

function PlaceCard({ category, onPlaceSelect, selectedPlace }) {
  const { places, label, color, iconType } = category
  if (!places?.length) return null

  return (
    <div className="w-[280px] shrink-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white sm:w-[300px]">
      <div className="flex items-center gap-3 p-4 pb-0">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
          style={{ backgroundColor: color }}
        >
          {ICONS[iconType]}
        </div>
        <span className="min-w-0 flex-1 text-base font-semibold text-gray-900">{label}</span>
        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
          {places.length}
        </span>
      </div>
      <div className="overflow-y-auto px-4 pt-3 pb-4" style={{ maxHeight: 320 }}>
        {places.map((p, i) => {
          const isSelected = selectedPlace?.name === p.name && selectedPlace?.dist === p.dist
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPlaceSelect?.(p)}
              className={`w-full text-left py-3 border-b border-gray-100 last:border-0 last:pb-0 transition-colors ${
                isSelected ? 'bg-gray-50 -mx-2 px-2 rounded-lg' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`min-w-0 flex-1 text-sm leading-5 ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                  {p.name}
                </span>
                <span className="shrink-0 text-sm font-semibold text-gray-900">{p.distLabel}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <WalkIcon />
                  {p.walk} dk
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <CarIcon />
                  {p.car} dk
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function NearbyPlaces({ coords, onPlaceSelect, selectedPlace }) {
  const scrollRef = useRef(null)
  const { containerRef, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave, wasDragged, handleTouchStart, handleTouchMove, handleTouchEnd } = useDragScroll()
  const [activeFilters, setActiveFilters] = useState(new Set())
  const [retryKey, setRetryKey] = useState(0)
  const { data, loading, error, categories } = useNearbyPlaces(coords, retryKey)

  const handleRetry = useCallback(() => {
    setRetryKey(prev => prev + 1)
  }, [])

  if (!coords) return null

  const loaded = CATEGORIES.filter(c => data[c.key]?.places?.length > 0)
  const visible = loaded.filter(c => activeFilters.size === 0 || activeFilters.has(c.key))
  const hasErrors = CATEGORIES.some(c => data[c.key]?.error)

  const toggleFilter = (key) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const scroll = (dir) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  const setRefs = (el) => {
    scrollRef.current = el
    containerRef.current = el
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
          <MapPin size={16} className="text-yellow-500" />
          Çevredeki Yerler
        </h3>
        {!loading && loaded.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              {loaded.some(c => data[c.key]?.source === 'overpass') ? 'OpenStreetMap' : 'Mapbox'}
            </span>
            <button onClick={() => scroll(-1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronLeft size={14} className="text-gray-500" />
            </button>
            <button onClick={() => scroll(1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronRight size={14} className="text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-6 justify-center">
          <Loader2 size={16} className="animate-spin" />
          Yakın yerler yükleniyor...
        </div>
      )}

      {!loading && error && (
        <div className="text-sm text-red-400 py-4 flex flex-col items-center gap-2">
          <p>Veri yüklenemedi: {error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 underline"
          >
            <RefreshCw size={12} />
            Tekrar Dene
          </button>
        </div>
      )}

      {!loading && !error && loaded.length === 0 && (
        <div className="text-sm text-gray-400 py-4 flex flex-col items-center gap-2">
          <p>Bu konuma yakın yer bulunamadı.</p>
          {hasErrors && (
            <p className="text-xs text-gray-300">Bazı kategorilerde hata oluştu. Harita servisi ile bağlantı kurulamıyor olabilir.</p>
          )}
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-600 underline"
          >
            <RefreshCw size={12} />
            Tekrar Dene
          </button>
        </div>
      )}

      {!loading && loaded.length > 0 && (
        <>
          <div className="flex gap-2 flex-wrap mb-4">
            <button
              onClick={() => setActiveFilters(new Set())}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeFilters.size === 0
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              Tümü
            </button>
            {loaded.map(cat => (
              <button
                key={cat.key}
                onClick={() => toggleFilter(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeFilters.has(cat.key)
                    ? 'text-white border-transparent'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
                style={activeFilters.has(cat.key) ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
              >
                <span className="w-3.5 h-3.5 flex-shrink-0" style={{ color: activeFilters.has(cat.key) ? 'white' : cat.color }}>
                  {ICONS[cat.iconType]}
                </span>
                {cat.label}
              </button>
            ))}
          </div>

          <div
            ref={setRefs}
            className="flex touch-pan-y gap-4 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onMouseDown={(e) => { handleMouseDown(e) }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {visible.map(cat => (
              <PlaceCard key={cat.key} category={data[cat.key]} onPlaceSelect={(p) => { if (!wasDragged()) onPlaceSelect?.(p) }} selectedPlace={selectedPlace} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
