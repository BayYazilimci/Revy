import {
  Building2, Phone, Mail, MapPin, Clock, Camera, Share2, MessageCircle,
  Bookmark, Home, Users, Star, Image, Quote, Map, PhoneCall, ArrowRight,
} from 'lucide-react'

const SECTION_TYPES = {
  hero: { label: 'Kahraman Bölümü', icon: Star },
  about: { label: 'Hakkımızda', icon: Users },
  listings: { label: 'İlanlar', icon: Home },
  services: { label: 'Hizmetler', icon: Star },
  contact: { label: 'İletişim', icon: Phone },
  gallery: { label: 'Galeri', icon: Image },
  testimonials: { label: 'Müşteri Yorumları', icon: Quote },
  team: { label: 'Ekibimiz', icon: Users },
  cta: { label: 'Çağrı (CTA)', icon: PhoneCall },
  map: { label: 'Konum Haritası', icon: Map },
}

function renderHero(section, colors) {
  return (
    <div key={section.id} className="relative px-6 sm:px-10 py-12 sm:py-16 text-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ background: colors.accent, filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full" style={{ background: colors.accent, filter: 'blur(60px)' }} />
      </div>
      <div className="relative z-10">
        <Building2 size={36} className="mx-auto mb-3 opacity-80" style={{ color: colors.accent }} />
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2" style={{ color: '#fff' }}>{section.title}</h1>
        <p className="text-sm sm:text-base opacity-80" style={{ color: '#fff' }}>{section.subtitle}</p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <button className="px-5 py-2 rounded-xl font-bold text-xs" style={{ background: colors.accent, color: colors.primary }}>
            İlanlara Göz At
          </button>
          <button className="px-5 py-2 rounded-xl font-bold text-xs border-2" style={{ borderColor: '#ffffff40', color: '#fff' }}>
            İletişime Geç
          </button>
        </div>
      </div>
    </div>
  )
}

function renderAbout(section, colors) {
  return (
    <div key={section.id} className="px-6 sm:px-10 py-8">
      <div className="text-center mb-5">
        <h2 className="text-lg font-extrabold" style={{ color: colors.primary }}>{section.title}</h2>
        <div className="w-12 h-0.5 rounded-full mx-auto mt-2" style={{ background: colors.accent }} />
      </div>
      <p className="text-xs leading-relaxed text-center max-w-xl mx-auto opacity-70">{section.content}</p>
    </div>
  )
}

