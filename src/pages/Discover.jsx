import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import { propertyList, categories } from '../data/properties'
import { useApp } from '../context/AppContext'
import { useAiAssistant } from '../context/AiAssistantContext'
import { districts, districtBoundaries } from '../data/districts'
import {
  List, ArrowUpDown, MapPin, Eye, FolderPlus,
  RefreshCw, Search, X, SlidersHorizontal, MapIcon
} from 'lucide-react'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''
mapboxgl.accessToken = MAPBOX_TOKEN

export default function Discover() {
  const navigate = useNavigate()
  const { addToast, lists, addToList } = useApp()
  const { recordSearch } = useAiAssistant()
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
  const [showMap, setShowMap] = useState(false)
  const mapContainer = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [filterDistrict, setFilterDistrict] = useState('')
  const [filterNeighborhood, setFilterNeighborhood] = useState('')
  const [filterRooms, setFilterRooms] = useState('')
  const [minSize, setMinSize] = useState('')
  const [maxSize, setMaxSize] = useState('')
  const [visibleCount, setVisibleCount] = useState(24)

  const parsePrice = (str) => parseInt(str.replace(/[₺.]/g, ''))

  const sortOptions = [
    { label: 'Son eklenen', value: 'newest' },
    { label: 'Fiyat (Artan)', value: 'price_asc' },
    { label: 'Fiyat (Azalan)', value: 'price_desc' },
  ]

  const parseLocation = (loc) => {
    const parts = loc.split(', ').map(s => s.trim())
    return parts.length === 3
      ? { neighborhood: parts[0], district: parts[1], city: parts[2] }
      : { neighborhood: null, district: parts[0], city: parts[1] }
  }

  const districtOptions = useMemo(() => {
    const set = new Set()
    propertyList.forEach(p => set.add(parseLocation(p.location).district))
    return Array.from(set).sort()
  }, [])

  const neighborhoodOptions = useMemo(() => {
    const set = new Set()
    propertyList.forEach(p => {
      const parsed = parseLocation(p.location)
      if (!filterDistrict || parsed.district === filterDistrict) {
        if (parsed.neighborhood) set.add(parsed.neighborhood)
      }
    })
    return Array.from(set).sort()
  }, [filterDistrict])

  const roomOptions = useMemo(() => {
    const set = new Set()
    propertyList.forEach(p => set.add(p.rooms))
    return Array.from(set).sort()
  }, [])

  const mapDistrictId = useMemo(() => {
    if (!filterDistrict) return 'all'
    const found = districts.find(d => d.name === filterDistrict)
    return found ? found.id : 'all'
  }, [filterDistrict])

  const activeDist = districts.find(d => d.id === mapDistrictId) || districts[0]

  const filteredProperties = useMemo(() => {
    let result = propertyList.filter(prop => {
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

      if (filterDistrict) {
        if (parseLocation(prop.location).district !== filterDistrict) return false
      }

      if (filterNeighborhood) {
        if (parseLocation(prop.location).neighborhood !== filterNeighborhood) return false
      }

      if (filterRooms) {
        if (prop.rooms !== filterRooms) return false
      }

      if (minSize || maxSize) {
        const size = parseInt(prop.size.replace(/[^0-9]/g, ''))
        if (minSize && size < parseInt(minSize)) return false
        if (maxSize && size > parseInt(maxSize)) return false
      }

      if (locationFilter) {
        if (!prop.location.toLowerCase().includes(locationFilter.toLowerCase())) return false
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const inTitle = prop.title.toLowerCase().includes(q)
        const inLocation = prop.location.toLowerCase().includes(q)
        const inDesc = prop.desc.toLowerCase().includes(q)
        if (!inTitle && !inLocation && !inDesc) return false
      }

      return true
    })

    if (sortBy === 'price_asc') {
      result = [...result].sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
    } else if (sortBy === 'price_desc') {
      result = [...result].sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
    }

    return result
  }, [activeCategory, minPrice, maxPrice, filterDistrict, filterNeighborhood, filterRooms, minSize, maxSize, locationFilter, searchQuery, sortBy])

  const clearFilters = () => {
    setActiveCategory('Tümü')
    setMinPrice('')
    setMaxPrice('')
    setFilterDistrict('')
    setFilterNeighborhood('')
    setFilterRooms('')
    setMinSize('')
    setMaxSize('')
    setLocationFilter('')
    setSearchQuery('')
    setSortBy('newest')
  }

  const hasActiveFilters = activeCategory !== 'Tümü' || minPrice || maxPrice || filterDistrict || filterNeighborhood || filterRooms || minSize || maxSize || locationFilter || searchQuery || sortBy !== 'newest'

  // Reset visible items count when filters change
  useEffect(() => {
    setVisibleCount(24)
  }, [activeCategory, minPrice, maxPrice, filterDistrict, filterNeighborhood, filterRooms, minSize, maxSize, locationFilter, searchQuery, sortBy])

  // Lazy load more items as user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 300
      ) {
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
  }, [activeCategory, minPrice, maxPrice, filterDistrict, filterNeighborhood, filterRooms, minSize, maxSize, locationFilter, searchQuery, sortBy, recordSearch, filteredProperties.length])

  useEffect(() => {
    if (!showMap || !mapContainer.current) return

    if (!mapInstance.current) {
      mapInstance.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: activeDist.center,
        zoom: activeDist.zoom,
        attributionControl: false,
      })

      mapInstance.current.on('load', () => {
        mapInstance.current.setFog({})
        document.querySelectorAll('.mapboxgl-ctrl-attrib,.mapboxgl-ctrl-logo,.mapboxgl-ctrl-bottom-left,.mapboxgl-ctrl-bottom-right,.mapbox-improve-map').forEach(el => el.remove())

        mapInstance.current.addSource('districts', {
          type: 'geojson',
          data: districtBoundaries,
        })

        mapInstance.current.addLayer({
          id: 'district-fill',
          type: 'fill',
          source: 'districts',
          paint: {
            'fill-color': '#e3d10d',
            'fill-opacity': 0.08,
          },
        })

        mapInstance.current.addLayer({
          id: 'district-outline',
          type: 'line',
          source: 'districts',
          paint: {
            'line-color': '#e3d10d',
            'line-width': 3,
            'line-opacity': 0.9,
          },
        })

        setMapLoaded(true)
      })
    }

    const updateBounds = () => {
      if (!mapInstance.current || !mapLoaded) return
      mapInstance.current.flyTo({ center: activeDist.center, zoom: activeDist.zoom, duration: 800 })

      if (mapDistrictId !== 'all') {
        mapInstance.current.setFilter('district-fill', ['==', ['get', 'id'], mapDistrictId])
        mapInstance.current.setFilter('district-outline', ['==', ['get', 'id'], mapDistrictId])
      } else {
        mapInstance.current.setFilter('district-fill', ['has', 'id'])
        mapInstance.current.setFilter('district-outline', ['has', 'id'])
      }
    }

    if (mapLoaded) updateBounds()

    return () => {
      if (!showMap) {
        mapInstance.current?.remove()
        mapInstance.current = null
        setMapLoaded(false)
      }
    }
  }, [showMap, mapDistrictId, mapLoaded, activeDist])

  // Add/update property markers on the map
  useEffect(() => {
    if (!showMap || !mapLoaded || !mapInstance.current) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    filteredProperties.forEach(prop => {
      if (!prop.coords) return
      const el = document.createElement('div')
      el.className = 'explore-marker'
      el.innerHTML = `<div class="explore-marker-inner"><div class="explore-marker-dot"></div><div class="explore-marker-label">${prop.price}</div></div>`
      el.addEventListener('click', () => navigate(`/ilan/${prop.id}`))
      const marker = new mapboxgl.Marker({ element: el }).setLngLat(prop.coords).addTo(mapInstance.current)
      markersRef.current.push(marker)
    })

    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
    }
  }, [showMap, mapLoaded, filteredProperties, navigate])

  // Double-click map to toggle fullscreen
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current) return
    const handleDblClick = () => setIsFullscreen(prev => !prev)
    mapInstance.current.on('dblclick', handleDblClick)
    return () => { mapInstance.current?.off('dblclick', handleDblClick) }
  }, [mapLoaded])

  // Resize map after fullscreen transition completes
  useEffect(() => {
    if (!mapInstance.current) return
    mapInstance.current.resize()
    const timer = setTimeout(() => mapInstance.current?.resize(), 250)
    return () => clearTimeout(timer)
  }, [isFullscreen])

  // Escape key to exit fullscreen
  useEffect(() => {
    if (!isFullscreen) return
    const handleKey = (e) => { if (e.key === 'Escape') setIsFullscreen(false) }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isFullscreen])

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isFullscreen])

  const catColors = {
    'Tümü': '#1e1b2e',
    'Satılık': '#059669',
    'Kiralık': '#3b82f6',
    'Villa': '#8b5cf6',
    'Daire': '#dc2626'
  }

  return (
    <div className="flex flex-col min-h-0">
      <div className="px-4 sm:px-6 lg:px-8 mt-4 mb-2">
        <div className="relative animate-fade-up" style={{ animationDelay: '.08s' }}>
          {!isSearchOpen ? (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white border-2 border-cardBorder shadow-sm btn"
              style={{ color: '#1e1b2e' }}
            >
              <Search size={18} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-400">Emlak, şehir veya ilan no ile ara...</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-white border-2 border-cardBorder rounded-2xl px-4 py-2 shadow-sm">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Emlak, şehir veya ilan no ile ara..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-deep placeholder:text-gray-400"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-deep btn p-1"
                >
                  <X size={16} />
                </button>
              )}
              <button
                className="px-5 py-2 rounded-xl text-xs font-extrabold shadow-lg btn whitespace-nowrap"
                style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
                onClick={() => {
                  recordSearch({
                    query: searchQuery,
                    filters: {
                      category: activeCategory,
                      minPrice,
                      maxPrice,
                      district: filterDistrict,
                      neighborhood: filterNeighborhood,
                      rooms: filterRooms,
                      minSize,
                      maxSize,
                    },
                    resultCount: filteredProperties.length,
                  })
                  setIsSearchOpen(false)
                }}
              >
                Ara
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mt-6 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none animate-fade-up" style={{ animationDelay: '.12s' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                activeCategory === cat ? 'text-white shadow-md' : 'bg-white border border-cardBorder text-deep/60 hover:bg-cream'
              }`}
              style={activeCategory === cat ? { background: catColors[cat] || '#1e1b2e' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <List size={12} />
            <span>{filteredProperties.length} İlan</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn transition-all ${
                showFilters || hasActiveFilters ? 'bg-deep text-white' : 'bg-transparent'
              }`}
              style={{ color: showFilters || hasActiveFilters ? '#fff' : '#1e1b2e' }}
            >
              <SlidersHorizontal size={12} />
              Filtrele
            </button>
            <div className="relative">
              <button
                className="text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl btn"
                style={{ color: '#1e1b2e' }}
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <ArrowUpDown size={12} />
                {sortOptions.find(o => o.value === sortBy)?.label || 'Sırala'}
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-cardBorder shadow-lg z-20 py-1 min-w-[160px] animate-slide-up">
                  {sortOptions.map(opt => (
                    <button
                      key={opt.value}
                      className={`w-full text-left px-4 py-2 text-xs font-bold btn hover:bg-cream ${
                        sortBy === opt.value ? 'text-deep' : 'text-gray-400'
                      }`}
                      style={sortBy === opt.value ? { color: '#1e1b2e' } : {}}
                      onClick={() => { setSortBy(opt.value); setShowSortMenu(false) }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl border border-cardBorder p-4 mb-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>Detaylı Filtreleme</span>
              <button
                onClick={clearFilters}
                className="text-[10px] font-bold px-3 py-1 rounded-lg border border-cardBorder btn"
                style={{ color: '#1e1b2e' }}
              >
                Tümünü Temizle
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 mb-1 block">İlçe</label>
                  <select
                    value={filterDistrict}
                    onChange={(e) => { setFilterDistrict(e.target.value); setFilterNeighborhood('') }}
                    className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none appearance-none cursor-pointer"
                    style={{ color: '#1e1b2e' }}
                  >
                    <option value="">Tüm İlçeler</option>
                    {districtOptions.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Semt / Mahalle</label>
                  <select
                    value={filterNeighborhood}
                    onChange={(e) => setFilterNeighborhood(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none appearance-none cursor-pointer"
                    style={{ color: '#1e1b2e' }}
                    disabled={!filterDistrict}
                  >
                    <option value="">Tüm Semtler</option>
                    {neighborhoodOptions.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Oda Sayısı</label>
                  <select
                    value={filterRooms}
                    onChange={(e) => setFilterRooms(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none appearance-none cursor-pointer"
                    style={{ color: '#1e1b2e' }}
                  >
                    <option value="">Tümü</option>
                    {roomOptions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Semt Ara</label>
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="Metin ile ara..."
                    className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none"
                    style={{ color: '#1e1b2e' }}
                  />
                </div>
              </div>
              <div className="w-full h-px" style={{ background: '#f0ece6' }} />
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Min. Fiyat (₺)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none"
                    style={{ color: '#1e1b2e' }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Maks. Fiyat (₺)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="999.999.999"
                    className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none"
                    style={{ color: '#1e1b2e' }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Min. m²</label>
                  <input
                    type="number"
                    value={minSize}
                    onChange={(e) => setMinSize(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none"
                    style={{ color: '#1e1b2e' }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Maks. m²</label>
                  <input
                    type="number"
                    value={maxSize}
                    onChange={(e) => setMaxSize(e.target.value)}
                    placeholder="999"
                    className="w-full px-3 py-2 rounded-xl border border-cardBorder text-xs font-medium outline-none"
                    style={{ color: '#1e1b2e' }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Kategori</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${
                          activeCategory === cat ? 'text-white' : 'bg-cream text-deep/60'
                        }`}
                        style={activeCategory === cat ? { background: catColors[cat] } : {}}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {activeCategory !== 'Tümü' && (
              <span
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1"
                style={{ background: catColors[activeCategory] + '20', color: catColors[activeCategory] }}
              >
                {activeCategory}
                <button onClick={() => setActiveCategory('Tümü')} className="ml-0.5"><X size={10} /></button>
              </span>
            )}
            {filterDistrict && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1"
                style={{ background: 'rgba(227,209,13,.15)', color: '#1e1b2e' }}>
                <MapPin size={10} />
                {filterDistrict}
                <button onClick={() => setFilterDistrict('')} className="ml-0.5"><X size={10} /></button>
              </span>
            )}
            {filterNeighborhood && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>
                {filterNeighborhood}
                <button onClick={() => setFilterNeighborhood('')} className="ml-1"><X size={10} /></button>
              </span>
            )}
            {filterRooms && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>
                {filterRooms}
                <button onClick={() => setFilterRooms('')} className="ml-1"><X size={10} /></button>
              </span>
            )}
            {minPrice && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>
                Min: ₺{parseInt(minPrice).toLocaleString()}
                <button onClick={() => setMinPrice('')} className="ml-1"><X size={10} /></button>
              </span>
            )}
            {maxPrice && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>
                Maks: ₺{parseInt(maxPrice).toLocaleString()}
                <button onClick={() => setMaxPrice('')} className="ml-1"><X size={10} /></button>
              </span>
            )}
            {minSize && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>
                Min: {minSize} m²
                <button onClick={() => setMinSize('')} className="ml-1"><X size={10} /></button>
              </span>
            )}
            {maxSize && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>
                Maks: {maxSize} m²
                <button onClick={() => setMaxSize('')} className="ml-1"><X size={10} /></button>
              </span>
            )}
            {locationFilter && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>
                {locationFilter}
                <button onClick={() => setLocationFilter('')} className="ml-1"><X size={10} /></button>
              </span>
            )}
            {searchQuery && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cream" style={{ color: '#1e1b2e' }}>
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-1"><X size={10} /></button>
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold btn transition-all ${
              showMap ? 'bg-deep text-white' : 'border border-cardBorder'
            }`}
            style={{ color: showMap ? '#fff' : '#1e1b2e' }}
          >
            <MapIcon size={12} />
            {showMap ? 'Haritayı Gizle' : 'Haritada Gör'}
          </button>
          {filterDistrict && mapDistrictId !== 'all' && (
            <span className="text-[10px] font-semibold text-gray-400">
              {filterDistrict} sınırları haritada sarı çerçeve ile gösteriliyor
            </span>
          )}
        </div>

        {showMap && (
          <div
            className={`mb-6 overflow-hidden border border-cardBorder shadow-sm transition-all duration-200 ease-in-out ${
              isFullscreen
                ? 'fixed left-0 right-0 bottom-0 z-[15] rounded-none border-0 m-0'
                : 'relative rounded-2xl'
            }`}
            style={{
              height: isFullscreen ? 'calc(100vh - 64px)' : '380px',
              top: isFullscreen ? '64px' : 'auto',
            }}
          >
            {isFullscreen && (
              <button
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md btn"
                onClick={() => setIsFullscreen(false)}
                aria-label="Tam ekrandan çık"
              >
                <X size={16} />
              </button>
            )}
            <div ref={mapContainer} className="w-full h-full" />
          </div>
        )}

        {filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>İlan bulunamadı</p>
            <p className="text-xs font-medium text-gray-400 mt-1">Filtreleri değiştirerek tekrar deneyin.</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-5 py-2 rounded-xl text-xs font-bold btn"
              style={{ background: '#e3d10d', color: '#1e1b2e' }}
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProperties.slice(0, visibleCount).map((prop, i) => (
            <div
              key={prop.id}
              className="listing-card bg-white rounded-2xl border border-cardBorder overflow-hidden shadow-sm opacity-0"
              style={{ animation: `fadeInUp .4s ease-out ${i * 0.04}s forwards` }}
            >
              <div className="card-img relative h-48 sm:h-52 overflow-hidden bg-gray-100 rounded-t-2xl">
                <img src={prop.img} alt={prop.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {prop.badge && (
                    <span className="tag px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 backdrop-blur-sm" style={{ color: '#1e1b2e' }}>{prop.badge}</span>
                  )}
                </div>
                <button
                  className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
                  aria-label="Listeye ekle"
                  onClick={(e) => { e.stopPropagation(); setShowSheet(showSheet === prop.id ? null : prop.id) }}
                >
                  <FolderPlus size={15} className="text-gray-500" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-sm font-extrabold leading-snug" style={{ color: '#1e1b2e' }}>{prop.title}</h3>
                  <span className="text-xs font-black whitespace-nowrap" style={{ color: '#1e1b2e' }}>{prop.price}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-2.5">
                  <MapPin size={12} />
                  <span>{prop.location}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{prop.size}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-2 rounded-xl text-[10px] font-extrabold shadow-sm flex items-center justify-center gap-1 btn"
                    style={{ background: 'rgba(227,209,13,.15)', color: '#1e1b2e' }}
                    onClick={(e) => { e.stopPropagation(); setShowSheet(showSheet === prop.id ? null : prop.id) }}
                  >
                    <FolderPlus size={12} />
                    Listeye Ekle
                  </button>
                  <button
                    className="flex-1 py-2 rounded-xl text-[10px] font-extrabold border border-cardBorder btn flex items-center justify-center gap-1"
                    style={{ color: '#1e1b2e' }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/ilan/${prop.id}`) }}
                  >
                    <Eye size={12} />
                    Detay
                  </button>
                </div>

                {showSheet === prop.id && (
                  <div className="mt-2 pt-2 border-t border-cardBorder animate-slide-up">
                    <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Listeye ekle:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.values(lists).map(list => {
                      const inList = list.items.includes(prop.id)
                      return (
                        <button
                          key={list.id}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold btn whitespace-nowrap"
                          style={{ background: inList ? '#e3d10d' : 'rgba(227,209,13,.1)', color: '#1e1b2e' }}
                          onClick={(e) => { e.stopPropagation(); addToList(list.id, prop.id); addToast(`"${prop.title}" "${list.name}" listesine eklendi`); setShowSheet(null) }}
                        >
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
            <button
              className="px-8 py-3 rounded-2xl text-sm font-extrabold shadow-lg btn flex items-center gap-2"
              style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
              onClick={() => setVisibleCount(prev => Math.min(prev + 24, filteredProperties.length))}
            >
              <RefreshCw size={14} strokeWidth={2.5} />
              Daha Fazla İlan
            </button>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}
