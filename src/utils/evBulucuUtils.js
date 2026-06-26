const AMENITY_MAP = {
  fiber: ['fiber', 'internet', 'hızlı internet', 'yüksek hız'],
  havuz: ['havuz', 'pool', 'yüzme havuzu'],
  dogalgaz: ['doğalgaz', 'dogalgaz', 'doğalgazlı', 'd.gaz', 'd.gazlı', 'kombi', 'kalorifer'],
  asansor: ['asansör', 'asansor', 'asansörlü', 'lift'],
  otopark: ['otopark', 'park', 'garaj', 'park yeri', 'otoparklı'],
  guvenlik: ['güvenlik', 'guvenlik', 'güvenlikli', 'kamera', 'site güvenlik'],
  esyali: ['eşyalı', 'esyali', 'mobilyalı', 'full eşyalı', 'eşyasız'],
  balkon: ['balkon', 'teras', 'balkonlu', 'teraslı'],
  site: ['site', 'site içi', 'sitede', 'site daire'],
  merkezi: ['merkezi', 'merkez', 'merkezde', 'şehir merkez'],
  metro: ['metro', 'metrobüs', 'metrobus', 'metrobüse', 'metroya', 'toplu taşıma'],
  manzara: ['manzara', 'manzaralı', 'deniz manzara', 'boğaz', 'panoramik'],
  yeni: ['yeni', 'sıfır', 'yeni bina', 'prestij'],
  havadar: ['havadar', 'ferah', 'geniş', 'bol ışık'],
}

const AMENITY_LABELS = {
  fiber: 'Fiber İnternet', havuz: 'Havuz', dogalgaz: 'Doğalgaz',
  asansor: 'Asansör', otopark: 'Otopark', guvenlik: 'Güvenlik',
  esyali: 'Eşyalı', balkon: 'Balkon/Teras', site: 'Site İçi',
  merkezi: 'Merkezi Konum', metro: 'Metro/Ulaşım', manzara: 'Manzara',
  yeni: 'Yeni/Sıfır', havadar: 'Ferah/Havadar',
}

const CITIES = {
  istanbul: 'İstanbul', ankara: 'Ankara', izmir: 'İzmir',
  antalya: 'Antalya', bursa: 'Bursa', adana: 'Adana',
  mersin: 'Mersin', konya: 'Konya', kocaeli: 'Kocaeli',
  muğla: 'Muğla', mugla: 'Muğla', sakarya: 'Sakarya',
  hatay: 'Hatay', manisa: 'Manisa', balıkesir: 'Balıkesir',
  balikesir: 'Balıkesir', diyarbakır: 'Diyarbakır',
  diyarbakir: 'Diyarbakır', trabzon: 'Trabzon',
  malatya: 'Malatya', sivas: 'Sivas', samsun: 'Samsun',
  erzurum: 'Erzurum', mardin: 'Mardin', ordu: 'Ordu',
  adıyaman: 'Adıyaman', adiyaman: 'Adıyaman',
  batman: 'Batman', amasya: 'Amasya', kastamonu: 'Kastamonu',
  kars: 'Kars', tekirdağ: 'Tekirdağ', tekirdag: 'Tekirdağ',
  edirne: 'Edirne', çanakkale: 'Çanakkale', canakkale: 'Çanakkale',
  aydın: 'Aydın', aydin: 'Aydın', denizli: 'Denizli',
  gaziantep: 'Gaziantep', şanlıurfa: 'Şanlıurfa', sanliurfa: 'Şanlıurfa',
}

const DISTRICT_ALIASES = {
  beşiktaş: 'Beşiktaş', besiktas: 'Beşiktaş',
  kadıköy: 'Kadıköy', kadikoy: 'Kadıköy',
  şişli: 'Şişli', sisli: 'Şişli',
  kağıthane: 'Kağıthane', kagithane: 'Kağıthane',
  üsküdar: 'Üsküdar', uskudar: 'Üsküdar',
  bakırköy: 'Bakırköy', bakirkoy: 'Bakırköy',
  bahçelievler: 'Bahçelievler', bahcelievler: 'Bahçelievler',
  gaziosmanpaşa: 'Gaziosmanpaşa', gaziosmanpasa: 'Gaziosmanpaşa',
  etimesgut: 'Etimesgut', çankaya: 'Çankaya', cankaya: 'Çankaya',
  seyran: 'Seyrantepe', etiler: 'Etiler', levent: 'Levent',
  gayrettepe: 'Gayrettepe', maltepe: 'Maltepe', kartal: 'Kartal',
  esenler: 'Esenler', avcılar: 'Avcılar', avcilar: 'Avcılar',
  bodrum: 'Bodrum', marmaris: 'Marmaris', fethiye: 'Fethiye',
}

