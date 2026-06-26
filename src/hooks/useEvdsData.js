import { useState, useEffect } from 'react'

const EVDS_KEY = import.meta.env.VITE_EVDS_API_KEY || ''

// TCMB EVDS series kodları
// TP.HKFE01 = Türkiye Konut Fiyat Endeksi (tüm konutlar)
// TP.HKFE02 = Yeni Konut Fiyat Endeksi
// TP.HKFE03 = İkinci El Konut Fiyat Endeksi
const SERIES = 'TP.HKFE01-TP.HKFE02-TP.HKFE03'

function getLast13Months() {
  const dates = []
  const now = new Date()
  for (let i = 12; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    dates.push(d)
  }
  return dates
}

function formatEvdsDate(d) {
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
}

// Gerçekçi mock veri — TCMB 2024-2025 KFE verileriyle hizalanmış
function buildMockData() {
  const months = getLast13Months()
  // Endeks değerleri (2010=100 bazlı, Türkiye KFE gerçek seyrine yakın)
  const baseValues = [
    2241, 2318, 2389, 2435, 2502, 2561, 2598, 2647, 2689, 2724, 2758, 2791, 2830
  ]
  return months.map((d, i) => ({
    date: `${d.toLocaleString('tr-TR', { month: 'short' })} ${d.getFullYear()}`,
    kfe: baseValues[i],
    kfeNew: Math.round(baseValues[i] * 1.04),
    kfeSecond: Math.round(baseValues[i] * 0.97),
  }))
}

async function fetchEvds() {
  if (!EVDS_KEY) return null
  const dates = getLast13Months()
  const start = formatEvdsDate(dates[0])
  const end = formatEvdsDate(dates[dates.length - 1])
  const url =
    `https://evds2.tcmb.gov.tr/service/evds/series=${SERIES}` +
    `&startDate=${start}&endDate=${end}&type=json&key=${EVDS_KEY}`

  const res = await fetch(url)
  if (!res.ok) return null
  const json = await res.json()

  const items = json?.items || []
  return items.map(item => ({
    date: item.Tarih || '',
    kfe: parseFloat(item['TP_HKFE01'] ?? item['TP.HKFE01']) || null,
    kfeNew: parseFloat(item['TP_HKFE02'] ?? item['TP.HKFE02']) || null,
    kfeSecond: parseFloat(item['TP_HKFE03'] ?? item['TP.HKFE03']) || null,
  })).filter(r => r.kfe)
}

// Bölgeye göre tahmini m² fiyatı (TL) — İstatistiksel ortalama
function regionalM2Price(location = '') {
  const loc = location.toLowerCase()
  if (loc.includes('beşiktaş') || loc.includes('sarıyer') || loc.includes('kadıköy') || loc.includes('şişli'))
    return 85000
  if (loc.includes('istanbul') || loc.includes('İstanbul'))
    return 62000
  if (loc.includes('ankara') || loc.includes('Ankara'))
    return 38000
  if (loc.includes('izmir') || loc.includes('İzmir'))
    return 52000
  if (loc.includes('antalya') || loc.includes('Antalya'))
    return 45000
  if (loc.includes('bursa') || loc.includes('Bursa'))
    return 32000
  return 35000
}

export function useEvdsData(prop) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState('mock') // 'live' | 'mock'

  useEffect(() => {
    if (!prop) return
    setLoading(true)

    fetchEvds()
      .then(live => {
        const series = live || buildMockData()
        setSource(live ? 'live' : 'mock')

        const latest = series[series.length - 1]
        const prev12 = series[0]
        const yoyChange = prev12?.kfe
          ? ((latest.kfe - prev12.kfe) / prev12.kfe) * 100
          : null
        const momChange = series.length >= 2
          ? ((latest.kfe - series[series.length - 2].kfe) / series[series.length - 2].kfe) * 100
          : null

        // Fiyat analizi
        const listingPrice = parseInt((prop.price || '0').replace(/[^0-9]/g, ''))
        const sizeM2 = parseInt(prop.size || '0')
        const avgM2 = regionalM2Price(prop.location || '')
        const avgTotal = avgM2 * sizeM2
        const priceDeviation = avgTotal > 0
          ? ((listingPrice - avgTotal) / avgTotal) * 100
          : 0

        // Karlılık hesabı
        const rentalYieldRate = 0.035 // Türkiye ortalama kira getirisi ~%3.5
        const annualRent = listingPrice * rentalYieldRate
        const monthlyRent = Math.round(annualRent / 12)
        const appreciation = yoyChange ? yoyChange / 100 : 0.32
        const annualAppreciation = listingPrice * appreciation
        const totalAnnualReturn = annualRent + annualAppreciation
        const totalReturnRate = listingPrice > 0 ? (totalAnnualReturn / listingPrice) * 100 : 0
        const breakEvenYears = listingPrice > 0 && annualRent > 0
          ? Math.round(listingPrice / annualRent)
          : null

        // Fiyat skoru (0-100)
        let priceScore
        if (priceDeviation < -15) priceScore = 90
        else if (priceDeviation < -5) priceScore = 75
        else if (priceDeviation < 5) priceScore = 60
        else if (priceDeviation < 15) priceScore = 40
        else priceScore = 20

        setData({
          series,
          latest,
          yoyChange,
          momChange,
          listingPrice,
          sizeM2,
          avgM2,
          avgTotal,
          priceDeviation,
          monthlyRent,
          annualRent,
          annualAppreciation,
          totalReturnRate,
          breakEvenYears,
          priceScore,
        })
      })
      .finally(() => setLoading(false))
  }, [prop?.id])

  return { data, loading, source }
}
