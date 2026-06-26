import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { properties } from '../data/properties'
import { useApp } from '../context/AppContext'
import { useCustomers } from '../hooks/useCustomers'
import { useCustomerListings } from '../hooks/useCustomerListings'
import { MY_LISTINGS_ID } from '../data/lists'
import {
  Bookmark, MapPin, Compass,
  ExternalLink, Trash2, Layers, MoveVertical,
  Maximize, Calendar, Edit3, X,
  StickyNote, Clock, Save, UserPlus, User, XCircle,
  Sparkles, Filter, ArrowUpDown, Plus
} from 'lucide-react'

export default function MyListings() {
  const navigate = useNavigate()
  const { lists, toggleMyListing, updateItemNote, addToast } = useApp()
  const { customers } = useCustomers()
  const { getCustomersForListing, associate, disassociate } = useCustomerListings()

  const myList = lists[MY_LISTINGS_ID]
  const items = myList?.items || []
  const notes = myList?.notes || {}

  const [editingNote, setEditingNote] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [showCustomerPicker, setShowCustomerPicker] = useState(null)
  const [expandedCard, setExpandedCard] = useState(null)

  const listingProps = items.map(id => properties[id]).filter(Boolean)

  const startEditNote = (propId, currentNote) => {
    setEditingNote(propId)
    setNoteText(currentNote || '')
  }

  const saveNote = (propId) => {
    const trimmed = noteText.trim()
    updateItemNote(MY_LISTINGS_ID, propId, trimmed)
    addToast(trimmed ? 'Not kaydedildi' : 'Not silindi')
    setEditingNote(null)
    setNoteText('')
  }

  const cancelEditNote = () => {
    setEditingNote(null)
    setNoteText('')
  }

  const handleRemove = (propId, title) => {
    toggleMyListing(propId)
    addToast(`"${title}" Portföyüm'den çıkarıldı`)
  }

  const toggleExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id)
  }

  return (
    <div className="flex flex-col min-h-0">
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-10 flex flex-col min-h-0">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 lg:mb-8 animate-fade-up">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md" style={{ background: '#1e1b2e' }}>
                <Sparkles size={17} strokeWidth={2.5} className="text-accent" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight" style={{ color: '#1e1b2e' }}>Portföyüm</h2>
            </div>
            <p className="text-xs text-gray-400 font-medium ml-12">
              {listingProps.length} kaydedilmiş ilan · not ekleyerek düzenleyin
            </p>
          </div>
          <button
            className="w-9 h-9 rounded-xl bg-white border border-cardBorder flex items-center justify-center btn shadow-sm"
            aria-label="Filtrele"
          >
            <Filter size={16} className="text-gray-400" />
          </button>
        </div>

        {/* EMPTY STATE */}
        {listingProps.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 animate-fade">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-sm mb-6">
              <Bookmark size={36} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-extrabold" style={{ color: '#1e1b2e' }}>Henüz ilanınız yok</h3>
            <p className="text-sm text-gray-400 font-medium mt-2 max-w-sm">
              İlan detay sayfasında <span className="font-bold" style={{ color: '#e3d10d' }}>"Portföyüme Ekle"</span> butonunu kullanarak ilanları buraya kaydedin ve notlar ekleyin.
            </p>
            <button
              className="btn mt-6 px-7 py-3.5 rounded-2xl text-sm font-extrabold flex items-center gap-2.5 shadow-lg"
              style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
              onClick={() => navigate('/')}
            >
              <Compass size={16} strokeWidth={2.5} />
              Keşfet'e Git
            </button>
          </div>
        ) : (
          <>
            {/* SORT BAR */}
            <div className="flex items-center justify-between mb-4 animate-fade-up" style={{ animationDelay: '0.04s' }}>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <Clock size={12} />
                <span>Son eklenen</span>
              </div>
              <button className="text-xs font-bold flex items-center gap-1 btn transition-all duration-200" style={{ color: '#1e1b2e' }}>
                <ArrowUpDown size={12} />
                Sırala
              </button>
            </div>

            {/* LISTING GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {listingProps.map((prop, i) => {
                const note = notes[prop.id] || ''
                const isEditing = editingNote === prop.id
                const isExpanded = expandedCard === prop.id
                const customerIds = getCustomersForListing(prop.id)
                const features = [
                  { label: 'Oda', value: prop.rooms, icon: Layers },
                  { label: 'Kat', value: prop.floor, icon: MoveVertical },
                  { label: 'm²', value: prop.size, icon: Maximize },
                  { label: 'Yaş', value: prop.age, icon: Calendar },
                ]
                return (
                  <div
                    key={prop.id}
                    className="listing-card bg-white rounded-2xl border border-cardBorder overflow-hidden shadow-sm opacity-0"
                    style={{
                      animation: `fadeInUp .4s cubic-bezier(.32,.72,0,1) ${i * 0.06}s forwards`,
                    }}
                  >
                    {/* IMAGE */}
                    <div
                      className="card-img relative h-44 overflow-hidden bg-gray-100 cursor-pointer group"
                      onClick={() => navigate(`/ilan/${prop.id}?from=portfoyum`)}
                    >
                      <img
                        src={prop.img}
                        alt={prop.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {prop.badge && (
                          <span className="tag px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 backdrop-blur-sm" style={{ color: '#1e1b2e' }}>
                            {prop.badge}
                          </span>
                        )}
                        <span className="tag px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/90 backdrop-blur-sm text-white flex items-center gap-1">
                          <Bookmark size={9} fill="white" />
                          Portföyüm
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-white text-base font-black drop-shadow-lg">{prop.price}</span>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="p-4">
                      {/* Title & Price */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3
                          className="text-sm font-extrabold leading-snug cursor-pointer hover:text-emerald-600 transition-colors"
                          style={{ color: '#1e1b2e' }}
                          onClick={() => navigate(`/ilan/${prop.id}?from=portfoyum`)}
                        >
                          {prop.title}
                        </h3>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-2.5">
                        <MapPin size={12} />
                        <span className="truncate">{prop.location}</span>
                      </div>

                      {/* Status & Meta */}
                      <div className="flex items-center gap-2 text-[10px] font-semibold mb-3">
                        {prop.status === 'Aktif'
                          ? <span className="px-2 py-0.5 rounded-lg bg-softMint text-emerald-700">Aktif</span>
                          : <span className="px-2 py-0.5 rounded-lg bg-softPink text-red-600">Pasif</span>
                        }
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400">{prop.rooms}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400">{prop.size}</span>
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-4 gap-1.5 mb-3">
                        {features.map(f => {
                          const Icon = f.icon
                          return (
                            <div key={f.label} className="bg-cream rounded-xl py-2 px-2 text-center">
                              <Icon size={12} className="text-gray-400 mx-auto mb-0.5" />
                              <p className="text-[9px] font-bold truncate" style={{ color: '#1e1b2e' }}>{f.value}</p>
                              <p className="text-[8px] text-gray-400 font-medium">{f.label}</p>
                            </div>
                          )
                        })}
                      </div>

                      {/* EXPAND TOGGLE: Notes & Customers */}
                      <div className="border-t border-cardBorder pt-2">
                        <button
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-cream transition-all text-left group"
                          onClick={() => toggleExpand(prop.id)}
                        >
                          <div className="flex items-center gap-2">
                            <StickyNote size={13} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-gray-500">NOTLARIM</span>
                            {note && (
                              <span className="text-[9px] text-gray-400 font-medium">· {note.length}kr</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {customerIds.length > 0 && (
                              <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-600">
                                <User size={9} />
                                {customerIds.length}
                              </span>
                            )}
                            <Plus
                              size={12}
                              className={`text-gray-300 transition-transform duration-200 ${isExpanded ? 'rotate-45' : ''}`}
                            />
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="space-y-3 pt-1 animate-slide-down">
                            {/* NOTES SECTION */}
                            {isEditing ? (
                              <div className="space-y-2">
                                <textarea
                                  className="w-full px-3 py-2.5 rounded-xl border-2 border-emerald-200 bg-cream text-xs font-medium resize-none outline-none focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(5,150,105,.08)] transition-all"
                                  style={{ color: '#1e1b2e' }}
                                  placeholder="Bu ilan hakkında notlarınızı yazın..."
                                  rows={3}
                                  maxLength={300}
                                  value={noteText}
                                  onChange={e => setNoteText(e.target.value)}
                                  autoFocus
                                />
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-gray-400 font-medium">{noteText.length}/300</span>
                                  <div className="flex gap-1.5">
                                    <button
                                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-cream text-gray-500 btn hover:bg-gray-200 transition-all"
                                      onClick={cancelEditNote}
                                    >
                                      <X size={12} className="mr-1 inline" />
                                      İptal
                                    </button>
                                    <button
                                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white btn flex items-center gap-1 transition-all"
                                      style={{ background: '#059669' }}
                                      onClick={() => saveNote(prop.id)}
                                    >
                                      <Save size={12} />
                                      Kaydet
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                className="w-full flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-cream hover:bg-emerald-50/80 transition-all text-left group border border-transparent hover:border-emerald-200"
                                onClick={() => startEditNote(prop.id, note)}
                              >
                                <Edit3 size={13} className="text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-emerald-500 transition-colors" />
                                <div className="flex-1 min-w-0">
                                  {note ? (
                                    <p className="text-xs text-gray-600 font-medium leading-relaxed whitespace-pre-wrap break-words">{note}</p>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-400 font-medium">Not eklemek için tıklayın...</span>
                                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">Ekle</span>
                                    </div>
                                  )}
                                </div>
                              </button>
                            )}

                            {/* CUSTOMER ASSOCIATIONS */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <User size={13} className="text-orange-500" />
                                  <span className="text-[10px] font-bold text-gray-500">MÜŞTERİLER</span>
                                  {customerIds.length > 0 && (
                                    <span className="text-[9px] text-gray-400 font-medium">{customerIds.length} kişi</span>
                                  )}
                                </div>
                                <button
                                  className="text-[10px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg btn hover:bg-orange-50 transition-all"
                                  style={{ color: '#ff6b35' }}
                                  onClick={() => setShowCustomerPicker(prop.id)}
                                >
                                  <UserPlus size={11} />
                                  Ekle
                                </button>
                              </div>
                              {customerIds.length > 0 && (
                                <div className="space-y-1.5">
                                  {customerIds.map(({ musteriId, not }) => {
                                    const c = customers.find(c => c.id === musteriId)
                                    if (!c) return null
                                    return (
                                      <div
                                        key={musteriId}
                                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-orange-50/70 border border-orange-100"
                                      >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,107,53,.15)' }}>
                                            <User size={11} style={{ color: '#ff6b35' }} />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-[11px] font-bold truncate" style={{ color: '#1e1b2e' }}>{c.ad} {c.soyad}</p>
                                            {not && <p className="text-[9px] text-gray-400 font-medium truncate">{not}</p>}
                                          </div>
                                        </div>
                                        <button
                                          className="w-5 h-5 rounded flex items-center justify-center hover:bg-orange-100 btn flex-shrink-0"
                                          onClick={() => { disassociate(musteriId, prop.id); addToast('Müşteri ilişkisi kaldırıldı') }}
                                        >
                                          <XCircle size={12} className="text-gray-400" />
                                        </button>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ACTIONS */}
                      <div className="flex gap-2 mt-3">
                        <button
                          className="flex-1 py-2.5 rounded-xl text-[11px] font-extrabold shadow-sm flex items-center justify-center gap-1.5 btn transition-all hover:brightness-95"
                          style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 4px 12px rgba(227,209,13,.2)' }}
                          onClick={() => navigate(`/ilan/${prop.id}?from=portfoyum`)}
                        >
                          <ExternalLink size={13} strokeWidth={2.5} />
                          Detaylı İncele
                        </button>
                        <button
                          className="py-2.5 px-4 rounded-xl text-[11px] font-extrabold border border-red-200 btn flex items-center justify-center gap-1.5 text-red-400 hover:bg-red-50 hover:border-red-300 transition-all"
                          onClick={() => handleRemove(prop.id, prop.title)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* CUSTOMER PICKER MODAL */}
      {showCustomerPicker && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-modal-fade" onClick={() => setShowCustomerPicker(null)}>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold" style={{ color: '#1e1b2e' }}>Müşteri Ekle</h3>
              <button className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center" onClick={() => setShowCustomerPicker(null)}>
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {customers.length === 0 ? (
                <p className="text-xs text-gray-400 font-medium text-center py-6">Henüz müşteri bulunmuyor. Önce müşteri ekleyin.</p>
              ) : (
                customers.map(c => {
                  const isAssoc = getCustomersForListing(showCustomerPicker).some(a => a.musteriId === c.id)
                  return (
                    <button
                      key={c.id}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold btn transition-all ${
                        isAssoc ? 'opacity-40 pointer-events-none' : ''
                      }`}
                      style={{ color: '#1e1b2e', border: isAssoc ? '2px solid #e0e0e0' : '2px solid transparent' }}
                      disabled={isAssoc}
                      onClick={() => {
                        associate(c.id, showCustomerPicker)
                        addToast(`"${c.ad} ${c.soyad}" ilanla ilişkilendirildi`)
                        setShowCustomerPicker(null)
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
    </div>
  )
}