function parsePrice(priceStr) {
  if (!priceStr) return 0
  if (typeof priceStr === 'number') return priceStr
  const cleaned = priceStr.replace(/[^0-9,]/g, '').replace(',', '')
  return parseFloat(cleaned) || 0
}

function formatPriceShort(price) {
  if (!price) return '0'
  if (price >= 1000000) return (price / 1000000).toFixed(1) + 'M'
  if (price >= 1000) return (price / 1000).toFixed(0) + 'K'
  return price.toString()
}

function getAmenityLabel(amenity) {
  return AMENITY_LABELS[amenity] || amenity
}

function hasAmenity(property, amenity) {
  if (!property) return false
  const searchText = ((property.title || '') + ' ' + (property.desc || '') + ' ' + (property.badge || '')).toLowerCase()
  const keywords = AMENITY_MAP[amenity] || [amenity]
  return keywords.some(kw => searchText.includes(kw))
}

export function parseUserMessage(text) {
  const lower = text.toLowerCase().trim()
  const criteria = {
    location: null,
    minPrice: null,
    maxPrice: null,
    rooms: null,
    type: null,
    minSize: null,
    maxSize: null,
    amenities: [],
  }

  for (const [key, city] of Object.entries(CITIES)) {
    if (lower.includes(key)) {
      criteria.location = { city }
      break
    }
  }

  for (const [alias, name] of Object.entries(DISTRICT_ALIASES)) {
    if (lower.includes(alias)) {
      if (!criteria.location) criteria.location = {}
      criteria.location.district = name
      break
    }
  }

  const roomMatch = lower.match(/(\d)\s*\+\s*[01]/)
  if (roomMatch) {
    criteria.rooms = roomMatch[0].trim()
  } else {
    const roomWords = { 'bir': '1', 'iki': '2', 'üç': '3', 'uc': '3', 'dört': '4', 'dort': '4', 'beş': '5', 'bes': '5' }
    for (const [word, num] of Object.entries(roomWords)) {
      if (lower.includes(word + ' oda') || lower.includes(word + ' odalı') || lower.includes(word + ' odali') || lower.includes(word + '+1')) {
        criteria.rooms = num + '+1'
        break
      }
    }
  }
  if (!criteria.rooms && (lower.includes('stüdyo') || lower.includes('studio'))) {
    criteria.rooms = '1+0'
  }

  const priceMatches = [
    { p: /(?:bütçe|butce|maks|max|en fazla|kadar)\s*:?\s*(\d{1,3}(?:\.\d{3})*)\s*(?:tl|₺|lira)?/i, type: 'max' },
    { p: /(?:bütçe|butce|min|minimum|en az|en düşük)\s*:?\s*(\d{1,3}(?:\.\d{3})*)\s*(?:tl|₺|lira)?/i, type: 'min' },
    { p: /(\d{1,3}(?:\.\d{3})*)\s*(?:tl|₺|lira)?\s*(?:ile|ve|arası|[-])\s*(\d{1,3}(?:\.\d{3})*)\s*(?:tl|₺|lira)?/i, type: 'range' },
    { p: /(\d{1,3}(?:\.\d{3})*)\s*(?:tl|₺|lira)/i, type: 'single' },
  ]

  for (const mp of priceMatches) {
    const m = lower.match(mp.p)
    if (m) {
      const v1 = parseFloat(m[1].replace(/\./g, ''))
      if (mp.type === 'range' && m[2]) {
        criteria.minPrice = v1
        criteria.maxPrice = parseFloat(m[2].replace(/\./g, ''))
      } else if (mp.type === 'max') {
        criteria.maxPrice = v1
      } else if (mp.type === 'min') {
        criteria.minPrice = v1
      } else if (mp.type === 'single' && !criteria.maxPrice && !criteria.minPrice) {
        criteria.maxPrice = v1
      }
      break
    }
  }

  if (lower.includes('kiralık') || lower.includes('kiralik') || lower.includes('kira')) {
    criteria.type = 'Kiralık'
  } else if (lower.includes('satılık') || lower.includes('satilik')) {
    criteria.type = 'Satılık'
  }

  for (const amenity of Object.keys(AMENITY_MAP)) {
    const keywords = AMENITY_MAP[amenity]
    if (keywords.some(kw => lower.includes(kw))) {
      criteria.amenities.push(amenity)
    }
  }

  const sizeMatch = lower.match(/(\d+)\s*(m²|m2|metrekare)/i)
  if (sizeMatch) {
    const val = parseInt(sizeMatch[1])
    if (lower.includes('üstü') || lower.includes('üzeri') || lower.includes('fazla') || lower.includes('büyük')) {
      criteria.minSize = val
    } else if (lower.includes('altı') || lower.includes('alti') || lower.includes('küçük') || lower.includes('kucuk')) {
      criteria.maxSize = val
    } else {
      criteria.minSize = Math.round(val * 0.8)
      criteria.maxSize = Math.round(val * 1.2)
    }
  }

  return criteria
}

