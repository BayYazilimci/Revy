import { useState } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Trash2, Copy,
  ChevronUp, ChevronDown, Plus, LayoutGrid, LayoutTemplate,
} from 'lucide-react'
import { SECTION_TYPES } from './SiteRenderer'

export { SECTION_TYPES }

function SortableSectionItem({ section, onUpdate, onToggleVisibility, onRemove, onClone, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(false)
  const typeInfo = SECTION_TYPES[section.type] || SECTION_TYPES.about
  const TypeIcon = typeInfo.icon

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-xl overflow-hidden bg-white transition-all duration-200 ${
        isDragging ? 'border-accent shadow-lg scale-[1.02]' : 'border-cardBorder'
      }`}
    >
      <div
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <button
          className="cursor-grab active:cursor-grabbing p-1 rounded transition-colors text-gray-300 hover:text-gray-500 touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${typeInfo.icon === 'Star' ? '#e3d10d' : '#f0ece6'}20` }}>
          <TypeIcon size={12} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-deep truncate">{section.title}</p>
          <p className="text-[9px] text-gray-400 font-medium">{typeInfo.label}</p>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={e => { e.stopPropagation(); onToggleVisibility() }}
            className={`p-1.5 rounded-lg transition-colors ${section.visible ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'}`}
            title={section.visible ? 'Gizle' : 'Göster'}
          >
            {section.visible ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onMoveUp() }}
            disabled={isFirst}
            className="p-1.5 rounded-lg text-gray-400 hover:text-deep hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            <ArrowUp size={12} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onMoveDown() }}
            disabled={isLast}
            className="p-1.5 rounded-lg text-gray-400 hover:text-deep hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            <ArrowDown size={12} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onClone() }}
            className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Kopyala"
          >
            <Copy size={12} />
          </button>
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
        <div className="p-4 border-t border-cardBorder bg-gray-50/50 space-y-3 animate-slide-down">
          <div>
            <label className="text-[10px] font-bold text-gray-500 mb-1 block">Başlık</label>
            <input
              type="text"
              value={section.title}
              onChange={e => onUpdate({ title: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-cardBorder rounded-xl focus:outline-none focus:border-accent bg-white"
            />
          </div>
          {section.type === 'hero' && (
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">Alt Başlık</label>
              <input
                type="text"
                value={section.subtitle || ''}
                onChange={e => onUpdate({ subtitle: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-cardBorder rounded-xl focus:outline-none focus:border-accent bg-white"
              />
            </div>
          )}
          {section.type === 'about' && (
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">İçerik</label>
              <textarea
                value={section.content || ''}
                onChange={e => onUpdate({ content: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-xs border border-cardBorder rounded-xl focus:outline-none focus:border-accent bg-white resize-none"
              />
            </div>
          )}
          {section.type === 'services' && (
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">Hizmetler (virgülle ayırın)</label>
              <input
                type="text"
                value={(section.items || []).join(', ')}
                onChange={e => onUpdate({ items: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="w-full px-3 py-2 text-xs border border-cardBorder rounded-xl focus:outline-none focus:border-accent bg-white"
              />
            </div>
          )}
          {section.type === 'listings' && (
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">Gösterilecek İlan Sayısı</label>
              <input
                type="number"
                min={1}
                max={12}
                value={section.count || 6}
                onChange={e => onUpdate({ count: parseInt(e.target.value) || 6 })}
                className="w-20 px-3 py-2 text-xs border border-cardBorder rounded-xl focus:outline-none focus:border-accent bg-white"
              />
            </div>
          )}
          {section.type === 'gallery' && (
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">Galeri Görselleri (URL, virgülle ayırın)</label>
              <textarea
                value={(section.images || []).join(', ')}
                onChange={e => onUpdate({ images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                rows={3}
                placeholder="https://ornek.com/gorsel1.jpg, https://ornek.com/gorsel2.jpg"
                className="w-full px-3 py-2 text-xs border border-cardBorder rounded-xl focus:outline-none focus:border-accent bg-white resize-none"
              />
            </div>
          )}
          {section.type === 'testimonials' && (
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">Yorumlar</label>
              <div className="space-y-2">
                {(section.items || []).map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={e => {
                          const items = [...(section.items || [])]
                          items[i] = { ...items[i], name: e.target.value }
                          onUpdate({ items })
                        }}
                        placeholder="İsim"
                        className="w-full px-2 py-1 text-[10px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white"
                      />
                      <textarea
                        value={item.text || ''}
                        onChange={e => {
                          const items = [...(section.items || [])]
                          items[i] = { ...items[i], text: e.target.value }
                          onUpdate({ items })
                        }}
                        placeholder="Yorum"
                        rows={2}
                        className="w-full px-2 py-1 text-[10px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white resize-none"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const items = (section.items || []).filter((_, idx) => idx !== i)
                        onUpdate({ items })
                      }}
                      className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors mt-1"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => onUpdate({ items: [...(section.items || []), { name: '', text: '' }] })}
                  className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-bold text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors"
                >
                  <Plus size={10} /> Yorum Ekle
                </button>
              </div>
            </div>
          )}
          {section.type === 'team' && (
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">Ekip Üyeleri</label>
              <div className="space-y-2">
                {(section.items || []).map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={e => {
                          const items = [...(section.items || [])]
                          items[i] = { ...items[i], name: e.target.value }
                          onUpdate({ items })
                        }}
                        placeholder="Ad Soyad"
                        className="w-full px-2 py-1 text-[10px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white"
                      />
                      <input
                        type="text"
                        value={item.role || ''}
                        onChange={e => {
                          const items = [...(section.items || [])]
                          items[i] = { ...items[i], role: e.target.value }
                          onUpdate({ items })
                        }}
                        placeholder="Unvan"
                        className="w-full px-2 py-1 text-[10px] border border-cardBorder rounded-lg focus:outline-none focus:border-accent bg-white"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const items = (section.items || []).filter((_, idx) => idx !== i)
                        onUpdate({ items })
                      }}
                      className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors mt-1"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => onUpdate({ items: [...(section.items || []), { name: '', role: '' }] })}
                  className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-bold text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors"
                >
                  <Plus size={10} /> Üye Ekle
                </button>
              </div>
            </div>
          )}
          {section.type === 'cta' && (
            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Açıklama Metni</label>
                <input
                  type="text"
                  value={section.content || ''}
                  onChange={e => onUpdate({ content: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-cardBorder rounded-xl focus:outline-none focus:border-accent bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Buton Yazısı</label>
                <input
                  type="text"
                  value={section.buttonText || 'Hemen Arayın'}
                  onChange={e => onUpdate({ buttonText: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-cardBorder rounded-xl focus:outline-none focus:border-accent bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Buton Linki</label>
                <input
                  type="text"
                  value={section.buttonLink || ''}
                  onChange={e => onUpdate({ buttonLink: e.target.value })}
                  placeholder="tel:+905320000000 veya https://..."
                  className="w-full px-3 py-2 text-xs border border-cardBorder rounded-xl focus:outline-none focus:border-accent bg-white"
                />
              </div>
            </div>
          )}
          {section.type === 'map' && (
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">Harita Embed Kodu (iframe src) veya Adres</label>
              <textarea
                value={section.mapUrl || section.content || ''}
                onChange={e => onUpdate({ mapUrl: e.target.value, content: e.target.value })}
                rows={3}
                placeholder="Google Maps embed URL veya tam adres"
                className="w-full px-3 py-2 text-xs border border-cardBorder rounded-xl focus:outline-none focus:border-accent bg-white resize-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function BuilderSidebar({ sections, onAddSection, onUpdateSection, onDragEnd, onToggleVisibility, onRemoveSection, onCloneSection, onMoveSection }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id)
      const newIndex = sections.findIndex(s => s.id === over.id)
      const moved = arrayMove(sections, oldIndex, newIndex)
      if (onDragEnd) onDragEnd(moved)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-cardBorder p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-extrabold text-deep flex items-center gap-1.5">
          <LayoutGrid size={14} className="text-accent" />
          Sayfa Bölümleri
        </h3>
        <div className="relative group">
          <button className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors">
            <Plus size={10} /> Ekle
          </button>
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-cardBorder overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[140px] z-20">
            {Object.entries(SECTION_TYPES).map(([type, info]) => {
              const Icon = info.icon
              return (
                <button
                  key={type}
                  onClick={() => onAddSection(type)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-semibold text-gray-600 hover:text-deep hover:bg-gray-50 transition-colors"
                >
                  <Icon size={10} />
                  {info.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <p className="text-[9px] text-gray-400 mb-2 flex items-center gap-1">
        <GripVertical size={10} />
        Sürükleyerek sıralayabilirsiniz
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {sections.map((section, idx) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                onUpdate={(updates) => onUpdateSection(section.id, updates)}
                onToggleVisibility={() => onToggleVisibility(section.id)}
                onRemove={() => onRemoveSection(section.id)}
                onClone={() => onCloneSection(section.id)}
                onMoveUp={() => onMoveSection(section.id, 'up')}
                onMoveDown={() => onMoveSection(section.id, 'down')}
                isFirst={idx === 0}
                isLast={idx === sections.length - 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <div className="text-center py-8">
          <LayoutTemplate size={28} className="mx-auto text-gray-300 mb-2" />
          <p className="text-[11px] text-gray-400 font-medium">Henüz bölüm eklenmedi</p>
        </div>
      )}
    </div>
  )
}
