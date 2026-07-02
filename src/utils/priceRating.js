/**
 * Emsal fiyat karşılaştırma sistemi
 * Bölgedeki benzer ilanlara göre fiyat değerlendirmesi yapar
 * 
 * Renk kodları:
 *   🟢 Yeşil  → Piyasanın altında (iyi fiyat)
 *   🟡 Sarı   → Piyasa ortalaması
 *   🔴 Kırmızı → Piyasanın üstünde (pahalı)
 */

/**
 * Fiyat stringini sayıya çevirir
 * "₺13.250.000" → 13250000
 * "₺12.000/ay"  → 12000
 */
export function parsePrice(priceStr) {
  if (!priceStr || typeof priceStr !== 'string') return 0
  // "/ay" gibi ekleri temizle
  const cleaned = priceStr.replace(/[₺\s]/g, '').replace(/\/ay$/, '')
  // Türk formatlı noktaları kaldır
  const num = Number(cleaned.replace(/\./g, '').replace(/,/g, '.'))
  return isNaN(num) ? 0 : num
}

/**
 * İlanın kiralık mı satılık mı olduğunu belirler
 */
function isRental(prop) {
  return prop.type === 'Kiralık' || (prop.price && prop.price.includes('/ay'))
}

/**
 * İki ilan arasında oda sayısı benzerliği kontrolü
 * Örn: "2+1" ve "2+1" → eşleşir
 * Daha esnek: Toplam oda sayısı ±1 toleransla
 */
function parseRooms(roomStr) {
  if (!roomStr) return 0
  const parts = roomStr.replace(/[^0-9+.]/g, '').split('+')
  return parts.reduce((sum, p) => sum + (parseFloat(p) || 0), 0)
}

/**
 * m² değerini sayıya çevirir
 * "120 m²" → 120
 */
function parseSize(sizeStr) {
  if (!sizeStr) return 0
  if (typeof sizeStr === 'number') return Math.floor(sizeStr)
  if (typeof sizeStr !== 'string') return 0
  const match = sizeStr.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

/**
 * Benzer emsal ilanları bulur
 * Kriterler:
 *   1. Aynı tip (satılık/kiralık)
 *   2. Benzer oda sayısı (±1 oda toleransı)
 *   3. Kendisi hariç
 */
function findComparables(targetProp, allProperties) {
  const targetRental = isRental(targetProp)
  const targetRooms = parseRooms(targetProp.rooms)
  const targetSize = parseSize(targetProp.size)

  return allProperties.filter(prop => {
    if (prop.id === targetProp.id) return false
    // Aynı tip olmalı (satılık vs kiralık)
    if (isRental(prop) !== targetRental) return false
    // Benzer oda sayısı (±1 tolerans)
    const propRooms = parseRooms(prop.rooms)
    if (Math.abs(propRooms - targetRooms) > 1) return false
    // m² kontrolü: çok farklı boyutları eleme (±%50 tolerans)
    const propSize = parseSize(prop.size)
    if (targetSize > 0 && propSize > 0) {
      const ratio = propSize / targetSize
      if (ratio < 0.5 || ratio > 2.0) return false
    }
    return true
  })
}

/**
 * Medyan hesaplama
 */
function median(values) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * m²/fiyat bazlı fiyat değerlendirmesi yapar
 * 
 * @returns {Object} { rating: 'good'|'average'|'expensive', color, label, percentage, comparableCount }
 */
export function getPriceRating(targetProp, allProperties) {
  const targetPrice = parsePrice(targetProp.price)
  const targetSize = parseSize(targetProp.size)
  
  if (targetPrice === 0) {
    return { rating: 'neutral', color: 'transparent', bgColor: 'transparent', label: '', percentage: 0, comparableCount: 0 }
  }

  const comparables = findComparables(targetProp, allProperties)
  
  // En az 2 emsal ilan olmalı
  if (comparables.length < 2) {
    return { rating: 'neutral', color: 'transparent', bgColor: 'transparent', label: 'Yetersiz veri', percentage: 0, comparableCount: comparables.length }
  }

  // m² bazlı birim fiyat karşılaştırması (daha doğru)
  let targetUnitPrice, comparableUnitPrices

  if (targetSize > 0) {
    targetUnitPrice = targetPrice / targetSize
    comparableUnitPrices = comparables
      .map(p => {
        const price = parsePrice(p.price)
        const size = parseSize(p.size)
        return size > 0 ? price / size : null
      })
      .filter(v => v !== null)
  } else {
    // m² yoksa toplam fiyatı karşılaştır
    targetUnitPrice = targetPrice
    comparableUnitPrices = comparables.map(p => parsePrice(p.price)).filter(v => v > 0)
  }

  if (comparableUnitPrices.length < 2) {
    return { rating: 'neutral', color: 'transparent', bgColor: 'transparent', label: 'Yetersiz veri', percentage: 0, comparableCount: comparableUnitPrices.length }
  }

  const medianPrice = median(comparableUnitPrices)
  
  if (medianPrice === 0) {
    return { rating: 'neutral', color: 'transparent', bgColor: 'transparent', label: '', percentage: 0, comparableCount: comparableUnitPrices.length }
  }

  // Yüzdelik fark hesapla
  const diff = ((targetUnitPrice - medianPrice) / medianPrice) * 100
  const THRESHOLD = 15 // %15 eşik değeri

  if (diff < -THRESHOLD) {
    // Piyasanın altında - iyi fiyat
    return {
      rating: 'good',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.2)',
      borderColor: 'rgba(16, 185, 129, 0.4)',
      label: 'İyi Fiyat',
      emoji: '↓',
      percentage: Math.round(Math.abs(diff)),
      comparableCount: comparableUnitPrices.length
    }
  } else if (diff > THRESHOLD) {
    // Piyasanın üstünde - pahalı
    return {
      rating: 'expensive',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.2)',
      borderColor: 'rgba(239, 68, 68, 0.4)',
      label: 'Pahalı',
      emoji: '↑',
      percentage: Math.round(Math.abs(diff)),
      comparableCount: comparableUnitPrices.length
    }
  } else {
    // Piyasa ortalaması
    return {
      rating: 'average',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.2)',
      borderColor: 'rgba(245, 158, 11, 0.4)',
      label: 'Ortalama',
      emoji: '≈',
      percentage: Math.round(Math.abs(diff)),
      comparableCount: comparableUnitPrices.length
    }
  }
}

/**
 * Tüm properties için toplu rating hesapla (memoize için)
 */
export function getAllPriceRatings(allProperties) {
  const ratings = {}
  allProperties.forEach(prop => {
    ratings[prop.id] = getPriceRating(prop, allProperties)
  })
  return ratings
}

/**
 * Sadece belirli ilanlar için rating hesapla (performans için)
 * @param {Array} targetProperties - Rating hesaplanacak ilanlar
 * @param {Array} allProperties - Karşılaştırma havuzu (tüm ilanlar)
 */
export function getRatingsForList(targetProperties, allProperties) {
  const ratings = {}
  targetProperties.forEach(prop => {
    ratings[prop.id] = getPriceRating(prop, allProperties)
  })
  return ratings
}
