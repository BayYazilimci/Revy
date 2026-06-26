import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import { properties } from '../data/properties'
import { useApp } from '../context/AppContext'
import { useCustomers } from '../hooks/useCustomers'
import { useCustomerListings } from '../hooks/useCustomerListings'
import { MY_LISTINGS_ID } from '../data/lists'

import NearbyPlaces from '../components/NearbyPlaces'
import PriceAnalysis from '../components/PriceAnalysis'
import PresentationBuilder from '../components/PresentationBuilder'
import {
  ArrowLeft, FolderPlus, MapPin, Phone,
  MessageCircle, Shield, Map, SearchX,
  Layers, Maximize, MoveVertical, Calendar, CheckCircle,
  Star, PhoneCall, X, Loader2, FileText, Download,
  Bookmark, Heart, Clock, Tag, StickyNote,
  Trash2, ExternalLink, Home, User, UserPlus, Edit3, XCircle,
  Share2, ChevronLeft, ChevronRight, Camera, Square, Sun,
  AlignLeft, List, Navigation, Link, Eye, Building2, Bell
} from 'lucide-react'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''
mapboxgl.accessToken = MAPBOX_TOKEN

const stars = [1, 2, 3, 4, 5]

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromIlanlarim = searchParams.get('from') === 'portfoyum' || searchParams.get('from') === 'ilanlarim'
  const { isInMyListings, toggleMyListing, addToast, addToList, removeFromList, updateItemNote, getOrCreateList, lists } = useApp()

  const [calling, setCalling] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showListPicker, setShowListPicker] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showPdfSuccess, setShowPdfSuccess] = useState(false)
  const [pdfReady, setPdfReady] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const routeLayerAdded = useRef(false)

  const presentationRef = useRef(null)
  const mapContainer = useRef(null)
  const mapInstance = useRef(null)

  const prop = properties[id]

  const galleryImages = prop ? (
    prop.all_images && prop.all_images.length > 0
      ? prop.all_images.map((img, i) => ({ src: img, alt: `${prop.title} - Fotoğraf ${i + 1}` }))
      : [
          { src: prop.img, alt: prop.title },
          { src: prop.img, alt: prop.title + ' - Detay' },
          { src: prop.img, alt: prop.title + ' - İç Mekan' },
          { src: prop.img, alt: prop.title + ' - Mutfak' },
          { src: prop.img, alt: prop.title + ' - Banyo' },
        ]
  ) : []

  useEffect(() => {
    if (!prop?.coords || mapInstance.current || !mapContainer.current) return
    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: prop.coords,
      zoom: 15,
      attributionControl: false,
    })
    mapInstance.current.on('load', () => {
      new mapboxgl.Marker({ color: '#e3d10d' })
        .setLngLat(prop.coords)
        .addTo(mapInstance.current)
    })
    return () => {
      mapInstance.current?.remove()
      mapInstance.current = null
    }
  }, [prop])

  const handlePlaceSelect = (place) => {
    setSelectedPlace(prev => prev?.name === place.name && prev?.dist === place.dist ? null : place)
  }

  useEffect(() => {
    const map = mapInstance.current
    if (!map || !map.isStyleLoaded()) return
    const srcId = 'route'
    const layerId = 'route-line'
    if (map.getSource(srcId)) {
      map.removeLayer(layerId)
      map.removeSource(srcId)
    }
    if (!selectedPlace?.coords) return
    const origin = prop.coords
    const dest = selectedPlace.coords
    map.addSource(srcId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [origin, dest],
        },
      },
    })
    map.addLayer({
      id: layerId,
      type: 'line',
      source: srcId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#e3d10d',
        'line-width': 3,
        'line-opacity': 0.8,
        'line-dasharray': [0, 4, 3],
      },
    })
    let progress = 0
    const animate = () => {
      if (!map.getSource(srcId)) return
      progress += 0.02
      if (progress >= 1) {
        map.setPaintProperty(layerId, 'line-dasharray', [1, 0])
        return
      }
      const dashLen = 4 + (1 - progress) * 20
      map.setPaintProperty(layerId, 'line-dasharray', [dashLen * progress, dashLen * (1 - progress)])
      requestAnimationFrame(animate)
    }
    animate()
    map.flyTo({ center: [ (origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2 ], zoom: 13, duration: 800 })
  }, [selectedPlace, prop])

  useEffect(() => {
    if (showGalleryModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showGalleryModal])

  useEffect(() => {
    const handleKey = (e) => {
      if (!showGalleryModal) return
      if (e.key === 'Escape') setShowGalleryModal(false)
      if (e.key === 'ArrowLeft') goGallery(-1)
      if (e.key === 'ArrowRight') goGallery(1)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [showGalleryModal, currentImageIndex])

  const goGallery = (dir) => {
    setCurrentImageIndex(prev => (prev + dir + galleryImages.length) % galleryImages.length)
  }

  const openGalleryModal = (idx) => {
    setCurrentImageIndex(idx)
    setShowGalleryModal(true)
  }

  const handleCall = () => {
    setCalling(true)
    setTimeout(() => {
      setCalling(false)
      setRating(0)
      setNote('')
      setSubmitted(false)
      setShowRating(true)
    }, 2000)
  }

  const handleSubmitRating = () => {
    if (rating === 0) return
    setSubmitting(true)
    setTimeout(() => {
      if (rating >= 3) {
        const listId = getOrCreateList('Sonra Aranacaklar')
        addToList(listId, prop.id)
        addToast(`"${prop.title}" Sonra Aranacaklar listesine eklendi`)
      }
      setSubmitting(false)
      setSubmitted(true)
    }, 400)
  }

  const closeRating = () => {
    setShowRating(false)
    setRating(0)
    setHoverRating(0)
    setNote('')
    setSubmitted(false)
  }

  const generatePresentation = async () => {
    setGenerating(true)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ])
      const element = presentationRef.current
      if (!element) return
      const imgs = element.querySelectorAll('img')
      await Promise.all(Array.from(imgs).map(img =>
        img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r })
      ))
      const canvas = await html2canvas(element, {
        scale: 2, useCORS: true, logging: false,
        letterRendering: true, backgroundColor: '#ffffff'
      })
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF({ unit: 'in', format: 'a4', orientation: 'portrait' })
      const pw = pdf.internal.pageSize.getWidth()
      const ph = pdf.internal.pageSize.getHeight()
      const margin = 0.5
      const imgW = pw - margin * 2
      const imgH = (canvas.height / canvas.width) * imgW
      if (imgH <= ph - margin * 2) {
        pdf.addImage(imgData, 'JPEG', margin, margin, imgW, imgH)
      } else {
        const pageH = ph - margin * 2
        const ratio = canvas.width / imgW
        const pxPageH = pageH * ratio
        const totalPages = Math.ceil(canvas.height / pxPageH)
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) pdf.addPage()
          const sy = i * pxPageH
          const sh = Math.min(pxPageH, canvas.height - sy)
          const pageCanvas = document.createElement('canvas')
          pageCanvas.width = canvas.width
          pageCanvas.height = sh
          const ctx = pageCanvas.getContext('2d')
          ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh)
          const pageData = pageCanvas.toDataURL('image/jpeg', 0.95)
          pdf.addImage(pageData, 'JPEG', margin, margin, imgW, sh / ratio)
        }
      }
      const pdfBlob = pdf.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      setPdfReady(pdfUrl)
      setShowPdfSuccess(true)
      const a = document.createElement('a')
      a.href = pdfUrl
      a.download = `${prop.title} - Sunum.pdf`
      a.click()
    } catch {
      addToast('Sunum oluşturulurken hata oluştu.')
    } finally {
      setGenerating(false)
    }
  }

  const downloadPdf = () => {
    if (pdfReady) {
      const a = document.createElement('a')
      a.href = pdfReady
      a.download = `${prop.title} - Sunum.pdf`
      a.click()
    }
  }

  const closePdfSuccess = () => {
    setShowPdfSuccess(false)
    if (pdfReady) {
      URL.revokeObjectURL(pdfReady)
      setPdfReady(null)
    }
  }



  const shareListing = () => {
    if (navigator.share) {
      navigator.share({ title: prop.title, url: window.location.href })
    } else {
      navigator.clipboard?.writeText(window.location.href)
      addToast('Bağlantı kopyalandı')
    }
  }

  const shareAction = (type) => {
    const url = window.location.href
    if (type === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(prop.title + ' ' + url)}`, '_blank')
    } else if (type === 'mail') {
      window.open(`mailto:?subject=${encodeURIComponent(prop.title)}&body=${encodeURIComponent(url)}`, '_blank')
    } else if (type === 'copy') {
      navigator.clipboard?.writeText(url)
      addToast('Link kopyalandı')
    }
  }

  if (!prop) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm mx-auto mb-5">
            <SearchX size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-extrabold" style={{ color: '#1e1b2e' }}>İlan bulunamadı</h3>
          <p className="text-sm text-gray-400 font-medium mt-1">Aradığınız ilan mevcut değil.</p>
          <button
            className="btn mt-5 px-6 py-3 rounded-2xl text-sm font-extrabold"
            style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
            onClick={() => navigate('/')}
          >
            Keşfet'e Dön
          </button>
        </div>
      </div>
    )
  }

  if (fromIlanlarim) {
    return <IlanlarimDetailView prop={prop} />
  }

  return (
    <div className="flex flex-col min-h-0">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-5 lg:py-7">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs mb-4 text-gray-400 font-medium" aria-label="Breadcrumb">
          <button onClick={() => navigate('/')} className="hover:text-navy transition-colors duration-200 bg-transparent border-none cursor-pointer">Ana Sayfa</button>
          <ChevronRight size={12} className="text-gray-300" />
          <button onClick={() => navigate(-1)} className="hover:text-navy transition-colors duration-200 bg-transparent border-none cursor-pointer">İlanlar</button>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-navy font-semibold">{prop.title}</span>
        </nav>

        {/* GALLERY */}
        <section className="relative mb-6 animate-fade-up">
          <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-xl shadow-black/5">
            <div className="relative" style={{ paddingTop: '52%' }}>
              <img
                id="mainImage"
                src={galleryImages[currentImageIndex].src}
                alt={galleryImages[currentImageIndex].alt}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out"
              />
            </div>
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-navy shadow-sm">
                <Camera size={13} />
                {galleryImages.length} Fotoğraf
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange/90 backdrop-blur-sm text-xs font-bold text-white shadow-sm">
                {prop.status || 'Satılık'}
              </span>
            </div>
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 btn"
                aria-label="Listeye Ekle"
                onClick={() => setShowListPicker(!showListPicker)}
              >
                <FolderPlus size={18} className="text-gray-500" />
              </button>
              <button
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 btn"
                aria-label="Paylaş"
                onClick={shareListing}
              >
                <Share2 size={18} className="text-gray-500" />
              </button>
            </div>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/92 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 btn"
              aria-label="Önceki fotoğraf"
              onClick={() => goGallery(-1)}
            >
              <ChevronLeft size={20} className="text-navy" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/92 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 btn"
              aria-label="Sonraki fotoğraf"
              onClick={() => goGallery(1)}
            >
              <ChevronRight size={20} className="text-navy" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/40 backdrop-blur-sm rounded-full px-3.5 py-1.5">
              <span className="text-white text-xs font-bold">{currentImageIndex + 1} / {galleryImages.length}</span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                className={`flex-shrink-0 w-[72px] h-[52px] rounded-xl overflow-hidden shadow-sm transition-all duration-200 cursor-pointer border-2.5 ${
                  i === currentImageIndex
                    ? 'border-gold opacity-100 shadow-md'
                    : 'border-transparent opacity-70 hover:opacity-90 hover:border-gold/30'
                }`}
                style={{ borderWidth: i === currentImageIndex ? '2.5px' : '2.5px' }}
                onClick={() => setCurrentImageIndex(i)}
                aria-label={`Fotoğraf ${i + 1}`}
              >
                <img src={img.src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </section>

        {/* TWO COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* LEFT: Details */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Title, Location, Price */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl lg:text-2xl font-extrabold text-navy leading-tight tracking-tight">{prop.title}</h2>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-400 font-medium">
                      <MapPin size={14} />
                      {prop.location}
                    </span>
                    <span className="text-gray-200 text-xs">•</span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-400 font-medium">
                      <Clock size={14} />
                      {prop.time || 'Bugün'}
                    </span>
                    <span className="text-gray-200 text-xs">•</span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-400 font-medium">
                      <Eye size={14} />
                      284 görüntülenme
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-3xl lg:text-4xl font-extrabold text-orange tracking-tight">{prop.price}</p>
                  {prop.size && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {(() => {
                        const num = parseInt(prop.size)
                        return isNaN(num) ? '' : `₺${(parseInt(prop.price.replace(/[^0-9]/g, '')) / num).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} / m²`
                      })()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50 flex-wrap">
                {prop.rooms && (
                  <span className="bg-[#f1f5f9] text-[#475569] px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-[#e2e8f0] transition-all duration-200 hover:bg-white hover:border-gray-300">
                    <Maximize size={13} />{prop.rooms}
                  </span>
                )}
                {prop.size && (
                  <span className="bg-[#f1f5f9] text-[#475569] px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-[#e2e8f0] transition-all duration-200 hover:bg-white hover:border-gray-300">
                    <Square size={13} />{prop.size}
                  </span>
                )}
                {prop.floor && (
                  <span className="bg-[#f1f5f9] text-[#475569] px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-[#e2e8f0] transition-all duration-200 hover:bg-white hover:border-gray-300">
                    <Layers size={13} />{prop.floor}
                  </span>
                )}
                {prop.type && (
                  <span className="bg-[#f1f5f9] text-[#475569] px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-[#e2e8f0] transition-all duration-200 hover:bg-white hover:border-gray-300">
                    <Sun size={13} />{prop.type}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6 animate-fade-up">
              <h3 className="text-base font-extrabold text-navy mb-3 flex items-center gap-2">
                <AlignLeft size={16} className="text-gold" />
                Açıklama
              </h3>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>{prop.desc}</p>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6 animate-fade-up">
              <h3 className="text-base font-extrabold text-navy mb-4 flex items-center gap-2">
                <List size={16} className="text-gold" />
                Özellikler
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <div>
                  <div className="flex justify-between py-2.5 border-b border-[#f1f5f9] text-sm">
                    <span className="text-[#94a3b8] font-medium">Konut Tipi</span>
                    <span className="text-navy font-semibold text-right">{prop.subtype || prop.type || 'Daire'}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[#f1f5f9] text-sm">
                    <span className="text-[#94a3b8] font-medium">Oda Sayısı</span>
                    <span className="text-navy font-semibold text-right">{prop.rooms || '3+1'}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[#f1f5f9] text-sm">
                    <span className="text-[#94a3b8] font-medium">Metrekare (Net)</span>
                    <span className="text-navy font-semibold text-right">{prop.size || '120 m²'}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[#f1f5f9] text-sm">
                    <span className="text-[#94a3b8] font-medium">Metrekare (Brüt)</span>
                    <span className="text-navy font-semibold text-right">{prop.size ? parseInt(prop.size) + 25 + ' m²' : '145 m²'}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[#f1f5f9] text-sm">
                    <span className="text-[#94a3b8] font-medium">Bulunduğu Kat</span>
                    <span className="text-navy font-semibold text-right">{prop.floor || '2. Kat'}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[#f1f5f9] text-sm">
                    <span className="text-[#94a3b8] font-medium">Kat Sayısı</span>
                    <span className="text-navy font-semibold text-right">8 Kat</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[#f1f5f9] text-sm">
                    <span className="text-[#94a3b8] font-medium">Bina Yaşı</span>
                    <span className="text-navy font-semibold text-right">{prop.age || '5 Yıl'}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between py-2.5 border-b border-[#f1f5f9] text-sm">
                    <span className="text-[#94a3b8] font-medium">Isıtma</span>
                    <span className="text-navy font-semibold text-right">Doğalgaz Kombi</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[#f1f5f9] text-sm">
                    <span className="text-[#94a3b8] font-medium">Asansör</span>
                    <span className="text-navy font-semibold text-right">Var</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[#f1f5f9] text-sm">
                    <span className="text-[#94a3b8] font-medium">Otopark</span>
                    <span className="text-navy font-semibold text-right">Kapalı</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[#f1f5f9] text-sm">
                    <span className="text-[#94a3b8] font-medium">Aidat</span>
                    <span className="text-navy font-semibold text-right">350 TL</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[#f1f5f9] text-sm">
                    <span className="text-[#94a3b8] font-medium">Cephe</span>
                    <span className="text-navy font-semibold text-right">Güney</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[#f1f5f9] text-sm">
                    <span className="text-[#94a3b8] font-medium">Krediye Uygun</span>
                    <span className="text-navy font-semibold text-right">Evet</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[#f1f5f9] text-sm">
                    <span className="text-[#94a3b8] font-medium">Takas</span>
                    <span className="text-navy font-semibold text-right">Düşünülebilir</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6 animate-fade-up">
              <h3 className="text-base font-extrabold text-navy mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-gold" />
                Konum
              </h3>
              {prop.coords ? (
                <div className="relative rounded-xl overflow-hidden bg-gray-100 mb-3 shadow-inner" style={{ height: '200px' }}>
                  <div ref={mapContainer} className="w-full h-full" />
                  <div className="absolute bottom-3 right-3">
                    <button
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-xs font-bold text-navy shadow-sm hover:bg-white transition-all duration-200 btn"
                      onClick={() => addToast('Harita görüntüleniyor...')}
                    >
                      <ExternalLink size={13} />
                      Büyük Haritada Göster
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden bg-gray-100 mb-3 shadow-inner" style={{ height: '200px' }}>
                  <div className="absolute inset-0 bg-[#e8ecf1]" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #d0d8e0 0%, transparent 50%),radial-gradient(circle at 80% 70%, #c8d0d8 0%, transparent 40%),radial-gradient(circle at 50% 50%, #dce2e8 0%, transparent 60%)' }}>
                    <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,.12) 40px,rgba(255,255,255,.12) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,.12) 40px,rgba(255,255,255,.12) 41px)' }}></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-full bg-orange/90 flex items-center justify-center shadow-lg shadow-orange/20">
                        <MapPin size={22} className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-navy bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">{prop.location}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <button
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-xs font-bold text-navy shadow-sm hover:bg-white transition-all duration-200 btn"
                      onClick={() => addToast('Harita görüntüleniyor...')}
                    >
                      <ExternalLink size={13} />
                      Büyük Haritada Göster
                    </button>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                <MapPin size={14} className="text-orange" />
                {prop.location}
              </p>
              {prop.coords && (
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Navigation size={12} />Marmaray 400 m</span>
                  <span className="flex items-center gap-1"><Navigation size={12} />Metrobüs 600 m</span>
                  <span className="flex items-center gap-1"><Navigation size={12} />Hastane 1.2 km</span>
                </div>
              )}
            </div>

            {/* Price Analysis */}
            <PriceAnalysis prop={prop} />

            {/* Nearby Places */}
            <NearbyPlaces coords={prop.coords} onPlaceSelect={handlePlaceSelect} selectedPlace={selectedPlace} />

            {/* PDF Presentation Builder */}
            <PresentationBuilder prop={prop} />

          </div>

          {/* RIGHT: Seller Card */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-4">

              {/* Seller Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fade-up">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="https://i.pravatar.cc/100?img=11"
                    alt="Ahmet Yılmaz"
                    className="w-14 h-14 rounded-xl object-cover shadow-sm border border-gray-50"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-extrabold text-navy">Ahmet Yılmaz</h4>
                    <p className="text-xs text-gray-400 font-medium">Emlak Danışmanı</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Onaylı</span>
                      <span className="text-[10px] text-gray-400">• Üyelik: Mart 2020</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 text-center p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-base font-extrabold text-navy">%98</p>
                    <p className="text-[10px] text-gray-400 font-medium">Dönüş Oranı</p>
                  </div>
                  <div className="flex-1 text-center p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-base font-extrabold text-navy">15 dk</p>
                    <p className="text-[10px] text-gray-400 font-medium">Ortalama Süre</p>
                  </div>
                  <div className="flex-1 text-center p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-base font-extrabold text-navy">42</p>
                    <p className="text-[10px] text-gray-400 font-medium">Aktif İlan</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <button
                    className="w-full h-11 rounded-xl bg-navy text-white text-sm font-bold hover:bg-navy/90 transition-all duration-200 btn shadow-lg shadow-navy/15 flex items-center justify-center gap-2"
                    onClick={() => addToast('Mesajlaşma sayfası açılıyor...')}
                  >
                    <MessageCircle size={16} />
                    İlan Sahibine Mesaj Gönder
                  </button>
                  <button
                    className="w-full h-11 rounded-xl bg-white text-navy text-sm font-bold border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 btn flex items-center justify-center gap-2"
                    onClick={() => addToast('+90 (532) 123 45 67')}
                  >
                    <Phone size={16} className="text-green-600" />
                    Telefon Numarasını Göster
                  </button>
                </div>
              </div>

              {/* List Picker */}
              <div className="relative">
                <button
                  className="w-full h-10 rounded-xl bg-white border border-gray-100 shadow-sm text-xs font-bold text-gray-500 hover:text-navy transition-all duration-200 btn flex items-center justify-center gap-2"
                  onClick={() => setShowListPicker(!showListPicker)}
                >
                  <FolderPlus size={14} />
                  Listeye Ekle
                </button>
                {showListPicker && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-scale-in">
                    <p className="text-[10px] font-semibold text-gray-400 px-2 py-1">Listeye ekle:</p>
                    {Object.values(lists).map(list => {
                      const inList = list.items.includes(prop.id)
                      return (
                        <button
                          key={list.id}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold btn whitespace-nowrap transition-all"
                          style={{
                            background: inList ? list.color + '22' : 'transparent',
                            color: '#1e1b2e',
                            border: inList ? `1.5px solid ${list.color}` : '1.5px solid transparent'
                          }}
                          onClick={() => {
                            if (inList) {
                              removeFromList(list.id, prop.id)
                              addToast(`"${prop.title}" "${list.name}" listesinden çıkarıldı`)
                            } else {
                              addToList(list.id, prop.id)
                              addToast(`"${prop.title}" "${list.name}" listesine eklendi`)
                            }
                            setShowListPicker(false)
                          }}
                        >
                          <div className="w-3 h-3 rounded flex-shrink-0" style={{ background: list.color }} />
                          <span className="flex-1 text-left">{list.name}</span>
                          {inList && <CheckCircle size={12} style={{ color: list.color }} strokeWidth={3} />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Safety Tips */}
              <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 animate-fade-up">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Shield size={16} className="text-amber-700" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-amber-800 mb-1">Güvenli Alışveriş İpuçları</h5>
                    <ul className="text-[11px] text-amber-700 space-y-1 leading-relaxed">
                      <li>• İlan sahibiyle tanışmadan ödeme yapmayın.</li>
                      <li>• Platform üzerinden iletişime geçin.</li>
                      <li>• Tapu ve kimlik kontrollerini ihmal etmeyin.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-fade-up">
                <p className="text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wider">Bu İlanı Paylaş</p>
                <div className="flex gap-2">
                  <button
                    className="flex-1 h-9 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all duration-200 btn flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500"
                    onClick={() => shareAction('whatsapp')}
                  >
                    <MessageCircle size={14} className="text-green-500" />
                    WhatsApp
                  </button>
                  <button
                    className="flex-1 h-9 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all duration-200 btn flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500"
                    onClick={() => shareAction('mail')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    E-Posta
                  </button>
                  <button
                    className="flex-1 h-9 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all duration-200 btn flex items-center justify-center"
                    onClick={() => shareAction('copy')}
                    aria-label="Link kopyala"
                  >
                    <Link size={14} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3.5 rounded-2xl text-sm font-extrabold shadow-lg flex items-center justify-center gap-2"
                  style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
                  onClick={handleCall}
                >
                  {calling ? <Loader2 size={16} className="animate-spin" /> : <PhoneCall size={16} strokeWidth={2.5} />}
                  {calling ? 'Aranıyor...' : 'Ara'}
                </button>
                <button
                  className="flex-1 py-3.5 rounded-2xl text-sm font-extrabold border-2 border-gray-200 btn flex items-center justify-center gap-2"
                  style={{ color: '#1e1b2e' }}
                  onClick={() => addToast('Mesaj gönderiliyor...')}
                >
                  <MessageCircle size={16} />
                  Mesaj Gönder
                </button>
              </div>

            </div>
          </aside>
        </div>
      </div>

      {/* FULL-SCREEN GALLERY MODAL */}
      {showGalleryModal && (
        <div
          className="fixed inset-0 z-[70] bg-black/92 flex items-center justify-center animate-modal-overlay"
          onClick={() => setShowGalleryModal(false)}
        >
          <button
            className="absolute top-6 right-6 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all duration-200 btn backdrop-blur-sm"
            onClick={() => setShowGalleryModal(false)}
            aria-label="Galeriyi kapat"
          >
            <X size={22} className="text-white" />
          </button>
          <button
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all duration-200 btn backdrop-blur-sm"
            onClick={(e) => { e.stopPropagation(); goGallery(-1) }}
            aria-label="Önceki"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all duration-200 btn backdrop-blur-sm"
            onClick={(e) => { e.stopPropagation(); goGallery(1) }}
            aria-label="Sonraki"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-white text-sm font-bold">{currentImageIndex + 1} / {galleryImages.length}</span>
          </div>
          <img
            src={galleryImages[currentImageIndex].src}
            alt={galleryImages[currentImageIndex].alt}
            className="max-w-[90vw] max-h-[88vh] object-contain rounded-lg shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* HIDDEN PRESENTATION TEMPLATE */}
      <div ref={presentationRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px', background: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', overflow: 'hidden' }}>
        <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden' }}>
          <img src={prop.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 50%)' }} />
          <div style={{ position: 'absolute', top: '28px', right: '28px', background: '#e3d10d', color: '#1e1b2e', padding: '6px 18px', borderRadius: '8px', fontWeight: 800, fontSize: '13px', letterSpacing: '1px' }}>REVY</div>
          <div style={{ position: 'absolute', bottom: '32px', left: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>{prop.title}</h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,.75)', margin: '6px 0 0' }}>{prop.location}</p>
            <p style={{ fontSize: '28px', fontWeight: 900, color: '#e3d10d', margin: '10px 0 0' }}>{prop.price}</p>
          </div>
        </div>
        <div style={{ padding: '32px 36px 0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e1b2e', margin: '0 0 10px' }}>Açıklama</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{prop.desc}</p>
        </div>
        <div style={{ padding: '28px 36px 0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e1b2e', margin: '0 0 14px' }}>Özellikler</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Oda Sayısı', value: prop.rooms },
              { label: 'Metrekare', value: prop.size },
              { label: 'Kat', value: prop.floor },
              { label: 'Bina Yaşı', value: prop.age },
              { label: 'Durum', value: prop.status },
              { label: 'Konum', value: prop.location },
            ].map(f => (
              <div key={f.label} style={{ background: '#faf7f2', borderRadius: '10px', padding: '14px' }}>
                <p style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b2e', margin: 0 }}>{f.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '28px 36px 0' }}>
          <div style={{ background: '#faf7f2', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#e3d10d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: '#1e1b2e', flexShrink: 0 }}>A</div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 800, color: '#1e1b2e', margin: 0 }}>Ahmet Yılmaz</p>
              <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500, margin: '2px 0 0' }}>Emlak Danışmanı</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500, margin: 0 }}>0 (532) 123 45 67</p>
              <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500, margin: '1px 0 0' }}>ahmet@FSBO.app</p>
            </div>
          </div>
        </div>
        <div style={{ padding: '32px 36px 0', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', color: '#d4d0c8', margin: 0 }}>© 2026 FSBO · Bu sunum FSBO.app üzerinden oluşturulmuştur.</p>
        </div>
      </div>

      {/* PDF SUCCESS POPUP */}
      {showPdfSuccess && pdfReady && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-modal-fade">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-lg font-extrabold mb-1" style={{ color: '#1e1b2e' }}>Sunum Hazır!</h3>
              <p className="text-xs text-gray-400 font-medium mb-5">"{prop.title}" için PDF sunumu oluşturuldu ve indiriliyor.</p>
              <div className="flex gap-2.5 justify-center">
                <button className="btn px-5 py-2.5 rounded-2xl text-xs font-extrabold border-2 border-gray-200" style={{ color: '#1e1b2e' }} onClick={closePdfSuccess}>Kapat</button>
                <button className="btn px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-lg flex items-center justify-center gap-1.5" style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }} onClick={downloadPdf}><Download size={14} strokeWidth={2.5} /> PDF İndir</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALLING OVERLAY */}
      {calling && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-modal-fade">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl animate-scale-in max-w-xs w-full mx-4">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <PhoneCall size={36} className="text-green-500 animate-pulse" />
            </div>
            <h3 className="text-lg font-extrabold mb-1" style={{ color: '#1e1b2e' }}>Aranıyor...</h3>
            <p className="text-sm text-gray-400 font-medium">{prop.title}</p>
            <div className="mt-4 flex justify-center">
              <Loader2 size={24} className="animate-spin" style={{ color: '#e3d10d' }} />
            </div>
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {showRating && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-modal-fade" onClick={closeRating}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold" style={{ color: '#1e1b2e' }}>Arama Deneyimi</h3>
              <button className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center" onClick={closeRating}><X size={16} className="text-gray-500" /></button>
            </div>
            {submitted ? (
              <div className="text-center py-4 animate-scale-in">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3"><CheckCircle size={32} className="text-green-500" /></div>
                <h4 className="text-base font-extrabold mb-1" style={{ color: '#1e1b2e' }}>Teşekkürler!</h4>
                <p className="text-xs text-gray-400 font-medium">{rating >= 3 ? 'Değerlendirmeniz kaydedildi. İlan "Sonra Aranacaklar" listenize eklendi.' : 'Değerlendirmeniz kaydedildi.'}</p>
                <button className="mt-5 px-6 py-2.5 rounded-2xl text-xs font-extrabold shadow-lg" style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }} onClick={closeRating}>Kapat</button>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400 font-medium mb-4">Arama deneyiminizi nasıl buldunuz?</p>
                <div className="flex justify-center gap-2 mb-5">
                  {stars.map(s => (
                    <button key={s} type="button" className="transition-all duration-150" style={{ transform: s <= (hoverRating || rating) ? 'scale(1.15)' : 'scale(1)' }} onClick={() => setRating(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}>
                      <Star size={32} fill={s <= (hoverRating || rating) ? '#e3d10d' : 'none'} stroke={s <= (hoverRating || rating) ? '#e3d10d' : '#d4d0c8'} strokeWidth={1.5} style={{ transition: 'all .15s ease' }} />
                    </button>
                  ))}
                </div>
                <textarea className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-cream text-sm font-semibold resize-none outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] transition-all duration-200" style={{ color: '#1e1b2e' }} placeholder="Not eklemek isterseniz (isteğe bağlı)..." rows={3} maxLength={200} value={note} onChange={e => setNote(e.target.value)} />
                <div className="flex gap-2.5 mt-5">
                  <button className="flex-1 py-3 rounded-2xl text-xs font-extrabold border-2 border-gray-200 btn" style={{ color: '#1e1b2e' }} onClick={closeRating}>İptal</button>
                  <button className={`flex-1 py-3 rounded-2xl text-xs font-extrabold shadow-lg flex items-center justify-center gap-2 ${rating === 0 ? 'opacity-40 pointer-events-none' : ''}`} style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }} disabled={rating === 0} onClick={handleSubmitRating}>
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} strokeWidth={2.5} />}
                    {submitting ? 'Gönderiliyor...' : 'Gönder'}
                  </button>
                </div>
                {rating >= 3 && <p className="text-[10px] text-green-600 font-semibold text-center mt-3">Puanınız 3 veya üzeri — ilan "Sonra Aranacaklar" listenize eklenecek.</p>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function IlanlarimDetailView({ prop }) {
  const navigate = useNavigate()
  const { lists, isInMyListings, toggleMyListing, updateItemNote, addToast } = useApp()
  const { customers } = useCustomers()
  const { getCustomersForListing, associate, disassociate, updateNote } = useCustomerListings()

  const [noteText, setNoteText] = useState('')
  const [editingNote, setEditingNote] = useState(false)
  const [showCustPicker, setShowCustPicker] = useState(false)
  const [editingCustNote, setEditingCustNote] = useState(null)
  const [custNoteText, setCustNoteText] = useState('')


  const currentNote = lists[MY_LISTINGS_ID]?.notes?.[prop.id] || ''
  const customerIds = getCustomersForListing(prop.id)

  useEffect(() => {
    setNoteText(currentNote)
  }, [currentNote])

  return (
    <div className="flex flex-col min-h-0">
      {/* NAV BAR */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-cardBorder">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <button
              className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 btn"
              onClick={() => navigate('/portfoyum')}
            >
              <ArrowLeft size={15} />
              Portföyüme Dön
            </button>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1.5">
                <Bookmark size={11} fill="#059669" />
                Portföyümde
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="relative h-[45vh] min-h-[280px] max-h-[420px] bg-gray-100 overflow-hidden">
        <img src={prop.img} alt={prop.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {prop.badge && (
                <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5">
                  <Tag size={11} />
                  {prop.badge}
                </span>
              )}
              <span className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ${prop.status === 'Aktif' ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30' : 'bg-red-500/30 text-red-200 border border-red-400/30'}`}>
                <CheckCircle size={11} />
                {prop.status}
              </span>
              <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-white/10 backdrop-blur-md text-white/80 border border-white/10 flex items-center gap-1.5">
                <Clock size={11} />
                {prop.time}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight drop-shadow-lg max-w-3xl">
              {prop.title}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <MapPin size={14} className="text-white/70" />
              <span className="text-white/80 text-sm font-medium">{prop.location}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">{prop.price}</span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="bg-white border-b border-cardBorder">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-3 py-4">
            {[
              { label: 'Oda', value: prop.rooms, icon: Layers },
              { label: 'm²', value: prop.size, icon: Maximize },
              { label: 'Kat', value: prop.floor, icon: MoveVertical },
              { label: 'Yaş', value: prop.age, icon: Calendar },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="text-center">
                  <Icon size={18} className="mx-auto mb-1 text-gray-400" />
                  <p className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>{s.value}</p>
                  <p className="text-[10px] font-medium text-gray-400">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CONTENT - SIMPLE VERTICAL */}
      <div className="flex-1 bg-cream/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">

          {/* NOTE SECTION */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-cardBorder">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote size={16} className="text-emerald-500" />
              <span className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>NOTLARIM</span>
              {currentNote && <span className="text-[10px] text-gray-400 font-medium">({currentNote.length} karakter)</span>}
            </div>
            {editingNote ? (
              <div className="space-y-2">
                <textarea
                  className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 bg-cream text-sm font-medium resize-none outline-none focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(5,150,105,.08)] transition-all"
                  style={{ color: '#1e1b2e' }}
                  placeholder="Bu ilan hakkında notlarınızı yazın..."
                  rows={4}
                  maxLength={500}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium">{noteText.length}/500</span>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-xl text-[11px] font-bold border-2 border-cardBorder btn" style={{ color: '#1e1b2e' }} onClick={() => { setEditingNote(false); setNoteText(currentNote) }}>İptal</button>
                    <button className="px-4 py-2 rounded-xl text-[11px] font-bold text-white shadow-lg btn" style={{ background: '#059669', boxShadow: '0 4px 12px rgba(5,150,105,.25)' }} onClick={() => { updateItemNote(MY_LISTINGS_ID, prop.id, noteText.trim()); addToast('Not kaydedildi'); setEditingNote(false) }}>Kaydet</button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                className="w-full flex items-start gap-3 px-4 py-4 rounded-2xl bg-cream hover:bg-emerald-50/80 transition-all text-left group border border-transparent hover:border-emerald-200"
                onClick={() => setEditingNote(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5 group-hover:text-emerald-500 transition-colors"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                <div className="flex-1 min-w-0">
                  {currentNote ? (
                    <p className="text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-wrap break-words">{currentNote}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 font-medium">Bu ilan için not ekleyin...</span>
                      <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">Ekle</span>
                    </div>
                  )}
                </div>
              </button>
            )}
          </div>

          {/* CUSTOMER ASSOCIATIONS */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-cardBorder">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <User size={16} className="text-orange-500" />
                <span className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>İLİŞKİLİ MÜŞTERİLER</span>
                {customerIds.length > 0 && (
                  <span className="text-[10px] text-gray-400 font-medium">({customerIds.length} kişi)</span>
                )}
              </div>
              <button
                className="px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 btn"
                style={{ background: 'rgba(255,107,53,.12)', color: '#ff6b35' }}
                onClick={() => setShowCustPicker(true)}
              >
                <UserPlus size={12} />
                Müşteri Ekle
              </button>
            </div>
            {customerIds.length === 0 ? (
              <button
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-cream hover:bg-orange-50/80 transition-all text-left group border border-transparent hover:border-orange-200"
                onClick={() => setShowCustPicker(true)}
              >
                <UserPlus size={15} className="text-gray-400 flex-shrink-0 group-hover:text-orange-500 transition-colors" />
                <div>
                  <p className="text-sm text-gray-400 font-medium">Henüz müşteri ilişkilendirilmemiş</p>
                  <p className="text-[10px] text-gray-300 font-medium mt-0.5">Müşteri eklemek için tıklayın</p>
                </div>
              </button>
            ) : (
              <div className="space-y-2">
                {customerIds.map(({ musteriId, not }) => {
                  const c = customers.find(c => c.id === musteriId)
                  if (!c) return null
                  const isEditing = editingCustNote === musteriId
                  return (
                    <div key={musteriId} className="rounded-2xl bg-orange-50/50 border border-orange-100 overflow-hidden">
                      <div className="p-3.5">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,107,53,.15)' }}>
                              <User size={14} style={{ color: '#ff6b35' }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-extrabold truncate" style={{ color: '#1e1b2e' }}>{c.ad} {c.soyad}</p>
                              {c.sirket && <p className="text-[10px] text-gray-400 font-medium truncate">{c.sirket}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white btn"
                              onClick={() => {
                                setEditingCustNote(musteriId)
                                setCustNoteText(not || '')
                              }}
                            >
                              <Edit3 size={11} className="text-gray-400" />
                            </button>
                            <button
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white btn"
                              onClick={() => { disassociate(musteriId, prop.id); addToast('Müşteri ilişkisi kaldırıldı') }}
                            >
                              <XCircle size={11} className="text-gray-400" />
                            </button>
                          </div>
                        </div>
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <textarea
                              className="w-full px-3 py-2 rounded-xl border-2 border-orange-200 bg-cream text-xs font-medium resize-none outline-none focus:border-orange-400 focus:shadow-[0_0_0_3px_rgba(255,107,53,.08)] transition-all"
                              style={{ color: '#1e1b2e' }}
                              placeholder="Bu müşteri için not..."
                              rows={2}
                              maxLength={300}
                              value={custNoteText}
                              onChange={e => setCustNoteText(e.target.value)}
                              autoFocus
                            />
                            <div className="flex justify-end gap-1.5">
                              <button className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-cream text-gray-500 btn" onClick={() => setEditingCustNote(null)}>İptal</button>
                              <button
                                className="px-2.5 py-1 rounded-lg text-[9px] font-bold text-white btn"
                                style={{ background: '#ff6b35' }}
                                onClick={() => { updateNote(musteriId, prop.id, custNoteText.trim()); addToast('Müşteri notu kaydedildi'); setEditingCustNote(null) }}
                              >
                                Kaydet
                              </button>
                            </div>
                          </div>
                        ) : (
                          not ? (
                            <p className="text-xs text-gray-500 font-medium leading-relaxed ml-10 whitespace-pre-wrap break-words">{not}</p>
                          ) : (
                            <p className="text-xs text-gray-400 font-medium ml-10 italic">Not eklenmemiş</p>
                          )
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* CUSTOMER PICKER MODAL */}
          {showCustPicker && (
            <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-modal-fade" onClick={() => setShowCustPicker(false)}>
              <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-extrabold" style={{ color: '#1e1b2e' }}>Müşteri Ekle</h3>
                  <button className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center" onClick={() => setShowCustPicker(false)}>
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {customers.length === 0 ? (
                    <p className="text-xs text-gray-400 font-medium text-center py-6">Henüz müşteri bulunmuyor. Önce müşteri ekleyin.</p>
                  ) : (
                    customers.map(c => {
                      const isAssoc = customerIds.some(a => a.musteriId === c.id)
                      return (
                        <button
                          key={c.id}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold btn transition-all ${
                            isAssoc ? 'opacity-40 pointer-events-none' : ''
                          }`}
                          style={{ color: '#1e1b2e', border: isAssoc ? '2px solid #e0e0e0' : '2px solid transparent' }}
                          disabled={isAssoc}
                          onClick={() => {
                            associate(c.id, prop.id)
                            addToast(`"${c.ad} ${c.soyad}" ilişkilendirildi`)
                            setShowCustPicker(false)
                          }}
                        >
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,107,53,.15)' }}>
                            <User size={14} style={{ color: '#ff6b35' }} />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-bold truncate">{c.ad} {c.soyad}</p>
                            {c.sirket && <p className="text-[10px] text-gray-400 font-medium truncate">{c.sirket}</p>}
                          </div>
                          {isAssoc && <span className="text-[10px] text-gray-400 font-medium flex-shrink-0">Zaten eklendi</span>}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-cardBorder">
            <h2 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1e1b2e' }}>
              <FileText size={16} className="text-emerald-500" />
              Açıklama
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">{prop.desc}</p>
          </div>

          {/* FEATURES */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-cardBorder">
            <h2 className="text-sm font-extrabold mb-4 flex items-center gap-2" style={{ color: '#1e1b2e' }}>
              <Layers size={16} className="text-emerald-500" />
              Özellikler
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Oda Sayısı', value: prop.rooms, icon: Layers },
                { label: 'Metrekare', value: prop.size, icon: Maximize },
                { label: 'Bulunduğu Kat', value: prop.floor, icon: MoveVertical },
                { label: 'Bina Yaşı', value: prop.age, icon: Calendar },
                { label: 'Durum', value: prop.status, icon: CheckCircle },
                { label: 'Konum', value: prop.location, icon: MapPin },
              ].map(f => {
                const Icon = f.icon
                return (
                  <div key={f.label} className="bg-cream rounded-xl p-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Icon size={15} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400">{f.label}</p>
                      <p className="text-sm font-bold" style={{ color: '#1e1b2e' }}>{f.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* NEARBY PLACES */}
            {prop.coords && (
            <NearbyPlaces coords={prop.coords} />
          )}

          {/* PRICE ANALYSIS */}
          <PriceAnalysis prop={prop} />

          {/* PDF PRESENTATION */}
          <PresentationBuilder prop={prop} />

          {/* SELLER */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-cardBorder">
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/80?img=11" alt="Satıcı" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <h3 className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>Ahmet Yılmaz</h3>
                <p className="text-xs text-gray-400 font-medium">Emlak Danışmanı</p>
              </div>
              <div className="ml-auto flex gap-2">
                <button className="btn w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center"><Phone size={16} className="text-gray-500" /></button>
                <button className="btn w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center" onClick={() => addToast('Mesaj gönderiliyor...')}><MessageCircle size={16} className="text-gray-500" /></button>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3">
            <button
              className="flex-1 py-3.5 rounded-2xl text-xs font-extrabold shadow-lg flex items-center justify-center gap-2"
              style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
            >
              <PhoneCall size={14} strokeWidth={2.5} />
              Ara
            </button>
            <button
              className="flex-1 py-3.5 rounded-2xl text-xs font-extrabold border-2 border-cardBorder btn flex items-center justify-center gap-2"
              style={{ color: '#1e1b2e' }}
              onClick={() => addToast('Mesaj gönderiliyor...')}
            >
              <MessageCircle size={14} />
              Mesaj Gönder
            </button>
          </div>

          {/* REMOVE BUTTON */}
          <button
            className="w-full py-3.5 rounded-2xl text-xs font-extrabold border-2 border-red-200 btn flex items-center justify-center gap-2 text-red-400 hover:bg-red-50 transition-all"
            onClick={() => { toggleMyListing(prop.id); addToast('Portföyüm\'den çıkarıldı'); navigate('/portfoyum') }}
          >
            <Trash2 size={14} />
            Portföyüm'den Çıkar
          </button>
        </div>
      </div>
    </div>
  )
}
