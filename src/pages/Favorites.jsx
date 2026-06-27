import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePropertyData } from '../context/PropertiesContext'
import { useApp } from '../context/AppContext'
import {
  Plus, ArrowLeft, Clock, ArrowUpDown, Heart,
  MapPin, Pencil, Trash2, Inbox, Compass,
  ExternalLink, Phone, X, AlertTriangle,
  Layers, MoveVertical, Maximize, Calendar
} from 'lucide-react'

export default function Favorites() {
  const navigate = useNavigate()
  const { properties } = usePropertyData()
  const { addToast, lists, createList, editList, deleteList, removeFromList } = useApp()

  const [view, setView] = useState('lists')
  const [currentListId, setCurrentListId] = useState(null)
  const [previewProp, setPreviewProp] = useState(null)

  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [listName, setListName] = useState('')
  const [listDesc, setListDesc] = useState('')
  const [editingId, setEditingId] = useState(null)

  const listArr = Object.values(lists)
  const currentList = currentListId ? lists[currentListId] : null

  const goToList = (id) => {
    setCurrentListId(id)
    setView('detail')
  }

  const goBack = () => {
    setCurrentListId(null)
    setView('lists')
  }

  const handleCreate = () => {
    if (listName.trim().length < 2) return
    createList(listName.trim(), listDesc.trim())
    addToast(`"${listName.trim()}" listesi oluşturuldu`)
    setShowCreate(false)
    setListName('')
    setListDesc('')
  }

  const handleEditOpen = () => {
    if (!currentList) return
    setEditingId(currentList.id)
    setListName(currentList.name)
    setListDesc(currentList.desc || '')
    setShowEdit(true)
  }

  const handleEdit = () => {
    if (!editingId || listName.trim().length < 2) return
    editList(editingId, listName.trim(), listDesc.trim())
    addToast('Liste güncellendi')
    setShowEdit(false)
    setEditingId(null)
    setListName('')
    setListDesc('')
  }

  const handleDeleteOpen = () => {
    if (!currentList) return
    setEditingId(currentList.id)
    setShowDelete(true)
  }

  const handleDelete = () => {
    if (!editingId) return
    const name = lists[editingId]?.name
    deleteList(editingId)
    addToast(`"${name}" listesi silindi`, 'warning')
    setShowDelete(false)
    setEditingId(null)
    goBack()
  }

  const openPreview = (prop) => {
    setPreviewProp(prop)
    document.body.style.overflow = 'hidden'
  }

  const closePreview = () => {
    setPreviewProp(null)
    document.body.style.overflow = ''
  }

  const goToDetail = (propId) => {
    closePreview()
    navigate(`/ilan/${propId}`)
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (previewProp) closePreview()
        if (showCreate) setShowCreate(false)
        if (showEdit) { setShowEdit(false); setEditingId(null) }
        if (showDelete) { setShowDelete(false); setEditingId(null) }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [previewProp, showCreate, showEdit, showDelete])

  return (
    <div className="flex flex-col min-h-0">
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-10 flex flex-col min-h-0">

        {/* ===== LISTS VIEW ===== */}
        {view === 'lists' && (
          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-5 lg:mb-6 animate-fade-up">
              <div>
                <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight" style={{ color: '#1e1b2e' }}>Listelerim</h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  {listArr.length} liste · {listArr.reduce((s, l) => s + (l.items?.length || 0), 0)} ilan
                </p>
              </div>
              <button
                className="px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg"
                style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 4px 16px rgba(227,209,13,.2)' }}
                onClick={() => { setListName(''); setListDesc(''); setShowCreate(true) }}
              >
                <Plus size={14} strokeWidth={3} />
                <span className="hidden sm:inline">Yeni Liste</span>
              </button>
            </div>

            {listArr.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 animate-fade">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm mb-5">
                  <Heart size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-extrabold" style={{ color: '#1e1b2e' }}>Henüz listeniz yok</h3>
                <p className="text-sm text-gray-400 font-medium mt-1 max-w-xs">Favori ilanlarınızı gruplamak için liste oluşturun.</p>
                <button
                  className="mt-5 px-6 py-3 rounded-2xl text-sm font-extrabold flex items-center gap-2 shadow-lg"
                  style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 4px 16px rgba(227,209,13,.2)' }}
                  onClick={() => { setListName(''); setListDesc(''); setShowCreate(true) }}
                >
                  <Plus size={16} strokeWidth={3} />
                  İlk Listeyi Oluştur
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {listArr.map((list, i) => {
                  const itemProps = (list.items || []).map(id => properties[id]).filter(Boolean)
                  const previewImages = itemProps.slice(0, 3)
                  const extraCount = itemProps.length - 3
                  return (
                    <div
                      key={list.id}
                      className="list-card bg-white rounded-2xl border border-cardBorder overflow-hidden shadow-sm opacity-0"
                      style={{ animation: `listCardIn .45s cubic-bezier(.32,.72,0,1) ${i * 0.06}s forwards` }}
                      onClick={() => goToList(list.id)}
                    >
                      <div className="p-4">
                        {previewImages.length > 0 ? (
                          <div className="flex gap-1 h-28">
                            {previewImages.map((prop, pi) => (
                              <div key={prop.id} className={`flex-1 overflow-hidden bg-gray-100 relative ${pi === 0 ? 'rounded-l-2xl' : ''} ${pi === previewImages.length - 1 && extraCount <= 0 ? 'rounded-r-2xl' : ''}`}>
                                <img src={prop.img} alt="" className="w-full h-full object-cover preview-thumb" />
                                {pi === previewImages.length - 1 && extraCount > 0 && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="text-white text-xs font-extrabold">+{extraCount}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-28 bg-cream flex items-center justify-center rounded-2xl">
                            <Inbox size={36} className="text-gray-300" />
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <h3 className="text-sm font-extrabold truncate" style={{ color: '#1e1b2e' }}>{list.name}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2" style={{ background: itemProps.length > 0 ? 'rgba(227,209,13,.2)' : '#f0ece6', color: '#1e1b2e' }}>{itemProps.length} ilan</span>
                        </div>
                        {list.desc && <p className="text-xs text-gray-400 font-medium mt-1 truncate">{list.desc}</p>}
                        <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-gray-400 font-medium">
                          <Clock size={10} />
                          <span>Son güncellenen: az önce</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== LIST DETAIL VIEW ===== */}
        {view === 'detail' && currentList && (
          <div className="flex flex-col min-h-0">
            <div className="flex items-center gap-3 mb-5 lg:mb-6 animate-fade-up">
              <button
                className="back-btn w-8 h-8 rounded-xl bg-white border border-cardBorder flex items-center justify-center flex-shrink-0 shadow-sm"
                aria-label="Listelere dön"
                onClick={goBack}
              >
                <ArrowLeft size={16} className="text-gray-500" />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight truncate" style={{ color: '#1e1b2e' }}>{currentList.name}</h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  {(currentList.items || []).length} ilan · <span className="text-gray-300">{currentList.desc || 'açıklama yok'}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="w-9 h-9 rounded-xl bg-white border border-cardBorder flex items-center justify-center btn shadow-sm"
                  aria-label="Listeyi düzenle"
                  onClick={handleEditOpen}
                >
                  <Pencil size={15} className="text-gray-400" />
                </button>
                <button
                  className="w-9 h-9 rounded-xl bg-white border border-red-200 flex items-center justify-center btn shadow-sm hover:border-red-300"
                  aria-label="Listeyi sil"
                  onClick={handleDeleteOpen}
                >
                  <Trash2 size={15} className="text-red-400" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 animate-fade-up" style={{ animationDelay: '.06s' }}>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <Clock size={12} />
                <span>Son eklenen</span>
              </div>
              <button
                className="text-xs font-bold flex items-center gap-1 btn"
                style={{ color: '#1e1b2e' }}
                onClick={() => addToast('Sıralama değiştirildi')}
              >
                <ArrowUpDown size={12} />
                Sırala
              </button>
            </div>

            {(!currentList.items || currentList.items.length === 0) ? (
              <div className="flex flex-col items-center justify-center text-center py-10 animate-fade">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm mb-5">
                  <Inbox size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-extrabold" style={{ color: '#1e1b2e' }}>Liste boş</h3>
                <p className="text-sm text-gray-400 font-medium mt-1 max-w-xs">Bu listede henüz ilan bulunmuyor. Keşfet sayfasından ilan ekleyebilirsiniz.</p>
                <button
                  className="btn mt-5 px-6 py-3 rounded-2xl text-sm font-extrabold flex items-center gap-2 shadow-lg"
                  style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 4px 16px rgba(227,209,13,.2)' }}
                  onClick={() => navigate('/')}
                >
                  <Compass size={16} />
                  Keşfet'e Git
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {currentList.items.map((propId, i) => {
                  const prop = properties[propId]
                  if (!prop) return null
                  return (
                    <div
                      key={prop.id}
                      className="listing-card bg-white rounded-2xl border border-cardBorder overflow-hidden shadow-sm opacity-0"
                      style={{ animation: `fadeInUp .4s ease-out ${i * 0.06}s forwards` }}
                      onClick={() => openPreview(prop)}
                    >
                      <div className="card-img relative h-48 sm:h-52 overflow-hidden bg-gray-100 rounded-t-2xl">
                        <img src={prop.img} alt={prop.title} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          {prop.badge && <span className="tag px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 backdrop-blur-sm" style={{ color: '#1e1b2e' }}>{prop.badge}</span>}
                        </div>
                        <button
                          className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm flex items-center gap-1"
                          style={{ color: '#dc2626' }}
                          aria-label="Listeden çıkar"
                          onClick={(e) => { e.stopPropagation(); removeFromList(currentListId, prop.id); addToast(`"${prop.title}" "${currentList.name}" listesinden çıkarıldı`) }}
                        >
                          <span className="text-[10px] font-extrabold">Çıkar</span>
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
                        <div className="flex items-center gap-2 text-[10px] font-semibold">
                          {prop.status === 'Aktif'
                            ? <span className="px-2 py-0.5 rounded-lg bg-softMint text-emerald-700">Aktif</span>
                            : <span className="px-2 py-0.5 rounded-lg bg-softPink text-red-600">Pasif</span>
                          }
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-400">{prop.time}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== CREATE LIST MODAL ===== */}
      {showCreate && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-modal-fade" onClick={() => setShowCreate(false)}>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold" style={{ color: '#1e1b2e' }}>Yeni Liste Oluştur</h3>
              <button className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center" onClick={() => setShowCreate(false)}>
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Liste Adı</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200"
                  style={{ color: '#1e1b2e' }}
                  placeholder="Örn: Hayalimdeki Evler"
                  maxLength={40}
                  value={listName}
                  autoFocus
                  onChange={e => setListName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && listName.trim().length >= 2) handleCreate() }}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Açıklama (isteğe bağlı)</label>
                <textarea
                  className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold resize-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200"
                  style={{ color: '#1e1b2e' }}
                  placeholder="Liste hakkında kısa bir not..."
                  rows={3}
                  maxLength={120}
                  value={listDesc}
                  onChange={e => setListDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button className="flex-1 py-3 rounded-2xl text-xs font-extrabold border-2 border-cardBorder btn" style={{ color: '#1e1b2e' }} onClick={() => setShowCreate(false)}>İptal</button>
                <button
                  className={`flex-1 py-3 rounded-2xl text-xs font-extrabold shadow-lg btn ${listName.trim().length < 2 ? 'opacity-40 pointer-events-none' : ''}`}
                  style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
                  disabled={listName.trim().length < 2}
                  onClick={handleCreate}
                >
                  Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT LIST MODAL ===== */}
      {showEdit && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-modal-fade" onClick={() => { setShowEdit(false); setEditingId(null) }}>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold" style={{ color: '#1e1b2e' }}>Listeyi Düzenle</h3>
              <button className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center" onClick={() => { setShowEdit(false); setEditingId(null) }}>
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Liste Adı</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200"
                  style={{ color: '#1e1b2e' }}
                  maxLength={40}
                  value={listName}
                  autoFocus
                  onChange={e => setListName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && listName.trim().length >= 2) handleEdit() }}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Açıklama (isteğe bağlı)</label>
                <textarea
                  className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold resize-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200"
                  style={{ color: '#1e1b2e' }}
                  rows={3}
                  maxLength={120}
                  value={listDesc}
                  onChange={e => setListDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button className="flex-1 py-3 rounded-2xl text-xs font-extrabold border-2 border-cardBorder btn" style={{ color: '#1e1b2e' }} onClick={() => { setShowEdit(false); setEditingId(null) }}>İptal</button>
                <button
                  className={`flex-1 py-3 rounded-2xl text-xs font-extrabold shadow-lg btn ${listName.trim().length < 2 ? 'opacity-40 pointer-events-none' : ''}`}
                  style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
                  disabled={listName.trim().length < 2}
                  onClick={handleEdit}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE LIST MODAL ===== */}
      {showDelete && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-modal-fade" onClick={() => { setShowDelete(false); setEditingId(null) }}>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-scale-in text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-softPink flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <h3 className="text-lg font-extrabold mb-1" style={{ color: '#1e1b2e' }}>Listeyi Sil</h3>
            <p className="text-sm text-gray-400 font-medium mb-5">"{currentList?.name}" listesini silmek istediğinize emin misiniz?</p>
            <div className="flex gap-2.5">
              <button className="flex-1 py-3 rounded-2xl text-xs font-extrabold border-2 border-cardBorder btn" style={{ color: '#1e1b2e' }} onClick={() => { setShowDelete(false); setEditingId(null) }}>İptal</button>
              <button className="flex-1 py-3 rounded-2xl text-xs font-extrabold text-white btn" style={{ background: '#dc2626' }} onClick={handleDelete}>Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PREVIEW BOTTOM SHEET ===== */}
      {previewProp && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm animate-modal-fade" onClick={closePreview}>
          <div className="absolute inset-0" onClick={closePreview}></div>
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-white rounded-t-[28px] shadow-2xl animate-modal-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 flex items-center justify-between px-5 pt-4 pb-3 border-b border-cardBorder rounded-t-[28px]">
              <h3 className="text-base font-extrabold tracking-tight truncate flex-1" style={{ color: '#1e1b2e' }}>{previewProp.title}</h3>
              <button className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center flex-shrink-0 ml-3" onClick={closePreview}>
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="relative h-48 rounded-2xl overflow-hidden bg-gray-100">
                <img src={previewProp.img} alt={previewProp.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-white text-xl font-black drop-shadow-lg">{previewProp.price}</span>
                  {previewProp.badge && (
                    <><br /><span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-white/90 backdrop-blur-sm inline-block mt-1" style={{ color: '#1e1b2e' }}>{previewProp.badge}</span></>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Oda Sayısı', value: previewProp.rooms, icon: Layers },
                  { label: 'Bulunduğu Kat', value: previewProp.floor, icon: MoveVertical },
                  { label: 'Metrekare', value: previewProp.size, icon: Maximize },
                  { label: 'Bina Yaşı', value: previewProp.age, icon: Calendar },
                ].map(d => {
                  const Icon = d.icon
                  return (
                    <div key={d.label} className="bg-cream rounded-xl p-3 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Icon size={14} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400">{d.label}</p>
                        <p className="text-xs font-bold" style={{ color: '#1e1b2e' }}>{d.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <MapPin size={13} />
                <span>{previewProp.location}</span>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed">{previewProp.desc}</p>

              <div className="flex gap-2.5 pt-1">
                <button
                  className="flex-1 py-3 rounded-2xl text-xs font-extrabold shadow-lg flex items-center justify-center gap-2"
                  style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
                  onClick={() => goToDetail(previewProp.id)}
                >
                  <ExternalLink size={15} strokeWidth={2.5} />
                  Detaylara Git
                </button>
                <button
                  className="flex-1 py-3 rounded-2xl text-xs font-extrabold border-2 border-cardBorder btn flex items-center justify-center gap-2"
                  style={{ color: '#1e1b2e' }}
                  onClick={() => addToast('İlan sahibi aranıyor...')}
                >
                  <Phone size={15} />
                  Ara
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
