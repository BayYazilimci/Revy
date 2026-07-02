import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Globe, Settings, Trash2, ExternalLink, Copy, Check,
  Link2, FileText, Eye, EyeOff, Rocket, AlertTriangle, Save,
  Home, Plus, ChevronDown, ChevronUp
} from 'lucide-react'
import { useWebsite } from '../hooks/useWebsites'
import { websitesApi } from '../api/websites'
import { useApp } from '../context/AppContext'
import LoadingState from '../components/ui/LoadingState'

export default function WebsiteSettings() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useApp()
  const { website, loading, error, update } = useWebsite(id)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [domainVerified, setDomainVerified] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [listings, setListings] = useState([])
  const [showNewListing, setShowNewListing] = useState(false)
  const [newListing, setNewListing] = useState({ title: '', type: 'Satılık', price: '', area: '', rooms: '' })
  const [expandedListing, setExpandedListing] = useState(null)

  useEffect(() => {
    if (website) {
      setName(website.name || '')
      setSlug(website.slug || '')
      setCustomDomain(website.customDomain || '')
      setMetaTitle(website.metaTitle || '')
      setMetaDescription(website.metaDescription || '')
      setDomainVerified(website.domainVerified || false)
      setListings(website.listings || [])
    }
  }, [website])

  const handleSave = async () => {
    if (!name.trim()) {
      addToast('Site adı boş olamaz', 'error')
      return
    }
    setSaving(true)
    try {
      await update({ name, customDomain, metaTitle, metaDescription, listings })
      addToast('Ayarlar kaydedildi', 'success')
    } catch (err) {
      addToast('Kaydetme hatası: ' + err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAddListing = useCallback(() => {
    if (!newListing.title || !newListing.price) {
      addToast('Lütfen en az başlık ve fiyat girin', 'error')
      return
    }
    setListings(prev => [...prev, { ...newListing, id: Date.now() }])
    setNewListing({ title: '', type: 'Satılık', price: '', area: '', rooms: '' })
    setShowNewListing(false)
    addToast('İlan eklendi', 'success')
  }, [newListing, addToast])

  const handleUpdateListing = useCallback((listingId, updates) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, ...updates } : l))
  }, [])

  const handleRemoveListing = useCallback((listingId) => {
    setListings(prev => prev.filter(l => l.id !== listingId))
    addToast('İlan kaldırıldı', 'success')
  }, [addToast])

  const handleToggleDomainVerified = async () => {
    try {
      await update({ domainVerified: !domainVerified })
      setDomainVerified(!domainVerified)
      addToast(domainVerified ? 'Domain doğrulama kaldırıldı' : 'Domain doğrulandı', 'success')
    } catch {
      addToast('Güncelleme hatası', 'error')
    }
  }

  const handleUnpublish = async () => {
    try {
      await websitesApi.unpublish(website.id)
      addToast('Site yayından kaldırıldı', 'success')
      navigate('/web-site-olustur')
    } catch {
      addToast('Yayından kaldırma hatası', 'error')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await websitesApi.delete(website.id)
      addToast('Site silindi', 'success')
      navigate('/web-site-olustur')
    } catch {
      addToast('Silme hatası', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleEditInBuilder = () => {
    navigate('/web-site-olustur', { state: { editWebsiteId: website.id } })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast('Panoya kopyalandı', 'success')
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <LoadingState type="spinner" />
      </div>
    )
  }

  if (error || !website) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Globe size={48} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-xl font-extrabold text-deep mb-2">Site Bulunamadı</h1>
          <p className="text-sm text-gray-500 mb-4">Bu siteye erişim sağlayamıyorsunuz.</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl text-sm font-bold text-deep bg-accent hover:bg-accentLight transition-colors">
            Geri Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-cardBorder">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft size={18} className="text-gray-500" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#e3d10d' }}>
                <Settings size={16} className="text-deep" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-deep">Site Ayarları</h1>
                <p className="text-[10px] text-gray-400 font-medium">{website.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-lg text-[9px] font-bold ${
              website.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {website.status === 'published' ? 'Yayında' : 'Taslak'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <div className="bg-white rounded-2xl border border-cardBorder p-5">
          <h3 className="text-sm font-extrabold text-deep mb-4 flex items-center gap-2">
            <Globe size={16} className="text-accent" />
            Genel Bilgiler
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">Site Adı</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-xs border border-cardBorder rounded-xl focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">URL Slug</label>
              <div className="flex items-center gap-2">
                <input type="text" value={slug} readOnly className="flex-1 px-3 py-2 text-xs border border-cardBorder rounded-xl bg-gray-50 text-gray-500" />
                <button onClick={() => copyToClipboard(`${window.location.origin}/site/${slug}`)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="URL'yi kopyala">
                  <Copy size={14} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-cardBorder p-5">
          <h3 className="text-sm font-extrabold text-deep mb-4 flex items-center gap-2">
            <Link2 size={16} className="text-accent" />
            Domain Bağlama
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">Özel Domain</label>
              <input type="text" value={customDomain} onChange={e => setCustomDomain(e.target.value)} placeholder="ornegin.com" className="w-full px-3 py-2 text-xs border border-cardBorder rounded-xl focus:outline-none focus:border-accent" />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-800 mb-2">CNAME Kaydı Talimatları</p>
              <p className="text-[10px] text-blue-600 mb-3">Domain sağlayıcınızın DNS ayarlarına aşağıdaki CNAME kaydını ekleyin:</p>
              <div className="bg-white rounded-lg p-3 space-y-2 text-[10px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Tür:</span>
                  <span className="font-bold text-deep">CNAME</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Host:</span>
                  <span className="font-bold text-deep flex items-center gap-1">
                    @
                    <button onClick={() => copyToClipboard('@')} className="text-accent hover:text-accentDark"><Copy size={10} /></button>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Değer:</span>
                  <span className="font-bold text-deep flex items-center gap-1">
                    fsbo.app
                    <button onClick={() => copyToClipboard('fsbo.app')} className="text-accent hover:text-accentDark"><Copy size={10} /></button>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">TTL:</span>
                  <span className="font-bold text-deep">3600</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                {domainVerified ? <Check size={16} className="text-green-600" /> : <AlertTriangle size={16} className="text-amber-500" />}
                <span className="text-xs font-bold text-deep">Domain Doğrulama</span>
              </div>
              <button onClick={handleToggleDomainVerified} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                domainVerified ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}>
                {domainVerified ? 'Doğrulandı' : 'Manuel Doğrula'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-cardBorder p-5">
          <h3 className="text-sm font-extrabold text-deep mb-4 flex items-center gap-2">
            <FileText size={16} className="text-accent" />
            SEO Ayarları
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">Meta Başlık</label>
              <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="Web sitenizin başlığı" className="w-full px-3 py-2 text-xs border border-cardBorder rounded-xl focus:outline-none focus:border-accent" />
              <p className="text-[9px] text-gray-400 mt-1">{metaTitle.length}/60 karakter</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">Meta Açıklama</label>
              <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} placeholder="Web sitenizin kısa açıklaması" rows={3} className="w-full px-3 py-2 text-xs border border-cardBorder rounded-xl focus:outline-none focus:border-accent resize-none" />
              <p className="text-[9px] text-gray-400 mt-1">{metaDescription.length}/160 karakter</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-cardBorder p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-deep flex items-center gap-2">
              <Home size={16} className="text-accent" />
              İlan Yönetimi
            </h3>
            <button
              onClick={() => setShowNewListing(!showNewListing)}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors"
            >
              <Plus size={10} /> Yeni İlan
            </button>
          </div>

          {showNewListing && (
            <div className="mb-3 p-3 bg-accent/5 rounded-xl border border-accent/20 space-y-2 animate-slide-down">
              <input type="text" placeholder="İlan başlığı" value={newListing.title} onChange={e => setNewListing(p => ({ ...p, title: e.target.value }))} className="w-full px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white" />
              <div className="grid grid-cols-2 gap-2">
                <select value={newListing.type} onChange={e => setNewListing(p => ({ ...p, type: e.target.value }))} className="px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white">
                  <option value="Satılık">Satılık</option>
                  <option value="Kiralık">Kiralık</option>
                </select>
                <input type="text" placeholder="Fiyat (ör: 5.000.000 ₺)" value={newListing.price} onChange={e => setNewListing(p => ({ ...p, price: e.target.value }))} className="px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Alan (ör: 120 m²)" value={newListing.area} onChange={e => setNewListing(p => ({ ...p, area: e.target.value }))} className="px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white" />
                <input type="text" placeholder="Oda (ör: 3+1)" value={newListing.rooms} onChange={e => setNewListing(p => ({ ...p, rooms: e.target.value }))} className="px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddListing} className="flex-1 px-3 py-1.5 text-[10px] font-bold text-deep bg-accent rounded-lg hover:bg-accentLight transition-colors">Ekle</button>
                <button onClick={() => setShowNewListing(false)} className="px-3 py-1.5 text-[10px] font-bold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">İptal</button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            {listings.map(listing => (
              <div key={listing.id} className="border border-cardBorder rounded-xl overflow-hidden bg-white">
                <div
                  className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedListing(expandedListing === listing.id ? null : listing.id)}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: listing.type === 'Satılık' ? '#d1fae5' : '#dbeafe' }}>
                    <Home size={14} style={{ color: listing.type === 'Satılık' ? '#059669' : '#3b82f6' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-deep truncate">{listing.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold" style={{ color: listing.type === 'Satılık' ? '#059669' : '#3b82f6' }}>{listing.price}</span>
                      {listing.area && <span className="text-[9px] text-gray-400">{listing.area}</span>}
                      {listing.rooms && <span className="text-[9px] text-gray-400">{listing.rooms}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={e => { e.stopPropagation(); handleRemoveListing(listing.id) }}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                    {expandedListing === listing.id ? <ChevronUp size={12} className="text-gray-400" /> : <ChevronDown size={12} className="text-gray-400" />}
                  </div>
                </div>

                {expandedListing === listing.id && (
                  <div className="p-3 border-t border-cardBorder bg-gray-50/50 space-y-2 animate-slide-down">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 mb-0.5 block">İlan Başlığı</label>
                        <input type="text" value={listing.title} onChange={e => handleUpdateListing(listing.id, { title: e.target.value })} className="w-full px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 mb-0.5 block">Tür</label>
                        <select value={listing.type} onChange={e => handleUpdateListing(listing.id, { type: e.target.value })} className="w-full px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white">
                          <option value="Satılık">Satılık</option>
                          <option value="Kiralık">Kiralık</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 mb-0.5 block">Fiyat</label>
                        <input type="text" value={listing.price} onChange={e => handleUpdateListing(listing.id, { price: e.target.value })} className="w-full px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 mb-0.5 block">Alan</label>
                        <input type="text" value={listing.area || ''} onChange={e => handleUpdateListing(listing.id, { area: e.target.value })} className="w-full px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 mb-0.5 block">Oda</label>
                        <input type="text" value={listing.rooms || ''} onChange={e => handleUpdateListing(listing.id, { rooms: e.target.value })} className="w-full px-2.5 py-1.5 text-[11px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {listings.length === 0 && !showNewListing && (
            <div className="text-center py-8">
              <Home size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-[11px] text-gray-400 font-medium">Henüz ilan eklenmedi</p>
              <button onClick={() => setShowNewListing(true)} className="mt-2 text-[10px] font-bold text-accent hover:underline">
                + İlk ilanı ekle
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-cardBorder p-5">
          <h3 className="text-sm font-extrabold text-deep mb-4 flex items-center gap-2">
            <Rocket size={16} className="text-accent" />
            Yönetim
          </h3>
          <div className="space-y-3">
            {website.status === 'published' && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-green-600" />
                  <div>
                    <p className="text-xs font-bold text-green-800">Site Yayında</p>
                    <a href={`/site/${website.slug}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-green-600 hover:underline flex items-center gap-1">
                      /site/{website.slug} <ExternalLink size={9} />
                    </a>
                  </div>
                </div>
                <button onClick={handleUnpublish} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors flex items-center gap-1">
                  <EyeOff size={10} />
                  Yayından Kaldır
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleEditInBuilder} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-deep border border-cardBorder hover:bg-gray-50 transition-colors">
                <Settings size={14} />
                Builder&apos;da Düzenle
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-deep transition-colors disabled:opacity-50" style={{ background: '#e3d10d' }}>
                {saving ? <div className="w-3 h-3 border-2 border-deep/30 border-t-deep rounded-full animate-spin" /> : <Save size={14} />}
                Kaydet
              </button>
            </div>

            <div className="pt-3 border-t border-cardBorder">
              <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors w-full justify-center">
                <Trash2 size={14} />
                Siteyi Sil
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-modal-fade" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-red-100">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-extrabold text-deep text-center mb-2">Siteyi Sil</h3>
            <p className="text-xs text-gray-500 text-center mb-5">Bu işlem geri alınamaz. Site ve tüm içeriği kalıcı olarak silinecektir.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 border border-cardBorder hover:bg-gray-50 transition-colors">
                İptal
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                {deleting ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={12} />}
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
