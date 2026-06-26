import { useState } from 'react'
import { FileText, Loader2, ChevronDown, ChevronUp, Check, Download } from 'lucide-react'
import { generatePDF } from '../utils/generatePDF'
import { useEvdsData } from '../hooks/useEvdsData'
import { useNearbyPlaces, CATEGORIES as NEARBY_CATS } from '../hooks/useNearbyPlaces'

const NEARBY_KEYS = NEARBY_CATS.map(c => c.key)

const SECTION_GROUPS = [
  {
    id: 'visuals',
    label: 'Fotoğraflar',
    icon: '📷',
    items: [
      { id: 'cover_photo', label: 'Kapak fotoğrafı' },
      { id: 'gallery',     label: 'Fotoğraf galerisi (tüm görseller)' },
    ],
  },
  {
    id: 'info',
    label: 'İlan Bilgileri',
    icon: '🏠',
    items: [
      { id: 'features_basic', label: 'Temel özellikler (oda, m², kat, ısıtma…)' },
      { id: 'description',    label: 'Açıklama metni' },
    ],
  },
  {
    id: 'price',
    label: 'Fiyat Analizi',
    icon: '📊',
    items: [
      { id: 'kfe',        label: 'TCMB KFE endeks grafiği & yıllık değişim' },
      { id: 'm2',         label: 'm² bölge karşılaştırması' },
      { id: 'investment', label: 'Yatırım analizi (kira getirisi, ROI, geri dönüş)' },
    ],
  },
  {
    id: 'nearby',
    label: 'Çevredeki Yerler',
    icon: '📍',
    items: NEARBY_CATS.map(c => ({ id: `nearby_${c.key}`, label: c.label, color: c.color })),
  },
  {
    id: 'contact',
    label: 'İletişim',
    icon: '👤',
    items: [
      { id: 'contact', label: 'Danışman bilgileri & iletişim' },
    ],
  },
]

// Varsayılan seçili ID'ler
const DEFAULT_SELECTED = new Set([
  'cover_photo', 'features_basic', 'description',
  'kfe', 'm2', 'investment',
  'nearby_transport', 'nearby_school', 'nearby_hospital', 'nearby_mosque',
  'contact',
])

function Checkbox({ checked, onChange, label, color }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-1.5">
      <button
        type="button"
        onClick={onChange}
        className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 border transition-all ${
          checked
            ? 'border-transparent'
            : 'border-gray-300 bg-white group-hover:border-gray-400'
        }`}
        style={checked ? { backgroundColor: color || '#1a2a3a' } : {}}
      >
        {checked && <Check size={10} color="white" strokeWidth={3} />}
      </button>
      <span className="text-sm text-gray-600 group-hover:text-navy transition-colors">{label}</span>
    </label>
  )
}

function GroupPanel({ group, selected, onToggleItem, onToggleAll }) {
  const [open, setOpen] = useState(true)
  const allChecked = group.items.every(i => selected.has(i.id))
  const someChecked = group.items.some(i => selected.has(i.id))

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Grup başlığı */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer select-none hover:bg-gray-100 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onToggleAll(group) }}
          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${
            allChecked ? 'bg-navy border-navy' : someChecked ? 'bg-navy/30 border-navy/40' : 'border-gray-300 bg-white'
          }`}
        >
          {(allChecked || someChecked) && <Check size={11} color="white" strokeWidth={3} />}
        </button>
        <span className="text-lg leading-none">{group.icon}</span>
        <span className="flex-1 text-sm font-bold text-navy">{group.label}</span>
        <span className="text-xs text-gray-400 font-medium">
          {group.items.filter(i => selected.has(i.id)).length}/{group.items.length}
        </span>
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </div>

      {/* Seçenekler */}
      {open && (
        <div className="px-4 py-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {group.items.map(item => (
            <Checkbox
              key={item.id}
              checked={selected.has(item.id)}
              onChange={() => onToggleItem(item.id)}
              label={item.label}
              color={item.color || '#1a2a3a'}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PresentationBuilder({ prop }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(DEFAULT_SELECTED)
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  const { data: evdsData } = useEvdsData(prop)
  const { data: nearbyData } = useNearbyPlaces(prop?.coords)

  const toggleItem = id => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setDone(false)
  }

  const toggleAll = group => {
    const allOn = group.items.every(i => selected.has(i.id))
    setSelected(prev => {
      const next = new Set(prev)
      group.items.forEach(i => allOn ? next.delete(i.id) : next.add(i.id))
      return next
    })
    setDone(false)
  }

  const selectAll = () => {
    const all = new Set()
    SECTION_GROUPS.forEach(g => g.items.forEach(i => all.add(i.id)))
    setSelected(all)
  }

  const clearAll = () => setSelected(new Set())

  const handleGenerate = async () => {
    setGenerating(true)
    setDone(false)
    try {
      await generatePDF(prop, selected, nearbyData, evdsData)
      setDone(true)
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  const selectedCount = selected.size
  const totalCount = SECTION_GROUPS.reduce((s, g) => s + g.items.length, 0)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
      {/* Üst şerit */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#e3d10d20' }}>
          <FileText size={18} style={{ color: '#1a2a3a' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-400">Profesyonel Sunum</p>
          <p className="text-sm font-bold text-navy">
            PDF Sunum Oluştur
            <span className="ml-2 text-xs font-medium text-gray-400">
              {selectedCount} / {totalCount} bölüm seçili
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {done && (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              <Check size={11} /> İndirildi
            </span>
          )}
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {/* İçerik paneli */}
      {open && (
        <div className="border-t border-gray-100 p-5 space-y-3">
          {/* Hızlı seçim */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 font-medium">Sunuma dahil edilecek bölümler</span>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs font-semibold text-navy hover:underline">Tümünü Seç</button>
              <span className="text-gray-200">|</span>
              <button onClick={clearAll} className="text-xs font-semibold text-gray-400 hover:text-red-500 hover:underline">Temizle</button>
            </div>
          </div>

          {/* Grup panelleri */}
          <div className="space-y-2">
            {SECTION_GROUPS.map(group => (
              <GroupPanel
                key={group.id}
                group={group}
                selected={selected}
                onToggleItem={toggleItem}
                onToggleAll={toggleAll}
              />
            ))}
          </div>

          {/* Oluştur butonu */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={generating || selectedCount === 0}
              className="flex-1 h-11 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
            >
              {generating
                ? <><Loader2 size={15} className="animate-spin" /> PDF Oluşturuluyor…</>
                : done
                ? <><Download size={15} /> Tekrar İndir</>
                : <><FileText size={15} /> Sunumu Oluştur ({selectedCount} bölüm)</>
              }
            </button>
          </div>

          {generating && (
            <p className="text-xs text-gray-400 text-center animate-pulse">
              Görseller yükleniyor, PDF hazırlanıyor…
            </p>
          )}
        </div>
      )}
    </div>
  )
}
