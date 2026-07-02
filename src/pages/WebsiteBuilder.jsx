import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { arrayMove } from '@dnd-kit/sortable'
import ContentEditable from 'react-contenteditable'
import {
  Globe, Eye, ArrowLeft, ArrowRight, Check, Trash2, Plus,
  Phone, Mail, MapPin, Clock, Send, ExternalLink,
  LayoutTemplate, Palette, Settings, Rocket,
  Home, Building2, Users, MessageSquare, Star, Link2, Smartphone, Monitor, LayoutGrid,
  Camera, Share2, MessageCircle, Bookmark, FileText, Copy
} from 'lucide-react'
import { WEBSITE_TEMPLATES, DEFAULT_COMPANY_INFO, SAMPLE_LISTINGS } from '../data/websiteTemplates'
import { useApp } from '../context/AppContext'
import { websitesApi } from '../api/websites'
import { WebsitePreview as SiteRenderer } from '../components/website/SiteRenderer'
import { SECTION_TYPES } from '../components/website/SiteRenderer'
import BuilderSidebar from '../components/website/BuilderSidebar'

const STEPS = [
  { id: 'templates', label: 'Şablon Seç', icon: LayoutTemplate },
  { id: 'customize', label: 'Özelleştir', icon: Settings },
  { id: 'preview', label: 'Önizle', icon: Eye },
  { id: 'publish', label: 'Yayınla', icon: Rocket },
]

