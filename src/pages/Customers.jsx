import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '../hooks/useCustomers'
import { useCustomerListings } from '../hooks/useCustomerListings'
import { useApp } from '../context/AppContext'
import { TabContext } from '../App'
import { properties } from '../data/properties'
import { MY_LISTINGS_ID } from '../data/lists'
import {
  Plus, Search, Pencil, Trash2, X, AlertTriangle,
  Building2, Briefcase, Mail, Phone, FileText, User,
  Clock, ExternalLink, ChevronDown, ChevronRight, Home, Calendar
} from 'lucide-react'
import { formatDate } from '../utils/format'

const SECTORS = [
  'Gayrimenkul', 'İnşaat', 'Finans', 'Tekstil', 'Otomotiv',
  'Teknoloji', 'Sağlık', 'Eğitim', 'Turizm', 'Diğer'
]

const initialForm = {
  ad: '', soyad: '', email: '', telefon: '',
  sirket: '', sektor: '', notlar: ''
}

export default function Customers() {
  const navigate = useNavigate()
  const { setActiveTab, setTabParams } = useContext(TabContext)
  const { customers, loading, create, update, remove } = useCustomers()
  const { getListingsForCustomer, associate, disassociate } = useCustomerListings()
  const { addToast, lists } = useApp()

  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [expandedCust, setExpandedCust] = useState(null)
  const [showListingPicker, setShowListingPicker] = useState(null)

  const myListingIds = lists[MY_LISTINGS_ID]?.items || []
  const availableListings = myListingIds.map(id => properties[id]).filter(Boolean)

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    return c.ad.toLowerCase().includes(q) ||
      c.soyad.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.sirket || '').toLowerCase().includes(q) ||
      (c.sektor || '').toLowerCase().includes(q)
  })

  const validate = () => {
    const errs = {}
    if (!form.ad.trim()) errs.ad = 'Ad gerekli'
    if (!form.soyad.trim()) errs.soyad = 'Soyad gerekli'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Geçerli bir e-posta girin'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const resetForm = () => {
    setForm(initialForm)
    setFieldErrors({})
  }

  const handleCreate = async () => {
    if (!validate()) return
    try {
      await create({ ...form, ad: form.ad.trim(), soyad: form.soyad.trim() })
      addToast(`"${form.ad} ${form.soyad}" müşterisi eklendi`)
      setShowCreate(false)
      resetForm()
    } catch {
      addToast('Müşteri eklenirken hata oluştu', 'warning')
    }
  }

  const handleEditOpen = (customer) => {
    setEditingId(customer.id)
    setForm({
      ad: customer.ad,
      soyad: customer.soyad,
      email: customer.email || '',
      telefon: customer.telefon || '',
      sirket: customer.sirket || '',
      sektor: customer.sektor || '',
      notlar: customer.notlar || '',
    })
    setFieldErrors({})
    setShowEdit(true)
  }

  const handleEdit = async () => {
    if (!editingId || !validate()) return
    try {
      await update(editingId, { ...form, ad: form.ad.trim(), soyad: form.soyad.trim() })
      addToast('Müşteri güncellendi')
      setShowEdit(false)
      setEditingId(null)
      resetForm()
    } catch {
      addToast('Müşteri güncellenirken hata oluştu', 'warning')
    }
  }

  const handleDeleteOpen = (customer) => {
    setEditingId(customer.id)
    setShowDelete(true)
  }

  const handleDelete = async () => {
    if (!editingId) return
    try {
      await remove(editingId)
      addToast('Müşteri silindi', 'warning')
      setShowDelete(false)
      setEditingId(null)
    } catch {
      addToast('Müşteri silinirken hata oluştu', 'warning')
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setShowCreate(false)
        if (showEdit) { setShowEdit(false); setEditingId(null); resetForm() }
        if (showDelete) { setShowDelete(false); setEditingId(null) }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showEdit, showDelete])

  return (
    <div className="flex flex-col min-h-0">
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-10 flex flex-col min-h-0">

        <div className="flex items-center justify-between mb-5 lg:mb-6 animate-fade-up">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight" style={{ color: '#1e1b2e' }}>Müşteriler</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {customers.length} müşteri
            </p>
          </div>
          <button
            className="px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg"
            style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 4px 16px rgba(227,209,13,.2)' }}
            onClick={() => { resetForm(); setShowCreate(true) }}
          >
            <Plus size={14} strokeWidth={3} />
            <span className="hidden sm:inline">Yeni Müşteri</span>
          </button>
        </div>

        <div className="relative mb-5 animate-fade-up" style={{ animationDelay: '.04s' }}>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-cardBorder bg-white text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200"
            style={{ color: '#1e1b2e' }}
            placeholder="Müşteri ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 animate-fade">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm mb-5">
              <User size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-extrabold" style={{ color: '#1e1b2e' }}>
              {search ? 'Eşleşen müşteri bulunamadı' : 'Henüz müşteri yok'}
            </h3>
            <p className="text-sm text-gray-400 font-medium mt-1 max-w-xs">
              {search ? 'Farklı bir arama terimi deneyin.' : 'İlk müşterinizi ekleyerek başlayın.'}
            </p>
            {!search && (
              <button
                className="mt-5 px-6 py-3 rounded-2xl text-sm font-extrabold flex items-center gap-2 shadow-lg"
                style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 4px 16px rgba(227,209,13,.2)' }}
                onClick={() => { resetForm(); setShowCreate(true) }}
              >
                <Plus size={16} strokeWidth={3} />
                İlk Müşteriyi Ekle
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '.06s' }}>
            {filtered.map((customer, i) => (
              <div
                key={customer.id}
                className="bg-white rounded-2xl border border-cardBorder overflow-hidden shadow-sm opacity-0"
                style={{ animation: `fadeInUp .4s ease-out ${i * 0.04}s forwards` }}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(227,209,13,.15)' }}
                        >
                          <Building2 size={16} style={{ color: '#e3d10d' }} />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold truncate" style={{ color: '#1e1b2e' }}>
                            {customer.ad} {customer.soyad}
                          </h3>
                          {customer.sirket && (
                            <p className="text-[11px] font-semibold text-gray-400 truncate">{customer.sirket}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        className="w-8 h-8 rounded-xl bg-white border border-cardBorder flex items-center justify-center btn shadow-sm hover:bg-cream"
                        aria-label="Randevu Oluştur"
                        onClick={() => {
                          setTabParams({ quickAddCustomerId: customer.id })
                          setActiveTab('randevular')
                          navigate('/')
                        }}
                        title="Randevu Oluştur"
                      >
                        <Calendar size={13} className="text-gray-400 hover:text-deep transition-colors" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-xl bg-white border border-cardBorder flex items-center justify-center btn shadow-sm"
                        aria-label="Müşteriyi düzenle"
                        onClick={() => handleEditOpen(customer)}
                      >
                        <Pencil size={13} className="text-gray-400" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-xl bg-white border border-red-200 flex items-center justify-center btn shadow-sm hover:border-red-300"
                        aria-label="Müşteriyi sil"
                        onClick={() => handleDeleteOpen(customer)}
                      >
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <Mail size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.telefon && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <Phone size={12} className="text-gray-400 flex-shrink-0" />
                        <span>{customer.telefon}</span>
                      </div>
                    )}
                    {customer.sektor && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <Briefcase size={12} className="text-gray-400 flex-shrink-0" />
                        <span>{customer.sektor}</span>
                      </div>
                    )}
                  </div>

                  {customer.notlar && (
                    <div className="flex items-start gap-2 mt-2 text-xs text-gray-400 font-medium">
                      <FileText size={12} className="text-gray-300 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{customer.notlar}</span>
                    </div>
                  )}

                  {/* ASSOCIATED LISTINGS */}
                  {(() => {
                    const listings = getListingsForCustomer(customer.id)
                    const isExpanded = expandedCust === customer.id
                    return (
                      <div className="mt-2.5 border-t border-cardBorder pt-2.5">
                        <div className="flex items-center justify-between">
                          <button
                            className={`flex items-center gap-1.5 text-[10px] font-bold btn ${listings.length > 0 ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400'}`}
                            onClick={() => listings.length > 0 && setExpandedCust(isExpanded ? null : customer.id)}
                          >
                            {listings.length > 0 ? (isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : <Home size={12} />}
                            {listings.length > 0 ? `İlişkili İlanlar (${listings.length})` : 'İlan İlişkilendir'}
                          </button>
                          <button
                            className="text-[10px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg btn hover:bg-emerald-50 transition-all"
                            style={{ color: '#059669' }}
                            onClick={() => setShowListingPicker(customer.id)}
                          >
                            <Plus size={11} />
                            İlan Ekle
                          </button>
                        </div>
                        {isExpanded && listings.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {listings.map(({ ilanId, not }) => {
                              const prop = properties[ilanId]
                              if (!prop) return null
                              return (
                                <div
                                  key={ilanId}
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-100"
                                >
                                  <div
                                    className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer btn"
                                    onClick={() => navigate(`/ilan/${ilanId}?from=ilanlarim`)}
                                  >
                                    <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-100">
                                      <img src={prop.img} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[11px] font-bold truncate" style={{ color: '#1e1b2e' }}>{prop.title}</p>
                                      {not && <p className="text-[9px] text-gray-400 font-medium truncate">{not}</p>}
                                    </div>
                                    <ExternalLink size={10} className="text-gray-300 flex-shrink-0" />
                                  </div>
                                  <button
                                    className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-50 btn flex-shrink-0"
                                    onClick={() => { disassociate(customer.id, ilanId); addToast('İlan ilişkisi kaldırıldı') }}
                                  >
                                    <X size={11} className="text-gray-400" />
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-gray-400 font-medium">
                    <Clock size={10} />
                    <span>{formatDate(customer.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== CREATE MODAL ===== */}
      {showCreate && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-modal-fade" onClick={() => setShowCreate(false)}>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold" style={{ color: '#1e1b2e' }}>Yeni Müşteri</h3>
              <button className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center" onClick={() => setShowCreate(false)}>
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Ad *</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200 ${fieldErrors.ad ? 'border-red-300' : 'border-cardBorder'}`}
                    style={{ color: '#1e1b2e' }}
                    placeholder="Ad"
                    value={form.ad}
                    autoFocus
                    onChange={e => setForm({ ...form, ad: e.target.value })}
                  />
                  {fieldErrors.ad && <p className="text-xs text-red-400 font-medium mt-1">{fieldErrors.ad}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Soyad *</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200 ${fieldErrors.soyad ? 'border-red-300' : 'border-cardBorder'}`}
                    style={{ color: '#1e1b2e' }}
                    placeholder="Soyad"
                    value={form.soyad}
                    onChange={e => setForm({ ...form, soyad: e.target.value })}
                  />
                  {fieldErrors.soyad && <p className="text-xs text-red-400 font-medium mt-1">{fieldErrors.soyad}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">E-posta</label>
                  <input
                    type="email"
                    className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200 ${fieldErrors.email ? 'border-red-300' : 'border-cardBorder'}`}
                    style={{ color: '#1e1b2e' }}
                    placeholder="ornek@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                  {fieldErrors.email && <p className="text-xs text-red-400 font-medium mt-1">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Telefon</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200"
                    style={{ color: '#1e1b2e' }}
                    placeholder="05XX XXX XX XX"
                    value={form.telefon}
                    onChange={e => setForm({ ...form, telefon: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Şirket Adı</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200"
                    style={{ color: '#1e1b2e' }}
                    placeholder="Şirket adı"
                    value={form.sirket}
                    onChange={e => setForm({ ...form, sirket: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Sektör</label>
                  <select
                    className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200"
                    style={{ color: '#1e1b2e' }}
                    value={form.sektor}
                    onChange={e => setForm({ ...form, sektor: e.target.value })}
                  >
                    <option value="">Sektör seçin</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Notlar</label>
                <textarea
                  className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold resize-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200"
                  style={{ color: '#1e1b2e' }}
                  placeholder="Müşteri hakkında notlar..."
                  rows={3}
                  value={form.notlar}
                  onChange={e => setForm({ ...form, notlar: e.target.value })}
                />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button className="flex-1 py-3 rounded-2xl text-xs font-extrabold border-2 border-cardBorder btn" style={{ color: '#1e1b2e' }} onClick={() => setShowCreate(false)}>İptal</button>
                <button
                  className="flex-1 py-3 rounded-2xl text-xs font-extrabold shadow-lg btn"
                  style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
                  onClick={handleCreate}
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      {showEdit && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-modal-fade" onClick={() => { setShowEdit(false); setEditingId(null); resetForm() }}>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold" style={{ color: '#1e1b2e' }}>Müşteriyi Düzenle</h3>
              <button className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center" onClick={() => { setShowEdit(false); setEditingId(null); resetForm() }}>
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Ad *</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200 ${fieldErrors.ad ? 'border-red-300' : 'border-cardBorder'}`}
                    style={{ color: '#1e1b2e' }}
                    value={form.ad}
                    autoFocus
                    onChange={e => setForm({ ...form, ad: e.target.value })}
                  />
                  {fieldErrors.ad && <p className="text-xs text-red-400 font-medium mt-1">{fieldErrors.ad}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Soyad *</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200 ${fieldErrors.soyad ? 'border-red-300' : 'border-cardBorder'}`}
                    style={{ color: '#1e1b2e' }}
                    value={form.soyad}
                    onChange={e => setForm({ ...form, soyad: e.target.value })}
                  />
                  {fieldErrors.soyad && <p className="text-xs text-red-400 font-medium mt-1">{fieldErrors.soyad}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">E-posta</label>
                  <input
                    type="email"
                    className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200 ${fieldErrors.email ? 'border-red-300' : 'border-cardBorder'}`}
                    style={{ color: '#1e1b2e' }}
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                  {fieldErrors.email && <p className="text-xs text-red-400 font-medium mt-1">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Telefon</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200"
                    style={{ color: '#1e1b2e' }}
                    value={form.telefon}
                    onChange={e => setForm({ ...form, telefon: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Şirket Adı</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200"
                    style={{ color: '#1e1b2e' }}
                    value={form.sirket}
                    onChange={e => setForm({ ...form, sirket: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Sektör</label>
                  <select
                    className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200"
                    style={{ color: '#1e1b2e' }}
                    value={form.sektor}
                    onChange={e => setForm({ ...form, sektor: e.target.value })}
                  >
                    <option value="">Sektör seçin</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Notlar</label>
                <textarea
                  className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold resize-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200"
                  style={{ color: '#1e1b2e' }}
                  rows={3}
                  value={form.notlar}
                  onChange={e => setForm({ ...form, notlar: e.target.value })}
                />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button className="flex-1 py-3 rounded-2xl text-xs font-extrabold border-2 border-cardBorder btn" style={{ color: '#1e1b2e' }} onClick={() => { setShowEdit(false); setEditingId(null); resetForm() }}>İptal</button>
                <button
                  className="flex-1 py-3 rounded-2xl text-xs font-extrabold shadow-lg btn"
                  style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
                  onClick={handleEdit}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE MODAL ===== */}
      {showDelete && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-modal-fade" onClick={() => { setShowDelete(false); setEditingId(null) }}>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-scale-in text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-softPink flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <h3 className="text-lg font-extrabold mb-1" style={{ color: '#1e1b2e' }}>Müşteriyi Sil</h3>
            <p className="text-sm text-gray-400 font-medium mb-5">
              Bu müşteriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-2.5">
              <button className="flex-1 py-3 rounded-2xl text-xs font-extrabold border-2 border-cardBorder btn" style={{ color: '#1e1b2e' }} onClick={() => { setShowDelete(false); setEditingId(null) }}>İptal</button>
              <button className="flex-1 py-3 rounded-2xl text-xs font-extrabold text-white btn" style={{ background: '#dc2626' }} onClick={handleDelete}>Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== LISTING PICKER MODAL ===== */}
      {showListingPicker && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-modal-fade" onClick={() => setShowListingPicker(null)}>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold" style={{ color: '#1e1b2e' }}>İlan Ekle</h3>
              <button className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center" onClick={() => setShowListingPicker(null)}>
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {availableListings.length === 0 ? (
                <p className="text-xs text-gray-400 font-medium text-center py-6">
                  Portföyüm&apos;de hiç ilan yok. Önce ilan ekleyin.
                </p>
              ) : (
                availableListings.map(prop => {
                  const existing = getListingsForCustomer(showListingPicker)
                  const isAssoc = existing.some(a => a.ilanId === prop.id)
                  return (
                    <button
                      key={prop.id}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold btn transition-all ${
                        isAssoc ? 'opacity-40 pointer-events-none' : ''
                      }`}
                      style={{ color: '#1e1b2e', border: isAssoc ? '2px solid #e0e0e0' : '2px solid transparent' }}
                      disabled={isAssoc}
                      onClick={() => {
                        associate(showListingPicker, prop.id)
                        addToast(`"${prop.title}" müşteriyle ilişkilendirildi`)
                        setShowListingPicker(null)
                      }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-100">
                        <img src={prop.img} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-bold truncate">{prop.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium truncate">{prop.location}</p>
                      </div>
                      {isAssoc && <span className="text-[10px] text-gray-400 font-medium flex-shrink-0">Zaten ilişkili</span>}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
