import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  Plus, X, Upload, Image, Check, Building2,
  MapPin, DollarSign, Home, Layers, MoveVertical,
  Calendar, Maximize, Send, AlertCircle, Sparkles
} from 'lucide-react'

const PLATFORMS = [
  { id: 'sahibinden', label: 'Sahibinden', color: '#2563eb', bg: '#eff6ff' },
  { id: 'hepsiemlak', label: 'HepsiEmlak', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'emlakjet', label: 'EmlakJet', color: '#ea580c', bg: '#fff7ed' },
]

const LISTING_TYPES = ['Satılık', 'Kiralık', 'Günlük Kira']
const PROPERTY_TYPES = ['Daire', 'Villa', 'Müstakil', 'Ofis', 'Arsa', 'İşyeri']
const ROOM_OPTIONS = ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1', '5+2', '6+1']
const FLOOR_OPTIONS = ['Zemin', '1. Kat', '2. Kat', '3. Kat', '4. Kat', '5. Kat', '6. Kat', '7. Kat', '8. Kat', '9. Kat', '10+ Kat', 'Çatı Dubleks', 'Bahçe Kat', 'Müstakil']
const AGE_OPTIONS = ['0 (Sıfır)', '1-5', '6-10', '11-20', '21+']

const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Kocaeli']

const DISTRICTS = {
  'İstanbul': ['Beşiktaş', 'Kadıköy', 'Şişli', 'Kağıthane', 'Üsküdar', 'Maltepe', 'Bakırköy', 'Sarıyer', 'Ataşehir', 'Beylikdüzü', 'Levent', 'Etiler'],
  'Ankara': ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Altındağ'],
  'İzmir': ['Konak', 'Karşıyaka', 'Bornova', 'Bayraklı', 'Buca', 'Çiğli'],
}