function StepIndicator({ currentStep, steps }) {
  const currentIdx = steps.findIndex(s => s.id === currentStep)
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {steps.map((step, idx) => {
        const Icon = step.icon
        const isActive = idx === currentIdx
        const isCompleted = idx < currentIdx
        return (
          <div key={step.id} className="flex items-center gap-1 sm:gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-300 ${
              isActive ? 'bg-accent text-deep shadow-lg' :
              isCompleted ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-400'
            }`}>
              {isCompleted ? <Check size={12} strokeWidth={3} /> : <Icon size={12} strokeWidth={isActive ? 2.5 : 1.5} />}
              <span className="text-[10px] font-bold hidden sm:inline">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-4 sm:w-8 h-0.5 rounded-full transition-all duration-300 ${
                idx < currentIdx ? 'bg-green-300' : 'bg-gray-200'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function TemplateCard({ template, isSelected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(template.id)}
      className={`relative group w-full text-left rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
        isSelected
          ? 'border-accent shadow-xl scale-[1.02]'
          : 'border-cardBorder hover:border-gray-300 hover:shadow-lg'
      }`}
    >
      <div className="h-36 sm:h-44 relative overflow-hidden" style={{ background: template.thumbnail }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/90">
            <LayoutTemplate size={28} className="mx-auto mb-2 opacity-60" />
            <p className="text-[10px] font-bold opacity-70">{template.category}</p>
          </div>
        </div>
        {isSelected && (
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-lg animate-scale-in">
            <Check size={12} strokeWidth={3} className="text-deep" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-extrabold text-xs">{template.name}</h3>
          <p className="text-white/60 text-[9px] font-medium mt-0.5 line-clamp-2">{template.description}</p>
        </div>
      </div>
      <div className="p-3 bg-white">
        <div className="flex items-center gap-1.5">
          {Object.values(template.colors).slice(0, 4).map((color, i) => (
            <div key={i} className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ background: color }} />
          ))}
          <span className="text-[9px] text-gray-400 font-medium ml-auto">{template.sections.length} bölüm</span>
        </div>
      </div>
    </button>
  )
}

function ColorPicker({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] font-bold text-gray-500 min-w-[70px]">{label}</label>
      <div className="flex items-center gap-1.5 flex-1">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-7 h-7 rounded-lg border-2 border-cardBorder cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-2 py-1 text-[10px] font-mono border border-cardBorder rounded-lg focus:outline-none focus:border-accent"
        />
      </div>
    </div>
  )
}

function ListingEditor({ listing, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-cardBorder rounded-xl overflow-hidden bg-white">
      <div
        className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: listing.type === 'Satılık' ? '#d1fae5' : '#dbeafe' }}>
          <Home size={14} style={{ color: listing.type === 'Satılık' ? '#059669' : '#3b82f6' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-deep truncate">{listing.title}</p>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold" style={{ color: listing.type === 'Satılık' ? '#059669' : '#3b82f6' }}>{listing.price}</span>
            <span className="text-[9px] text-gray-400">{listing.area} | {listing.rooms}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={12} />
          </button>
          {expanded ? <ChevronUp size={12} className="text-gray-400" /> : <ChevronDown size={12} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="p-3 border-t border-cardBorder bg-gray-50/50 space-y-2.5 animate-slide-down">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold text-gray-500 mb-0.5 block">İlan Başlığı</label>
              <input
                type="text"
                value={listing.title}
                onChange={e => onUpdate({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 mb-0.5 block">Tür</label>
              <select
                value={listing.type}
                onChange={e => onUpdate({ type: e.target.value })}
                className="w-full px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white"
              >
                <option value="Satılık">Satılık</option>
                <option value="Kiralık">Kiralık</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9px] font-bold text-gray-500 mb-0.5 block">Fiyat</label>
              <input
                type="text"
                value={listing.price}
                onChange={e => onUpdate({ price: e.target.value })}
                className="w-full px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 mb-0.5 block">Alan</label>
              <input
                type="text"
                value={listing.area}
                onChange={e => onUpdate({ area: e.target.value })}
                className="w-full px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 mb-0.5 block">Oda Sayısı</label>
              <input
                type="text"
                value={listing.rooms}
                onChange={e => onUpdate({ rooms: e.target.value })}
                className="w-full px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InlineEditable({ html, onChange, tagName, className, style, placeholder }) {
  const handleChange = useCallback((e) => {
    onChange(e.target.value)
  }, [onChange])

  const handleBlur = useCallback((e) => {
    const text = e.target.innerText.trim()
    if (!text && placeholder) {
      onChange(placeholder)
    }
  }, [onChange, placeholder])

  return (
    <ContentEditable
      html={html || ''}
      onChange={handleChange}
      onBlur={handleBlur}
      tagName={tagName || 'div'}
      className={className}
      style={style}
      data-placeholder={placeholder || ''}
    />
  )
}

export default function WebsiteBuilder() {
  const navigate = useNavigate()
  const { addToast } = useApp()

  const [currentStep, setCurrentStep] = useState('templates')
  const [selectedTemplateId, setSelectedTemplateId] = useState(null)
  const [companyInfo, setCompanyInfo] = useState({ ...DEFAULT_COMPANY_INFO })
  const [sections, setSections] = useState([])
  const [listings, setListings] = useState([...SAMPLE_LISTINGS])
  const [previewMode, setPreviewMode] = useState('desktop')
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState('')
  const [publishedId, setPublishedId] = useState('')
  const [publishedSlug, setPublishedSlug] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [customizeTab, setCustomizeTab] = useState('sections')
  const [showNewListingForm, setShowNewListingForm] = useState(false)
  const [newListing, setNewListing] = useState({ title: '', type: 'Satılık', price: '', area: '', rooms: '' })

  const location = useLocation()
  const [editingWebsiteId, setEditingWebsiteId] = useState(location.state?.editWebsiteId || null)

  useEffect(() => {
    if (!editingWebsiteId) return
    let cancelled = false
    websitesApi.getById(editingWebsiteId).then(site => {
      if (cancelled || !site) return
      setSelectedTemplateId(site.templateId)
      setCompanyInfo({ ...DEFAULT_COMPANY_INFO, ...(site.companyInfo || {}) })
      setSections(site.sections || [])
      setListings(site.listings || [])
      setCurrentStep('customize')
    }).catch(() => {})
    return () => { cancelled = true }
  }, [editingWebsiteId])

  const selectedTemplate = WEBSITE_TEMPLATES.find(t => t.id === selectedTemplateId)

  const handleSelectTemplate = useCallback((templateId) => {
    setSelectedTemplateId(templateId)
    const tpl = WEBSITE_TEMPLATES.find(t => t.id === templateId)
    if (tpl) {
      setSections(tpl.sections.map(s => ({ ...s })))
    }
  }, [])

  const handleUpdateSection = useCallback((sectionId, updates) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, ...updates } : s))
  }, [])

  const handleToggleVisibility = useCallback((sectionId) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, visible: !s.visible } : s))
  }, [])

  const handleRemoveSection = useCallback((sectionId) => {
    setSections(prev => prev.filter(s => s.id !== sectionId))
  }, [])

  const handleCloneSection = useCallback((sectionId) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === sectionId)
      if (idx === -1) return prev
      const original = prev[idx]
      const clone = { ...original, id: `clone-${Date.now()}`, title: `${original.title} (Kopya)` }
      const copy = [...prev]
      copy.splice(idx + 1, 0, clone)
      return copy
    })
  }, [])

  const handleMoveSection = useCallback((sectionId, direction) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === sectionId)
      if (idx === -1) return prev
      const newIdx = direction === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= prev.length) return prev
      return arrayMove(prev, idx, newIdx)
    })
  }, [])

  const handleDragEnd = useCallback((movedSections) => {
    setSections(movedSections)
  }, [])

  const handleAddSection = useCallback((type) => {
    const newSection = {
      id: `custom-${Date.now()}`,
      type,
      title: SECTION_TYPES[type]?.label || 'Yeni Bölüm',
      visible: true,
      ...(type === 'hero' ? { subtitle: 'Alt başlık' } : {}),
      ...(type === 'about' ? { content: 'Buraya içeriğinizi yazın...' } : {}),
      ...(type === 'listings' ? { count: 6 } : {}),
      ...(type === 'services' ? { items: ['Hizmet 1', 'Hizmet 2'] } : {}),
      ...(type === 'gallery' ? { images: [] } : {}),
      ...(type === 'testimonials' ? { items: [{ name: 'Müşteri Adı', text: 'Harika bir deneyim yaşadık...' }] } : {}),
      ...(type === 'team' ? { items: [{ name: 'Ad Soyad', role: 'Uzman' }] } : {}),
      ...(type === 'cta' ? { content: 'Hemen bizimle iletişime geçin', buttonText: 'Hemen Arayın', buttonLink: '' } : {}),
      ...(type === 'map' ? { content: '', mapUrl: '' } : {}),
    }
    setSections(prev => [...prev, newSection])
  }, [])

  const handleUpdateListing = useCallback((listingId, updates) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, ...updates } : l))
  }, [])

  const handleRemoveListing = useCallback((listingId) => {
    setListings(prev => prev.filter(l => l.id !== listingId))
  }, [])

  const handleAddListing = useCallback(() => {
    if (!newListing.title || !newListing.price) {
      addToast('Lütfen en az başlık ve fiyat girin', 'error')
      return
    }
    setListings(prev => [...prev, { ...newListing, id: Date.now() }])
    setNewListing({ title: '', type: 'Satılık', price: '', area: '', rooms: '' })
    setShowNewListingForm(false)
    addToast('İlan eklendi', 'success')
  }, [newListing, addToast])

  const handlePublish = useCallback(async () => {
    setIsPublishing(true)
    try {
      let siteId = editingWebsiteId

      if (editingWebsiteId) {
        await websitesApi.update(editingWebsiteId, {
          name: companyInfo.name,
          templateId: selectedTemplateId,
          companyInfo,
          sections,
          listings,
          colors: selectedTemplate?.colors || {},
        })
      } else {
        const created = await websitesApi.create({
          name: companyInfo.name,
          templateId: selectedTemplateId,
          companyInfo,
          sections,
          listings,
          colors: selectedTemplate?.colors || {},
          status: 'draft',
        })
        siteId = created.id
        setEditingWebsiteId(created.id)
      }

      const published = await websitesApi.publish(siteId)
      const url = `${window.location.origin}/site/${published.slug}`
      setPublishedUrl(url)
      setPublishedId(published.id)
      setPublishedSlug(published.slug)
      setIsPublishing(false)
      setShowPublishModal(true)
      addToast('Web siteniz başarıyla yayınlandı!', 'success')
    } catch (err) {
      setIsPublishing(false)
      addToast('Yayınlama sırasında bir hata oluştu: ' + err.message, 'error')
    }
  }, [companyInfo, selectedTemplateId, sections, listings, selectedTemplate, editingWebsiteId, addToast])

  const handleNext = () => {
    const stepOrder = ['templates', 'customize', 'preview', 'publish']
    const idx = stepOrder.indexOf(currentStep)
    if (idx < stepOrder.length - 1) {
      if (currentStep === 'templates' && !selectedTemplateId) {
        addToast('Lütfen bir şablon seçin', 'error')
        return
      }
      setCurrentStep(stepOrder[idx + 1])
    }
  }

  const handlePrev = () => {
    const stepOrder = ['templates', 'customize', 'preview', 'publish']
    const idx = stepOrder.indexOf(currentStep)
    if (idx > 0) setCurrentStep(stepOrder[idx - 1])
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-cardBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft size={18} className="text-gray-500" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#e3d10d' }}>
                <Globe size={16} className="text-deep" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-deep">Web Site Kurucu</h1>
                <p className="text-[10px] text-gray-400 font-medium">Hazır şablonlarla profesyonel web sitesi</p>
              </div>
            </div>
          </div>
          <StepIndicator currentStep={currentStep} steps={STEPS} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {currentStep === 'templates' && (
          <div className="animate-fade-up">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-deep">Şablonunuzu Seçin</h2>
              <p className="text-xs text-gray-500 mt-1">İşletmenize en uygun tasarımı seçerek başlayın</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {WEBSITE_TEMPLATES.map(template => (
                <TemplateCard key={template.id} template={template} isSelected={selectedTemplateId === template.id} onSelect={handleSelectTemplate} />
              ))}
            </div>
          </div>
        )}

        {currentStep === 'customize' && selectedTemplate && (
          <div className="animate-fade-up">
            <div className="flex items-center gap-1 mb-4 bg-white rounded-xl border border-cardBorder p-1 inline-flex">
              {[
                { key: 'sections', label: 'Bölümler', icon: LayoutGrid },
                { key: 'listings', label: 'İlanlar', icon: FileText },
                { key: 'company', label: 'Firma Bilgileri', icon: Building2 },
                { key: 'design', label: 'Tasarım', icon: Palette },
              ].map(tab => {
                const TabIcon = tab.icon
                return (
                  <button
                    key={tab.key}
                    onClick={() => setCustomizeTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      customizeTab === tab.key ? 'bg-accent text-deep' : 'text-gray-400 hover:text-deep'
                    }`}
                  >
                    <TabIcon size={12} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 space-y-3">
                {customizeTab === 'sections' && (
                  <BuilderSidebar
                    sections={sections}
                    onAddSection={handleAddSection}
                    onReorder={setSections}
                    onSectionUpdate={handleUpdateSection}
                    onToggleVisibility={handleToggleVisibility}
                    onRemoveSection={handleRemoveSection}
                    onCloneSection={handleCloneSection}
                    onMoveSection={handleMoveSection}
                  />
                )}

                {customizeTab === 'listings' && (
                  <div className="bg-white rounded-2xl border border-cardBorder p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-extrabold text-deep flex items-center gap-1.5">
                        <FileText size={14} className="text-accent" />
                        İlan Yönetimi
                      </h3>
                      <button
                        onClick={() => setShowNewListingForm(!showNewListingForm)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors"
                      >
                        <Plus size={10} /> Yeni İlan
                      </button>
                    </div>

                    {showNewListingForm && (
                      <div className="mb-3 p-3 bg-accent/5 rounded-xl border border-accent/20 space-y-2 animate-slide-down">
                        <input type="text" placeholder="İlan başlığı" value={newListing.title} onChange={e => setNewListing(p => ({ ...p, title: e.target.value }))} className="w-full px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white" />
                        <div className="grid grid-cols-2 gap-2">
                          <select value={newListing.type} onChange={e => setNewListing(p => ({ ...p, type: e.target.value }))} className="px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white">
                            <option value="Satılık">Satılık</option>
                            <option value="Kiralık">Kiralık</option>
                          </select>
                          <input type="text" placeholder="Fiyat" value={newListing.price} onChange={e => setNewListing(p => ({ ...p, price: e.target.value }))} className="px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="Alan (ör: 120 m²)" value={newListing.area} onChange={e => setNewListing(p => ({ ...p, area: e.target.value }))} className="px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white" />
                          <input type="text" placeholder="Oda (ör: 3+1)" value={newListing.rooms} onChange={e => setNewListing(p => ({ ...p, rooms: e.target.value }))} className="px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleAddListing} className="flex-1 px-3 py-1.5 text-[10px] font-bold text-deep bg-accent rounded-lg hover:bg-accentLight transition-colors">Kaydet</button>
                          <button onClick={() => setShowNewListingForm(false)} className="px-3 py-1.5 text-[10px] font-bold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">İptal</button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      {listings.map(listing => (
                        <ListingEditor key={listing.id} listing={listing} onUpdate={(updates) => handleUpdateListing(listing.id, updates)} onRemove={() => handleRemoveListing(listing.id)} />
                      ))}
                    </div>

                    {listings.length === 0 && (
                      <div className="text-center py-8">
                        <Home size={28} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-[11px] text-gray-400 font-medium">Henüz ilan eklenmedi</p>
                      </div>
                    )}
                  </div>
                )}

                {customizeTab === 'company' && (
                  <>
                    <div className="bg-white rounded-2xl border border-cardBorder p-3">
                      <h3 className="text-xs font-extrabold text-deep mb-3 flex items-center gap-1.5">
                        <Building2 size={14} className="text-accent" />
                        Firma Bilgileri
                      </h3>
                      <div className="space-y-2">
                        {[
                          { key: 'name', label: 'Firma Adı', icon: Building2 },
                          { key: 'phone', label: 'Telefon', icon: Phone, type: 'tel' },
                          { key: 'email', label: 'E-posta', icon: Mail, type: 'email' },
                          { key: 'address', label: 'Adres', icon: MapPin },
                          { key: 'website', label: 'Web Sitesi', icon: Globe },
                          { key: 'workingHours', label: 'Çalışma Saatleri', icon: Clock },
                        ].map(({ key, label, icon: Icon, type }) => (
                          <div key={key}>
                            <label className="text-[9px] font-bold text-gray-500 mb-0.5 flex items-center gap-1">
                              <Icon size={9} /> {label}
                            </label>
                            <input type={type || 'text'} value={companyInfo[key]} onChange={e => setCompanyInfo(p => ({ ...p, [key]: e.target.value }))} className="w-full px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-cardBorder p-3">
                      <h3 className="text-xs font-extrabold text-deep mb-3 flex items-center gap-1.5">
                        <Link2 size={14} className="text-accent" />
                        Sosyal Medya
                      </h3>
                      <div className="space-y-2">
                        {[
                          { key: 'instagram', label: 'Instagram', icon: Camera },
                          { key: 'facebook', label: 'Facebook', icon: Share2 },
                          { key: 'twitter', label: 'Twitter', icon: MessageCircle },
                          { key: 'linkedin', label: 'LinkedIn', icon: Bookmark },
                        ].map(({ key, label, icon: Icon }) => (
                          <div key={key}>
                            <label className="text-[9px] font-bold text-gray-500 mb-0.5 flex items-center gap-1">
                              <Icon size={9} /> {label}
                            </label>
                            <input type="url" value={companyInfo.socialMedia?.[key] || ''} onChange={e => setCompanyInfo(p => ({ ...p, socialMedia: { ...p.socialMedia, [key]: e.target.value } }))} placeholder={`https://${key}.com/...`} className="w-full px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {customizeTab === 'design' && selectedTemplate && (
                  <div className="bg-white rounded-2xl border border-cardBorder p-3">
                    <h3 className="text-xs font-extrabold text-deep mb-3 flex items-center gap-1.5">
                      <Palette size={14} className="text-accent" />
                      Renk Ayarları
                    </h3>
                    <div className="space-y-2.5">
                      <ColorPicker label="Ana Renk" value={selectedTemplate.colors.primary} onChange={(v) => { const tpl = WEBSITE_TEMPLATES.find(t => t.id === selectedTemplateId); if (tpl) tpl.colors.primary = v; setSections(prev => [...prev]) }} />
                      <ColorPicker label="İkincil" value={selectedTemplate.colors.secondary} onChange={(v) => { const tpl = WEBSITE_TEMPLATES.find(t => t.id === selectedTemplateId); if (tpl) tpl.colors.secondary = v; setSections(prev => [...prev]) }} />
                      <ColorPicker label="Vurgu" value={selectedTemplate.colors.accent} onChange={(v) => { const tpl = WEBSITE_TEMPLATES.find(t => t.id === selectedTemplateId); if (tpl) tpl.colors.accent = v; setSections(prev => [...prev]) }} />
                      <ColorPicker label="Arkaplan" value={selectedTemplate.colors.bg} onChange={(v) => { const tpl = WEBSITE_TEMPLATES.find(t => t.id === selectedTemplateId); if (tpl) tpl.colors.bg = v; setSections(prev => [...prev]) }} />
                    </div>
                    <div className="mt-4 pt-3 border-t border-cardBorder">
                      <p className="text-[9px] font-bold text-gray-500 mb-2">Şablon Bilgisi</p>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <LayoutTemplate size={14} className="text-accent" />
                        <div>
                          <p className="text-[10px] font-bold text-deep">{selectedTemplate.name}</p>
                          <p className="text-[9px] text-gray-400">{selectedTemplate.category} kategorisi</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                <div className="sticky top-20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-extrabold text-deep flex items-center gap-1.5">
                      <Eye size={14} className="text-accent" />
                      Canlı Önizleme
                    </h3>
                    <div className="flex items-center gap-1 bg-white rounded-lg border border-cardBorder p-0.5">
                      <button onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-accent text-deep' : 'text-gray-400 hover:text-deep'}`}>
                        <Monitor size={14} />
                      </button>
                      <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-accent text-deep' : 'text-gray-400 hover:text-deep'}`}>
                        <Smartphone size={14} />
                      </button>
                    </div>
                  </div>
                  <div className={`mx-auto transition-all duration-300 ${previewMode === 'mobile' ? 'max-w-sm' : 'max-w-full'}`}>
                    <SiteRenderer template={selectedTemplate} companyInfo={companyInfo} listings={listings} sections={sections} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'preview' && selectedTemplate && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-deep">Web Sitesi Önizleme</h2>
              <div className="flex items-center gap-2 bg-white rounded-xl border border-cardBorder p-1">
                <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-lg transition-colors ${previewMode === 'desktop' ? 'bg-accent text-deep' : 'text-gray-400 hover:text-deep'}`}>
                  <Monitor size={16} />
                </button>
                <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-lg transition-colors ${previewMode === 'mobile' ? 'bg-accent text-deep' : 'text-gray-400 hover:text-deep'}`}>
                  <Smartphone size={16} />
                </button>
              </div>
            </div>
            <div className={`mx-auto transition-all duration-300 ${previewMode === 'mobile' ? 'max-w-sm' : 'max-w-full'}`}>
              <SiteRenderer template={selectedTemplate} companyInfo={companyInfo} listings={listings} sections={sections} />
            </div>
          </div>
        )}

        {currentStep === 'publish' && selectedTemplate && (
          <div className="animate-fade-up max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e3d10d, #f0e447)' }}>
                <Rocket size={24} className="text-deep" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-deep">Web Sitenizi Yayınlayın</h2>
              <p className="text-xs text-gray-500 mt-1">Tüm ayarları tamamladıktan sonra sitenizi yayına alabilirsiniz</p>
            </div>

            <div className="bg-white rounded-2xl border border-cardBorder p-5 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                <Check size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-green-800">Şablon Hazır</p>
                  <p className="text-[10px] text-green-600 mt-0.5">{selectedTemplate.name} şablonu seçildi ve özelleştirildi</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                <Check size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-green-800">İçerik Hazır</p>
                  <p className="text-[10px] text-green-600 mt-0.5">{sections.filter(s => s.visible).length} bölüm aktif, {listings.length} ilan mevcut</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                <Globe size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-800">Domain</p>
                  <p className="text-[10px] text-blue-600 mt-0.5">Siteniz /site/slug adresinde yayınlanacaktır</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-center">
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-8 py-3 rounded-2xl font-extrabold text-sm text-deep shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                style={{ background: '#e3d10d', boxShadow: '0 8px 32px rgba(227,209,13,.3)' }}
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-deep/30 border-t-deep rounded-full animate-spin" />
                    Yayınlanıyor...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Şimdi Yayınla
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-cardBorder">
          <button onClick={handlePrev} disabled={currentStep === 'templates'} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-deep hover:bg-white transition-all disabled:opacity-30 disabled:pointer-events-none">
            <ArrowLeft size={14} />
            Geri
          </button>
          {currentStep !== 'publish' && (
            <button onClick={handleNext} className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold text-deep shadow-lg hover:scale-105 transition-all" style={{ background: '#e3d10d', boxShadow: '0 4px 16px rgba(227,209,13,.25)' }}>
              İleri
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {showPublishModal && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-modal-fade" onClick={() => setShowPublishModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 animate-scale-in text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-green-100">
              <Check size={28} className="text-green-600" />
            </div>
            <h3 className="text-lg font-extrabold text-deep mb-1">Tebrikler!</h3>
            <p className="text-xs text-gray-500 mb-5">Web siteniz başarıyla yayınlandı.</p>
            <div className="bg-gray-50 rounded-xl p-3 mb-5">
              <p className="text-[10px] text-gray-400 mb-1">Web siteniz:</p>
              <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-accent hover:underline flex items-center justify-center gap-1">
                {publishedUrl}
                <ExternalLink size={10} />
              </a>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPublishModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 border border-cardBorder hover:bg-gray-50 transition-colors">
                Kapat
              </button>
              <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-2.5 rounded-xl text-xs font-extrabold text-deep text-center" style={{ background: '#e3d10d' }}>
                Siteyi Görüntüle
              </a>
              {publishedId && (
                <button onClick={() => { navigate(`/web-site-ayarlar/${publishedId}`); setShowPublishModal(false) }} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-deep hover:bg-deep/90 transition-colors">
                  Ayarlar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