export function matchProperty(property, criteria) {
  let score = 0
  const reasons = []
  const maxScore = 100

  if (criteria.location) {
    const locLower = (property.location || '').toLowerCase()
    if (criteria.location.city && locLower.includes(criteria.location.city.toLowerCase())) {
      score += 22
      reasons.push(criteria.location.city + ' bölgesinde')
    }
    if (criteria.location.district) {
      const dLower = criteria.location.district.toLowerCase()
      if (locLower.includes(dLower)) {
        score += 10
      }
    }
  }

  if (criteria.rooms) {
    const propRooms = (property.rooms || '').trim()
    const cRooms = criteria.rooms.trim()
    if (propRooms === cRooms) {
      score += 22
      reasons.push(criteria.rooms + ' oda')
    } else {
      const pn = parseInt(propRooms.split('+')[0])
      const cn = parseInt(cRooms.split('+')[0])
      if (!isNaN(pn) && !isNaN(cn) && pn === cn) {
        score += 12
        reasons.push(propRooms + ' (oda sayısı uyumlu)')
      }
    }
  }

  if (criteria.type) {
    if ((property.type || '').toLowerCase() === criteria.type.toLowerCase()) {
      score += 8
      reasons.push(criteria.type)
    }
  }

  const propPrice = parsePrice(property.price)
  if (propPrice > 0 && (criteria.minPrice !== null || criteria.maxPrice !== null)) {
    if (criteria.minPrice !== null && criteria.maxPrice !== null) {
      if (propPrice >= criteria.minPrice && propPrice <= criteria.maxPrice) {
        score += 22
        reasons.push('Bütçe: ' + formatPriceShort(propPrice) + ' TL')
      } else if (propPrice >= criteria.minPrice * 0.7 && propPrice <= criteria.maxPrice * 1.3) {
        score += 10
        reasons.push('Bütçeye yakın: ' + formatPriceShort(propPrice) + ' TL')
      }
    } else if (criteria.maxPrice !== null) {
      if (propPrice <= criteria.maxPrice) {
        score += 22
        reasons.push('≤' + formatPriceShort(criteria.maxPrice) + ' TL')
      } else if (propPrice <= criteria.maxPrice * 1.3) {
        score += 8
        reasons.push('Bütçeye yakın: ' + formatPriceShort(propPrice) + ' TL')
      }
    } else if (criteria.minPrice !== null) {
      if (propPrice >= criteria.minPrice) {
        score += 22
        reasons.push('≥' + formatPriceShort(criteria.minPrice) + ' TL')
      } else if (propPrice >= criteria.minPrice * 0.7) {
        score += 8
        reasons.push('Bütçeye yakın: ' + formatPriceShort(propPrice) + ' TL')
      }
    }
  }

  if (criteria.minSize || criteria.maxSize) {
    const propSize = parseFloat((property.size || '').replace(/[^0-9]/g, ''))
    if (propSize > 0) {
      if (criteria.minSize && criteria.maxSize) {
        if (propSize >= criteria.minSize && propSize <= criteria.maxSize) score += 8
      } else if (criteria.minSize && propSize >= criteria.minSize) {
        score += 8
      } else if (criteria.maxSize && propSize <= criteria.maxSize) {
        score += 8
      }
    }
  }

  if (criteria.amenities.length > 0) {
    let amenityScore = 0
    for (const amenity of criteria.amenities) {
      if (hasAmenity(property, amenity)) {
        const bonus = amenity === 'fiber' ? 16 : amenity === 'metro' ? 14 : amenity === 'dogalgaz' ? 12 : 10
        amenityScore += bonus
        reasons.push(getAmenityLabel(amenity))
      }
    }
    score += Math.min(amenityScore, 30)
  }

  return {
    propertyId: property.id,
    score: Math.max(0, Math.min(maxScore, score)),
    reasons,
    matchPercent: Math.round((score / maxScore) * 100),
  }
}