export default function CreateListing() {
  const navigate = useNavigate()
  const { addToast } = useApp()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    currency: '₺',
    listingType: 'Satılık',
    propertyType: 'Daire',
    rooms: '2+1',
    size: '',
    floor: '3. Kat',
    age: '1-5',
    city: 'İstanbul',
    district: '',
    neighborhood: '',
    address: '',
    phone: '',
    name: '',
  })

  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [photos, setPhotos] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const [previewSuggestion, setPreviewSuggestion] = useState(null)

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files || [])
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    const valid = files.filter(f => validTypes.includes(f.type))
    if (valid.length !== files.length) addToast('Yalnızca JPEG, PNG ve WebP formatları desteklenir')
    setPhotos(prev => [...prev, ...valid.slice(0, 10 - prev.length)])
    if (e.target) e.target.value = ''
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Başlık zorunludur'
    if (!form.description.trim()) errs.description = 'Açıklama zorunludur'
    if (!form.price.trim()) errs.price = 'Fiyat zorunludur'
    else if (isNaN(parseInt(form.price.replace(/[^0-9]/g, '')))) errs.price = 'Geçerli bir fiyat girin'
    if (!form.size.trim() || isNaN(parseInt(form.size))) errs.size = 'Geçerli bir metrekare girin'
    if (!form.district) errs.district = 'İlçe seçin'
    if (!form.phone.trim()) errs.phone = 'Telefon zorunludur'
    if (selectedPlatforms.length === 0) errs.platforms = 'En az bir platform seçin'
    if (photos.length === 0) errs.photos = 'En az bir fotoğraf ekleyin'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      addToast('Lütfen eksik alanları doldurun', 'error')
      return
    }
    setSubmitting(true)

    const platformNames = selectedPlatforms.map(p => PLATFORMS.find(pl => pl.id === p)?.label || p)

    await new Promise(r => setTimeout(r, 1500))

    addToast(`İlan başarıyla oluşturuldu · ${platformNames.join(', ')} platformlarına yayınlandı`, 'success')
    setSubmitting(false)
    setTimeout(() => navigate('/'), 1200)
  }

  const generateAiSuggestions = async () => {
    setAiLoading(true)
    setAiSuggestions(null)
    setSelectedSuggestion(null)

    await new Promise(r => setTimeout(r, 2000))

    const t = form.propertyType || 'Daire'
    const r = form.rooms || '2+1'
    const loc = `${form.district ? form.district + ', ' : ''}${form.city || 'İstanbul'}`
    const m2 = form.size || '120'
    const type = form.listingType === 'Kiralık' ? 'Kiralık' : form.listingType === 'Günlük Kira' ? 'Günlük Kiralık' : 'Satılık'

    setAiSuggestions([
      {
        title: `${r} ${t} · ${loc} Merkezi Konumda Fırsat!`,
        description: `${loc} bölgesinde, ${m2} m² kullanım alanına sahip bu ${r} ${t.toLowerCase()} ${type.toLowerCase()} olarak sizleri bekliyor. Toplu taşımaya yakınlığı, sosyal olanakları ve ferah yaşam alanı ile öne çıkan bu gayrimenkul, yatırımcılar için de kaçırılmaz bir fırsat sunuyor. Hemen randevu alın, yerini görün!`,
        tags: 'merkezi konum, ulaşım, yatırımlık',
      },
      {
        title: `✨ ${loc} · ${r} ${t} ${form.listingType === 'Satılık' ? 'Acil Satılık' : 'Hemen Kiralık'}!`,
        description: `${m2} m² genişliğindeki bu eşsiz ${r} ${t.toLowerCase()}, ${loc}'nın en gözde noktasında ${type.toLowerCase()} olarak değerlendirilmektedir. Doğal ışık alan, geniş odaları ve modern mutfağı ile aileniz için ideal bir yaşam alanı. Düşük aidat ve güvenli site içerisinde huzurlu bir yaşam sizi bekliyor.`,
        tags: 'gözde konum, aile, huzurlu',
      },
      {
        title: `💎 ${form.listingType === 'Satılık' ? 'Yatırımlık Fırsat' : 'Özel Fırsat'} · ${r} ${t} ${loc}`,
        description: `${loc} bölgesinde ${m2} m² büyüklüğünde, ${r} oda ${t.toLowerCase()} ${type.toLowerCase()}! Tamamen yenilenmiş, sıfır durumunda, lüks ve modern tasarıma sahip bu daire, yüksek tavanları ve geniş pencereleriyle ferah bir yaşam sunuyor. Kapalı otopark, 7/24 güvenlik ve spor salonu gibi olanaklarla donatılmış sitede nadir bulunan bir fırsat!`,
        tags: 'lüks, modern, yenilenmiş',
      },
    ])
    setAiLoading(false)
  }

  const districts = DISTRICTS[form.city] || []

  return (
    <div className="flex flex-col min-h-0">
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-10 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6 lg:mb-8 animate-fade-up">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: '#e3d10d' }}>
                <Plus size={17} strokeWidth={2.5} style={{ color: '#1e1b2e' }} />
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight" style={{ color: '#1e1b2e' }}>İlan Oluştur</h2>
            </div>
            <p className="text-xs text-gray-400 font-medium ml-12">
              Tek form ile birden fazla platformda yayınlayın
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up" style={{ animationDelay: '.08s' }}>
          {/* PLATFORM SELECTION */}
          <div className="bg-white rounded-3xl border border-cardBorder p-5 lg:p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(227,209,13,.15)' }}>
                <Send size={14} style={{ color: '#e3d10d' }} />
              </div>
              <h3 className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>Yayın Platformları</h3>
              <span className="text-[10px] text-gray-400 font-medium">(en az birini seçin)</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {PLATFORMS.map(p => {
                const selected = selectedPlatforms.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 btn ${
                      selected
                        ? 'shadow-sm'
                        : 'border-2 border-dashed opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      background: selected ? p.bg : 'transparent',
                      borderColor: selected ? p.color : '#e0e0e0',
                      color: selected ? p.color : '#9a9a9a',
                    }}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        selected ? 'scale-100' : 'opacity-40'
                      }`}
                      style={{ background: selected ? p.color : 'transparent' }}
                    >
                      {selected && <Check size={12} className="text-white" />}
                    </div>
                    {p.label}
                  </button>
                )
              })}
            </div>
            {errors.platforms && (
              <p className="flex items-center gap-1.5 text-xs font-medium mt-2" style={{ color: '#dc2626' }}>
                <AlertCircle size={12} /> {errors.platforms}
              </p>
            )}
          </div>

          {/* PHOTOS */}
          <div className="bg-white rounded-3xl border border-cardBorder p-5 lg:p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(227,209,13,.15)' }}>
                <Image size={14} style={{ color: '#e3d10d' }} />
              </div>
              <h3 className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>Fotoğraflar</h3>
              <span className="text-[10px] text-gray-400 font-medium">(en fazla 10 adet)</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {photos.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all btn"
                  >
                    <X size={12} className="text-white" />
                  </button>
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                    <span className="text-[9px] font-bold text-white">{i + 1}</span>
                  </div>
                </div>
              ))}
              {photos.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 hover:border-[#e3d10d] hover:bg-[#fefce8] transition-all btn"
                  style={{ color: '#9a9a9a' }}
                >
                  <Upload size={20} />
                  <span className="text-[10px] font-bold">Ekle</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handlePhotos}
            />
            {errors.photos && (
              <p className="flex items-center gap-1.5 text-xs font-medium mt-2" style={{ color: '#dc2626' }}>
                <AlertCircle size={12} /> {errors.photos}
              </p>
            )}
          </div>

          {/* TITLE & DESC */}
          <div className="bg-white rounded-3xl border border-cardBorder p-5 lg:p-6 shadow-sm">
            <h3 className="text-sm font-extrabold mb-4" style={{ color: '#1e1b2e' }}>İlan Bilgileri</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1.5 block">İlan Başlığı *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => updateField('title', e.target.value)}
                  placeholder="Örn: Merkezi Konumda 3+1 Ferah Daire"
                  className="w-full px-4 py-3 rounded-2xl border-2 outline-none text-sm font-medium transition-all"
                  style={{
                    borderColor: errors.title ? '#dc2626' : '#f0ece6',
                    color: '#1e1b2e',
                    background: errors.title ? '#fef2f2' : '#faf7f2',
                  }}
                />
                {errors.title && <p className="text-[11px] font-medium mt-1" style={{ color: '#dc2626' }}>{errors.title}</p>}
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1.5 block">Açıklama *</label>
                <textarea
                  value={form.description}
                  onChange={e => updateField('description', e.target.value)}
                  placeholder="İlanınızı detaylıca açıklayın..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border-2 outline-none text-sm font-medium transition-all resize-none"
                  style={{
                    borderColor: errors.description ? '#dc2626' : '#f0ece6',
                    color: '#1e1b2e',
                    background: errors.description ? '#fef2f2' : '#faf7f2',
                  }}
                />
                {errors.description && <p className="text-[11px] font-medium mt-1" style={{ color: '#dc2626' }}>{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* PROPERTY DETAILS */}
          <div className="bg-white rounded-3xl border border-cardBorder p-5 lg:p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(227,209,13,.15)' }}>
                <Home size={14} style={{ color: '#e3d10d' }} />
              </div>
              <h3 className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>Emlak Detayları</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1.5 block">İlan Türü</label>
                <div className="flex gap-1.5 flex-wrap">
                  {LISTING_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateField('listingType', t)}
                      className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all btn ${
                        form.listingType === t
                          ? 'text-white shadow-sm'
                          : 'border border-cardBorder bg-cream'
                      }`}
                      style={form.listingType === t ? { background: '#1e1b2e', color: '#fff' } : { color: '#1e1b2e' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1.5 block">Emlak Türü</label>
                <select
                  value={form.propertyType}
                  onChange={e => updateField('propertyType', e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder outline-none text-sm font-medium appearance-none cursor-pointer"
                  style={{ color: '#1e1b2e', background: '#faf7f2' }}
                >
                  {PROPERTY_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1.5 block">
                  <Layers size={12} className="inline mr-1" />Oda Sayısı
                </label>
                <select
                  value={form.rooms}
                  onChange={e => updateField('rooms', e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder outline-none text-sm font-medium appearance-none cursor-pointer"
                  style={{ color: '#1e1b2e', background: '#faf7f2' }}
                >
                  {ROOM_OPTIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1.5 block">
                  <Maximize size={12} className="inline mr-1" />Metrekare (m²) *
                </label>
                <input
                  type="number"
                  value={form.size}
                  onChange={e => updateField('size', e.target.value)}
                  placeholder="120"
                  className="w-full px-4 py-3 rounded-2xl border-2 outline-none text-sm font-medium transition-all"
                  style={{
                    borderColor: errors.size ? '#dc2626' : '#f0ece6',
                    color: '#1e1b2e',
                    background: errors.size ? '#fef2f2' : '#faf7f2',
                  }}
                />
                {errors.size && <p className="text-[11px] font-medium mt-1" style={{ color: '#dc2626' }}>{errors.size}</p>}
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1.5 block">
                  <MoveVertical size={12} className="inline mr-1" />Bulunduğu Kat
                </label>
                <select
                  value={form.floor}
                  onChange={e => updateField('floor', e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder outline-none text-sm font-medium appearance-none cursor-pointer"
                  style={{ color: '#1e1b2e', background: '#faf7f2' }}
                >
                  {FLOOR_OPTIONS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1.5 block">
                  <Calendar size={12} className="inline mr-1" />Bina Yaşı
                </label>
                <select
                  value={form.age}
                  onChange={e => updateField('age', e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder outline-none text-sm font-medium appearance-none cursor-pointer"
                  style={{ color: '#1e1b2e', background: '#faf7f2' }}
                >
                  {AGE_OPTIONS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1.5 block">
                  <DollarSign size={12} className="inline mr-1" />Fiyat (TL) *
                </label>
                <input
                  type="text"
                  value={form.price}
                  onChange={e => updateField('price', e.target.value)}
                  placeholder="Örn: 4.250.000"
                  className="w-full px-4 py-3 rounded-2xl border-2 outline-none text-sm font-medium transition-all"
                  style={{
                    borderColor: errors.price ? '#dc2626' : '#f0ece6',
                    color: '#1e1b2e',
                    background: errors.price ? '#fef2f2' : '#faf7f2',
                  }}
                />
                {errors.price && <p className="text-[11px] font-medium mt-1" style={{ color: '#dc2626' }}>{errors.price}</p>}
              </div>
            </div>
          </div>

          {/* LOCATION */}
          <div className="bg-white rounded-3xl border border-cardBorder p-5 lg:p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(227,209,13,.15)' }}>
                <MapPin size={14} style={{ color: '#e3d10d' }} />
              </div>
              <h3 className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>Konum</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1.5 block">İl</label>
                <select
                  value={form.city}
                  onChange={e => { updateField('city', e.target.value); updateField('district', '') }}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder outline-none text-sm font-medium appearance-none cursor-pointer"
                  style={{ color: '#1e1b2e', background: '#faf7f2' }}
                >
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1.5 block">İlçe *</label>
                <select
                  value={form.district}
                  onChange={e => updateField('district', e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 outline-none text-sm font-medium appearance-none cursor-pointer transition-all"
                  style={{
                    borderColor: errors.district ? '#dc2626' : '#f0ece6',
                    color: '#1e1b2e',
                    background: errors.district ? '#fef2f2' : '#faf7f2',
                  }}
                >
                  <option value="">Seçin</option>
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {errors.district && <p className="text-[11px] font-medium mt-1" style={{ color: '#dc2626' }}>{errors.district}</p>}
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1.5 block">Semt / Mahalle</label>
                <input
                  type="text"
                  value={form.neighborhood}
                  onChange={e => updateField('neighborhood', e.target.value)}
                  placeholder="Örn: Gayrettepe"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder outline-none text-sm font-medium"
                  style={{ color: '#1e1b2e', background: '#faf7f2' }}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-[11px] font-bold text-gray-400 mb-1.5 block">Adres (isteğe bağlı)</label>
              <textarea
                value={form.address}
                onChange={e => updateField('address', e.target.value)}
                placeholder="Örn: Levent Mahallesi, Büyükdere Cad. No:123"
                rows={2}
                className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder outline-none text-sm font-medium transition-all resize-none"
                style={{ color: '#1e1b2e', background: '#faf7f2' }}
              />
            </div>
          </div>

          {/* CONTACT */}
          <div className="bg-white rounded-3xl border border-cardBorder p-5 lg:p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(227,209,13,.15)' }}>
                <Building2 size={14} style={{ color: '#e3d10d' }} />
              </div>
              <h3 className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>İletişim Bilgileri</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1.5 block">Ad Soyad *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="Adınız Soyadınız"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder outline-none text-sm font-medium"
                  style={{ color: '#1e1b2e', background: '#faf7f2' }}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1.5 block">Telefon *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full px-4 py-3 rounded-2xl border-2 outline-none text-sm font-medium transition-all"
                  style={{
                    borderColor: errors.phone ? '#dc2626' : '#f0ece6',
                    color: '#1e1b2e',
                    background: errors.phone ? '#fef2f2' : '#faf7f2',
                  }}
                />
                {errors.phone && <p className="text-[11px] font-medium mt-1" style={{ color: '#dc2626' }}>{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* AI ENHANCEMENT */}
          <div className="bg-white rounded-3xl border border-cardBorder p-5 lg:p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(227,209,13,.15)' }}>
                <Sparkles size={14} style={{ color: '#e3d10d' }} />
              </div>
              <h3 className="text-sm font-extrabold" style={{ color: '#1e1b2e' }}>AI ile İlanı İyileştir</h3>
              <span className="text-[10px] text-gray-400 font-medium">(isteğe bağlı)</span>
            </div>

            <p className="text-xs font-medium text-gray-400 mb-4">
              Yapay zeka, ilan bilgilerinize göre size özel alternatif başlık ve açıklamalar oluştursun.
            </p>

            {!aiSuggestions ? (
              <button
                type="button"
                onClick={generateAiSuggestions}
                disabled={aiLoading}
                className="w-full py-3.5 rounded-2xl text-sm font-extrabold btn flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(139,92,246,.25)',
                }}
              >
                {aiLoading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="2" strokeDasharray="30 10" />
                    </svg>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} strokeWidth={2.5} />
                    AI Önerileri Al
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                {aiSuggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPreviewSuggestion({ ...s, index: i })}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all btn ${
                      selectedSuggestion === i
                        ? 'border-[#e3d10d] bg-[#fefce8]'
                        : 'border-cardBorder hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs font-extrabold leading-snug" style={{ color: '#1e1b2e' }}>
                        {selectedSuggestion === i && <Check size={14} className="inline mr-1" style={{ color: '#e3d10d' }} />}
                        {s.title}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg shrink-0" style={{ background: 'rgba(227,209,13,.15)', color: '#1e1b2e' }}>
                        #{i + 1}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-gray-400 leading-relaxed line-clamp-2">
                      {s.description}
                    </p>
                    <div className="flex gap-1.5 mt-2">
                      {s.tags.split(', ').map(k => (
                        <span key={k} className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-gray-100 text-gray-500">
                          {k}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAiSuggestions(null)}
                  className="w-full py-2.5 rounded-2xl text-xs font-bold btn border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all"
                  style={{ color: '#9a9a9a' }}
                >
                  <X size={14} className="inline mr-1" />
                  Önerileri Kapat
                </button>
              </div>
            )}
          </div>

          {/* SUBMIT */}
          <div className="flex items-center gap-3 pt-2 pb-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3.5 rounded-2xl text-sm font-bold border-2 border-cardBorder btn transition-all"
              style={{ color: '#1e1b2e' }}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-extrabold shadow-lg btn flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
              style={{
                background: '#e3d10d',
                color: '#1e1b2e',
                boxShadow: '0 8px 24px rgba(227,209,13,.25)',
              }}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="2" strokeDasharray="30 10" />
                  </svg>
                  Yayınlanıyor...
                </>
              ) : (
                <>
                  <Send size={16} strokeWidth={2.5} />
                  İlanı Yayınla
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* AI PREVIEW MODAL - emlakjet/sahibinden tarzi */}
      {previewSuggestion && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-modal-fade p-3 sm:p-4"
          onClick={() => setPreviewSuggestion(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] mx-auto overflow-hidden animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPreviewSuggestion(null)}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center btn hover:bg-black/70 transition-all"
            >
              <X size={14} className="text-white" />
            </button>

            {/* === PHOTO / GORSEL ALANI === */}
            <div className="relative h-56 sm:h-64 bg-gradient-to-br from-indigo-400/30 via-purple-400/20 to-pink-300/30 overflow-hidden">
              {/* AI badge */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-md">
                <Sparkles size={12} style={{ color: '#8b5cf6' }} />
                <span className="text-[10px] font-extrabold" style={{ color: '#8b5cf6' }}>AI Önerisi #{previewSuggestion.index + 1}</span>
              </div>

              {/* Photo count */}
              <div className="absolute top-3 right-14 z-10 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                <Image size={10} className="text-white/80" />
                <span className="text-[10px] font-bold text-white/90">12</span>
              </div>

              {/* Decorative "house" pattern */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/30">
                  <Home size={40} className="text-white/70" />
                </div>
              </div>

              {/* Thumbnail strip */}
              <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/50 to-transparent">
                <div className="flex items-end gap-1.5 px-4 pb-2.5 h-full">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`w-12 h-9 rounded-lg overflow-hidden border border-white/40 ${i === 0 ? '' : 'opacity-60'}`}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-indigo-300/40 via-purple-300/30 to-pink-200/30 flex items-center justify-center">
                        <Image size={10} className="text-white/60" />
                      </div>
                    </div>
                  ))}
                  <div className="w-12 h-9 rounded-lg bg-black/40 flex items-center justify-center border border-white/30">
                    <span className="text-[9px] font-bold text-white">+8</span>
                  </div>
                </div>
              </div>
            </div>

            {/* === ILAN BILGILERI === */}
            <div className="p-5">
              {/* Fiyat - en ustte buyuk goze carpan */}
              <div className="mb-3">
                <span className="text-2xl font-extrabold tracking-tight" style={{ color: '#e3d10d' }}>
                  {form.price
                    ? `${form.currency || '₺'} ${parseInt(form.price.replace(/[^0-9]/g, '')).toLocaleString('tr-TR')}`
                    : 'Fiyat belirtilmedi'}
                </span>
                <span className="text-[11px] font-semibold text-gray-400 ml-1.5">
                  {form.listingType === 'Kiralık' ? 'kira' : form.listingType === 'Günlük Kira' ? 'günlük' : 'satılık'}
                </span>
              </div>

              {/* Baslik */}
              <h3 className="text-sm font-extrabold leading-snug mb-2" style={{ color: '#1e1b2e' }}>
                {previewSuggestion.title}
              </h3>

              {/* Konum */}
              <div className="flex items-center gap-1.5 mb-4">
                <MapPin size={13} className="text-gray-300" />
                <span className="text-[11px] font-semibold text-gray-400">
                  {form.district ? `${form.district}, ` : ''}{form.city || 'Konum belirtilmedi'}
                  {form.neighborhood ? ` / ${form.neighborhood}` : ''}
                </span>
              </div>

              {/* Ozellikler grid - emlakjet'teki gibi label:value */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4 bg-gray-50 rounded-xl p-4">
                <div>
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Oda</span>
                  <p className="text-[13px] font-bold" style={{ color: '#1e1b2e' }}>{form.rooms || '-'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">m² (Brüt)</span>
                  <p className="text-[13px] font-bold" style={{ color: '#1e1b2e' }}>{form.size || '?'} m²</p>
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Bulunduğu Kat</span>
                  <p className="text-[13px] font-bold" style={{ color: '#1e1b2e' }}>{form.floor || '-'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Bina Yaşı</span>
                  <p className="text-[13px] font-bold" style={{ color: '#1e1b2e' }}>{form.age || '-'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Emlak Türü</span>
                  <p className="text-[13px] font-bold" style={{ color: '#1e1b2e' }}>{form.propertyType || '-'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">İlan Türü</span>
                  <p className="text-[13px] font-bold" style={{ color: '#1e1b2e' }}>{form.listingType || '-'}</p>
                </div>
              </div>

              {/* Aciklama */}
              <div className="mb-4">
                <h4 className="text-[11px] font-extrabold mb-2 flex items-center gap-1.5" style={{ color: '#1e1b2e' }}>
                  <span className="w-0.5 h-3 rounded-full" style={{ background: '#e3d10d' }} />
                  Açıklama
                </h4>
                <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                  {previewSuggestion.description}
                </p>
              </div>

              {/* Ozellik tagleri */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {previewSuggestion.tags.split(', ').map(k => (
                  <span key={k} className="px-2.5 py-1 rounded-lg text-[9px] font-bold border" style={{ borderColor: '#e3d10d40', color: '#a3970a', background: '#fefce8' }}>
                    {k}
                  </span>
                ))}
              </div>

              {/* Iletisim karti - emlakjet'teki gibi emlak danismani */}
              <div className="flex items-center gap-3 border-t border-cardBorder pt-4 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-extrabold shrink-0" style={{ background: '#1e1b2e' }}>
                  {form.name ? form.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold" style={{ color: '#1e1b2e' }}>{form.name || 'İsim belirtilmedi'}</p>
                  <p className="text-[10px] font-medium text-gray-400">{form.phone || 'Telefon belirtilmedi'}</p>
                </div>
                <div className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-gray-50 border border-cardBorder" style={{ color: '#9ca3af' }}>
                  İLAN #{previewSuggestion.index + 1}94{String(previewSuggestion.index + 1).padStart(2, '0')}55
                </div>
              </div>

              {/* Kullan butonu */}
              <button
                type="button"
                onClick={() => {
                  updateField('title', previewSuggestion.title)
                  updateField('description', previewSuggestion.description)
                  setSelectedSuggestion(previewSuggestion.index)
                  setPreviewSuggestion(null)
                }}
                className="w-full py-3.5 rounded-xl text-sm font-extrabold btn flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                style={{
                  background: '#e3d10d',
                  color: '#1e1b2e',
                  boxShadow: '0 8px 24px rgba(227,209,13,.3)',
                }}
              >
                <Check size={16} strokeWidth={2.5} />
                Seç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