function renderListings(section, colors, listings) {
  return (
    <div key={section.id} className="px-6 sm:px-10 py-8" style={{ background: `${colors.primary}08` }}>
      <div className="text-center mb-5">
        <h2 className="text-lg font-extrabold" style={{ color: colors.primary }}>{section.title}</h2>
        <div className="w-12 h-0.5 rounded-full mx-auto mt-2" style={{ background: colors.accent }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {listings.slice(0, section.count || 6).map(listing => (
          <div key={listing.id} className="rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: `${colors.primary}15`, background: '#fff' }}>
            <div className="h-28 relative" style={{ background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)` }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <Home size={24} className="opacity-30" style={{ color: colors.primary }} />
              </div>
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[8px] font-bold text-white" style={{ background: listing.type === 'Satılık' ? '#059669' : '#3b82f6' }}>
                {listing.type}
              </span>
            </div>
            <div className="p-2.5">
              <h3 className="text-[11px] font-extrabold mb-0.5" style={{ color: colors.primary }}>{listing.title}</h3>
              <p className="text-xs font-extrabold" style={{ color: colors.accent }}>{listing.price}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] opacity-60">{listing.area}</span>
                <span className="opacity-30">|</span>
                <span className="text-[9px] opacity-60">{listing.rooms}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderServices(section, colors) {
  return (
    <div key={section.id} className="px-6 sm:px-10 py-8">
      <div className="text-center mb-5">
        <h2 className="text-lg font-extrabold" style={{ color: colors.primary }}>{section.title}</h2>
        <div className="w-12 h-0.5 rounded-full mx-auto mt-2" style={{ background: colors.accent }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(section.items || []).map((item, i) => (
          <div key={i} className="text-center p-3 rounded-xl border hover:shadow-md transition-all" style={{ borderColor: `${colors.primary}10` }}>
            <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: `${colors.accent}20` }}>
              {i === 0 ? <Home size={16} style={{ color: colors.accent }} /> :
               i === 1 ? <Building2 size={16} style={{ color: colors.accent }} /> :
               i === 2 ? <Users size={16} style={{ color: colors.accent }} /> :
               <Star size={16} style={{ color: colors.accent }} />}
            </div>
            <p className="text-[10px] font-bold" style={{ color: colors.primary }}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderContact(section, colors, companyInfo) {
  return (
    <div key={section.id} className="px-6 sm:px-10 py-8" style={{ background: colors.primary }}>
      <div className="text-center mb-5">
        <h2 className="text-lg font-extrabold text-white">{section.title}</h2>
        <div className="w-12 h-0.5 rounded-full mx-auto mt-2" style={{ background: colors.accent }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10">
          <Phone size={14} className="mt-0.5 flex-shrink-0" style={{ color: colors.accent }} />
          <div>
            <p className="text-[9px] font-bold text-white/60 mb-0.5">Telefon</p>
            <p className="text-xs font-bold text-white">{companyInfo.phone}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10">
          <Mail size={14} className="mt-0.5 flex-shrink-0" style={{ color: colors.accent }} />
          <div>
            <p className="text-[9px] font-bold text-white/60 mb-0.5">E-posta</p>
            <p className="text-xs font-bold text-white">{companyInfo.email}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10">
          <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: colors.accent }} />
          <div>
            <p className="text-[9px] font-bold text-white/60 mb-0.5">Adres</p>
            <p className="text-xs font-bold text-white">{companyInfo.address}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10">
          <Clock size={14} className="mt-0.5 flex-shrink-0" style={{ color: colors.accent }} />
          <div>
            <p className="text-[9px] font-bold text-white/60 mb-0.5">Çalışma Saatleri</p>
            <p className="text-xs font-bold text-white">{companyInfo.workingHours}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-5">
        {companyInfo.socialMedia?.instagram && (
          <a href={companyInfo.socialMedia.instagram} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <Camera size={14} className="text-white" />
          </a>
        )}
        {companyInfo.socialMedia?.facebook && (
          <a href={companyInfo.socialMedia.facebook} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <Share2 size={14} className="text-white" />
          </a>
        )}
        {companyInfo.socialMedia?.twitter && (
          <a href={companyInfo.socialMedia.twitter} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <MessageCircle size={14} className="text-white" />
          </a>
        )}
        {companyInfo.socialMedia?.linkedin && (
          <a href={companyInfo.socialMedia.linkedin} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <Bookmark size={14} className="text-white" />
          </a>
        )}
      </div>
      <div className="text-center mt-6 pt-4 border-t border-white/10">
        <p className="text-[9px] text-white/40">&copy; {new Date().getFullYear()} {companyInfo.name}. Tüm hakları saklıdır.</p>
      </div>
    </div>
  )
}

function renderGallery(section, colors) {
  return (
    <div key={section.id} className="px-6 sm:px-10 py-8">
      <div className="text-center mb-5">
        <h2 className="text-lg font-extrabold" style={{ color: colors.primary }}>{section.title}</h2>
        <div className="w-12 h-0.5 rounded-full mx-auto mt-2" style={{ background: colors.accent }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(section.images || []).length > 0 ? (section.images || []).map((img, i) => (
          <div key={i} className="rounded-xl overflow-hidden aspect-square border" style={{ borderColor: `${colors.primary}15` }}>
            <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
            <div className="w-full h-full items-center justify-center hidden" style={{ background: `${colors.primary}08` }}>
              <Image size={24} className="opacity-20" style={{ color: colors.primary }} />
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: `${colors.primary}20` }}>
            <Image size={32} className="mx-auto opacity-20 mb-2" style={{ color: colors.primary }} />
            <p className="text-xs opacity-40">Galeriye görsel ekleyin</p>
          </div>
        )}
      </div>
    </div>
  )
}

function renderTestimonials(section, colors) {
  return (
    <div key={section.id} className="px-6 sm:px-10 py-8" style={{ background: `${colors.primary}05` }}>
      <div className="text-center mb-5">
        <h2 className="text-lg font-extrabold" style={{ color: colors.primary }}>{section.title}</h2>
        <div className="w-12 h-0.5 rounded-full mx-auto mt-2" style={{ background: colors.accent }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
        {(section.items || []).map((item, i) => (
          <div key={i} className="p-4 rounded-xl border bg-white" style={{ borderColor: `${colors.primary}10` }}>
            <Quote size={20} className="mb-2 opacity-20" style={{ color: colors.accent }} />
            <p className="text-xs leading-relaxed opacity-70 mb-3">"{item.text}"</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: `${colors.accent}20`, color: colors.primary }}>
                {(item.name || '?')[0]}
              </div>
              <span className="text-[10px] font-bold" style={{ color: colors.primary }}>{item.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderTeam(section, colors) {
  return (
    <div key={section.id} className="px-6 sm:px-10 py-8">
      <div className="text-center mb-5">
        <h2 className="text-lg font-extrabold" style={{ color: colors.primary }}>{section.title}</h2>
        <div className="w-12 h-0.5 rounded-full mx-auto mt-2" style={{ background: colors.accent }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
        {(section.items || []).map((item, i) => (
          <div key={i} className="text-center p-3 rounded-xl border hover:shadow-md transition-all" style={{ borderColor: `${colors.primary}10` }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold" style={{ background: `${colors.accent}20`, color: colors.primary }}>
              {(item.name || '?')[0]}
            </div>
            <p className="text-[11px] font-bold" style={{ color: colors.primary }}>{item.name}</p>
            <p className="text-[9px] opacity-50 mt-0.5">{item.role}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderCta(section, colors) {
  return (
    <div key={section.id} className="px-6 sm:px-10 py-10" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` }}>
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-xl font-extrabold text-white mb-2">{section.title}</h2>
        {section.content && <p className="text-sm text-white/80 mb-5">{section.content}</p>}
        {section.buttonText && (
          <a
            href={section.buttonLink || '#'}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: colors.accent, color: colors.primary }}
          >
            {section.buttonText}
            <ArrowRight size={14} />
          </a>
        )}
      </div>
    </div>
  )
}

function renderMap(section, colors) {
  return (
    <div key={section.id} className="px-6 sm:px-10 py-8">
      <div className="text-center mb-5">
        <h2 className="text-lg font-extrabold" style={{ color: colors.primary }}>{section.title}</h2>
        <div className="w-12 h-0.5 rounded-full mx-auto mt-2" style={{ background: colors.accent }} />
      </div>
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: `${colors.primary}15` }}>
        {section.mapUrl ? (
          <iframe
            src={section.mapUrl}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Konum Haritası"
          />
        ) : (
          <div className="h-[300px] flex items-center justify-center" style={{ background: `${colors.primary}05` }}>
            <div className="text-center">
              <Map size={32} className="mx-auto opacity-20 mb-2" style={{ color: colors.primary }} />
              <p className="text-xs opacity-40">Harita embed URL'si girin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function WebsitePreview({ template, companyInfo, listings, sections, customDomain }) {
  const colors = template.colors
  const visibleSections = sections.filter(s => s.visible)
  const displayUrl = customDomain || companyInfo.website || 'emlakofisim.com'

  return (
    <div className="rounded-2xl overflow-hidden border border-cardBorder shadow-2xl bg-white" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-white rounded-lg px-3 py-1 text-[10px] text-gray-400 font-medium border border-gray-200">
            https://{displayUrl}
          </div>
        </div>
      </div>

      <div style={{ background: colors.bg, color: colors.text }}>
        {visibleSections.map(section => {
          switch (section.type) {
            case 'hero': return renderHero(section, colors)
            case 'about': return renderAbout(section, colors)
            case 'listings': return renderListings(section, colors, listings)
            case 'services': return renderServices(section, colors)
            case 'contact': return renderContact(section, colors, companyInfo)
            case 'gallery': return renderGallery(section, colors)
            case 'testimonials': return renderTestimonials(section, colors)
            case 'team': return renderTeam(section, colors)
            case 'cta': return renderCta(section, colors)
            case 'map': return renderMap(section, colors)
            default: return null
          }
        })}
      </div>
    </div>
  )
}

export { SECTION_TYPES }