export function findBestMatches(properties, criteria, limit = 15) {
  const scored = Object.values(properties)
    .filter(p => p && p.id && p.title)
    .map(p => ({ ...matchProperty(p, criteria), property: p }))
    .filter(r => r.score > 0)

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return parsePrice(a.property.price) - parsePrice(b.property.price)
  })

  if (scored.length === 0) return []

  const topScore = scored[0].score || 1
  return scored.slice(0, limit).map(r => ({
    ...r,
    matchPercent: r.score >= topScore ? 100 : Math.round((r.score / topScore) * 100),
    score: r.score,
  }))
}

export function generateResponse(criteria, results) {
  if (!criteria || (!criteria.location && !criteria.rooms && !criteria.type && criteria.amenities.length === 0 && criteria.minPrice === null && criteria.maxPrice === null)) {
    return {
      message: 'Merhaba! Size en uygun evi bulmama yardımcı olun.\n\nNe tür bir ev arıyorsunuz? Ornegin:\n- Istanbul\'da 3+1 kiralik daire\n- Butcem 20.000 TL\'ye kadar\n- Fiber internetli, merkezi konum\n- 100m² uzeri, asansorlu',
      results: [],
    }
  }

  if (results.length === 0) {
    return {
      message: 'Kriterlerinize uygun ilan bulamadim.\n\nDaha farkli kriterler dener misiniz?\n- Konumu degistirin\n- Butce araligini genisletin\n- Farkli oda sayisi deneyin',
      results: [],
    }
  }

  const parts = []
  if (criteria.location?.city) parts.push(criteria.location.city)
  if (criteria.type) parts.push(criteria.type)
  if (criteria.rooms) parts.push(criteria.rooms)
  if (criteria.minPrice || criteria.maxPrice) {
    if (criteria.minPrice && criteria.maxPrice) parts.push(formatPriceShort(criteria.minPrice) + '-' + formatPriceShort(criteria.maxPrice) + ' TL')
    else if (criteria.minPrice) parts.push('>=' + formatPriceShort(criteria.minPrice) + ' TL')
    else if (criteria.maxPrice) parts.push('<=' + formatPriceShort(criteria.maxPrice) + ' TL')
  }
  if (criteria.amenities?.length > 0) {
    parts.push(criteria.amenities.map(a => getAmenityLabel(a)).join(', '))
  }

  const topScore = results[0].matchPercent
  let msg = 'Kriter: ' + parts.join(' - ')

  if (topScore >= 80) msg += '\n\nMuhtesem! ' + results.length + ' ilan buldum:'
  else if (topScore >= 50) msg += '\n\n' + results.length + ' uygun ilan buldum:'
  else msg += '\n\n' + results.length + ' ilan buldum (kismen uygun):'

  return { message: msg, results }
}

export function parseCriteriaSummary(criteria) {
  if (!criteria) return ''
  const parts = []
  if (criteria.location?.city) parts.push(criteria.location.city)
  if (criteria.type) parts.push(criteria.type)
  if (criteria.rooms) parts.push(criteria.rooms)
  if (criteria.minPrice || criteria.maxPrice) {
    if (criteria.minPrice && criteria.maxPrice) parts.push(formatPriceShort(criteria.minPrice) + '-' + formatPriceShort(criteria.maxPrice) + ' TL')
    else if (criteria.minPrice) parts.push('>=' + formatPriceShort(criteria.minPrice) + ' TL')
    else if (criteria.maxPrice) parts.push('<=' + formatPriceShort(criteria.maxPrice) + ' TL')
  }
  if (criteria.amenities?.length > 0) {
    parts.push(criteria.amenities.map(a => getAmenityLabel(a)).join(', '))
  }
  return parts.join(' · ')
}
