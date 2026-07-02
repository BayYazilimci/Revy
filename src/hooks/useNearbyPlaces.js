import { useState, useEffect, useRef } from 'react'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

const walkMinutes = m => Math.max(1, Math.round(m / 80))
const carMinutes = m => Math.max(1, Math.round(m / 500))
const formatDistance = m => m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`

function haversineDistance(lng1, lat1, lng2, lat2) {
  const R = 6371000
  const toRad = d => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Mapbox Search Box API category endpoint
// https://docs.mapbox.com/api/search/search-box/
async function fetchCategory(categories, lng, lat, sessionToken) {
  const url =
    `https://api.mapbox.com/search/searchbox/v1/category/${categories}` +
    `?access_token=${MAPBOX_TOKEN}` +
    `&proximity=${lng},${lat}` +
    `&limit=10` +
    `&language=tr` +
    `&session_token=${sessionToken}` +
    `&country=TR`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Mapbox API ${res.status}: ${await res.text().catch(() => '')}`)
  const json = await res.json()

  if (!json.features || json.features.length === 0) {
    console.warn(`[NearbyPlaces] ${categories} için sonuç yok:`, json)
  }

  return (json.features || []).map(f => {
    const coords = f.geometry?.coordinates || null
    const apiDist = f.properties?.distance
    const dist = coords && apiDist == null
      ? Math.round(haversineDistance(lng, lat, coords[0], coords[1]))
      : Math.round(apiDist ?? 0)
    return {
      name: f.properties?.name || f.properties?.full_address || '',
      dist,
      distLabel: formatDistance(dist),
      walk: walkMinutes(dist),
      car: carMinutes(dist),
      coords,
    }
  }).filter(p => p.name).sort((a, b) => a.dist - b.dist)
}

// Overpass API fallback - OpenStreetMap tabanlı ücretsiz nearby search
// https://overpass-api.de/
const OVERPASS_TAG_MAP = {
  transport: [
    ['public_transport', 'bus_stop'],
    ['public_transport', 'station'],
    ['railway', 'station'],
    ['railway', 'tram_stop'],
    ['highway', 'bus_stop'],
  ],
  school: [
    ['amenity', 'school'],
    ['amenity', 'university'],
    ['amenity', 'kindergarten'],
    ['amenity', 'college'],
  ],
  hospital: [
    ['amenity', 'hospital'],
    ['amenity', 'pharmacy'],
    ['amenity', 'doctors'],
    ['amenity', 'dentist'],
    ['amenity', 'veterinary'],
  ],
  market: [
    ['shop', 'supermarket'],
    ['shop', 'convenience'],
    ['shop', 'grocery'],
  ],
  mall: [
    ['shop', 'mall'],
    ['shop', 'department_store'],
  ],
  cafe: [
    ['amenity', 'cafe'],
    ['amenity', 'restaurant'],
    ['amenity', 'fast_food'],
    ['amenity', 'bakery'],
  ],
  entertainment: [
    ['amenity', 'bar'],
    ['amenity', 'nightclub'],
    ['amenity', 'cinema'],
  ],
  culture: [
    ['amenity', 'library'],
    ['tourism', 'museum'],
    ['tourism', 'art_gallery'],
    ['amenity', 'arts_centre'],
  ],
  sport: [
    ['leisure', 'sports_centre'],
    ['leisure', 'swimming_pool'],
    ['leisure', 'fitness_centre'],
  ],
  mosque: [
    ['amenity', 'place_of_worship'],
    ['building', 'mosque'],
  ],
  park: [
    ['leisure', 'park'],
    ['leisure', 'playground'],
  ],
  residential: [
    ['place', 'neighbourhood'],
    ['landuse', 'residential'],
  ],
}

async function fetchFromOverpass(categoryKeys, lng, lat, radius = 2000) {
  const queryParts = []
  for (const key of categoryKeys) {
    const tags = OVERPASS_TAG_MAP[key]
    if (!tags) continue
    for (const [tagKey, tagValue] of tags) {
      queryParts.push(`node["${tagKey}"="${tagValue}"](around:${radius},${lat},${lng});`)
      queryParts.push(`way["${tagKey}"="${tagValue}"](around:${radius},${lat},${lng});`)
    }
  }

  if (queryParts.length === 0) return {}

  const query = `[out:json][timeout:15];(${queryParts.join('\n')});out center body;`

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  })

  if (!res.ok) throw new Error(`Overpass API ${res.status}`)
  const json = await res.json()

  const tagToCategory = {}
  for (const key of categoryKeys) {
    const tags = OVERPASS_TAG_MAP[key] || []
    for (const [tagKey, tagValue] of tags) {
      tagToCategory[`${tagKey}=${tagValue}`] = key
    }
  }

  const resultMap = {}
  for (const key of categoryKeys) {
    resultMap[key] = []
  }

  for (const el of json.elements || []) {
    const name = el.tags?.name
    if (!name) continue

    const elLat = el.lat || el.center?.lat
    const elLng = el.lon || el.center?.lon
    if (!elLat || !elLng) continue

    const dist = Math.round(haversineDistance(lng, lat, elLng, elLat))

    for (const [tagKey, tagValue] of Object.entries(el.tags || {})) {
      const catKey = tagToCategory[`${tagKey}=${tagValue}`]
      if (catKey && resultMap[catKey]) {
        resultMap[catKey].push({
          name,
          dist,
          distLabel: formatDistance(dist),
          walk: walkMinutes(dist),
          car: carMinutes(dist),
          coords: [elLng, elLat],
        })
        break
      }
    }
  }

  for (const key of categoryKeys) {
    resultMap[key].sort((a, b) => a.dist - b.dist)
  }

  return resultMap
}

// Mapbox Search Box API category names
// https://docs.mapbox.com/api/search/search-box/#category-coverage
export const CATEGORIES = [
  {
    key: 'transport',
    label: 'Ulaşım',
    color: 'rgb(23, 168, 229)',
    iconType: 'transport',
    mapboxCat: 'bus_stop,transit_stop,train_station,subway_entrance',
  },
  {
    key: 'school',
    label: 'Eğitim',
    color: 'rgb(76, 127, 224)',
    iconType: 'school',
    mapboxCat: 'school,university,kindergarten,college',
  },
  {
    key: 'hospital',
    label: 'Sağlık',
    color: 'rgb(229, 31, 45)',
    iconType: 'hospital',
    mapboxCat: 'hospital,pharmacy,doctor,dentist,veterinary',
  },
  {
    key: 'market',
    label: 'Market',
    color: 'rgb(123, 76, 225)',
    iconType: 'market',
    mapboxCat: 'supermarket,grocery,convenience_store',
  },
  {
    key: 'mall',
    label: 'AVM',
    color: 'rgb(123, 76, 225)',
    iconType: 'mall',
    mapboxCat: 'shopping_mall,shopping_center',
  },
  {
    key: 'cafe',
    label: 'Kafe & Restoran',
    color: 'rgb(154, 90, 37)',
    iconType: 'cafe',
    mapboxCat: 'cafe,restaurant,fast_food_restaurant,bakery',
  },
  {
    key: 'entertainment',
    label: 'Eğlence',
    color: 'rgb(214, 33, 155)',
    iconType: 'entertainment',
    mapboxCat: 'bar,nightclub,movie_theater,entertainment',
  },
  {
    key: 'culture',
    label: 'Kültür & Sanat',
    color: 'rgb(194, 24, 91)',
    iconType: 'culture',
    mapboxCat: 'library,museum,art_gallery,cultural_center',
  },
  {
    key: 'sport',
    label: 'Spor',
    color: 'rgb(213, 31, 38)',
    iconType: 'sport',
    mapboxCat: 'gym,fitness_center,sports_complex,swimming_pool',
  },
  {
    key: 'mosque',
    label: 'İbadet',
    color: 'rgb(11, 130, 149)',
    iconType: 'mosque',
    mapboxCat: 'place_of_worship',
  },
  {
    key: 'park',
    label: 'Park & Yeşil Alan',
    color: 'rgb(56, 142, 60)',
    iconType: 'park',
    mapboxCat: 'park,playground,garden',
  },
  {
    key: 'residential',
    label: 'Site',
    color: 'rgb(82, 100, 120)',
    iconType: 'residential',
    mapboxCat: 'neighborhood,residential',
  },
]

export function useNearbyPlaces(coords, retryKey = 0) {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const sessionTokenRef = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
  )

  useEffect(() => {
    if (!coords) return
    const [lng, lat] = coords
    setLoading(true)
    setError(null)
    setData({})

    const token = sessionTokenRef.current

    Promise.all(
      CATEGORIES.map(cat =>
        fetchCategory(cat.mapboxCat, lng, lat, token)
          .then(places => {
            if (places.length === 0) {
              console.warn(`[NearbyPlaces] ${cat.key} sonuç bulunamadı`)
            }
            return { ...cat, places }
          })
          .catch(err => {
            console.error(`[NearbyPlaces] ${cat.key} yükleme hatası:`, err.message)
            return { ...cat, places: [], error: err.message }
          })
      )
    ).then(async results => {
      const map = {}
      results.forEach(r => { map[r.key] = r })
      const totalResults = results.reduce((sum, r) => sum + r.places.length, 0)

      if (totalResults === 0) {
        console.warn('[NearbyPlaces] Mapbox\'tan sonuç alınamadı, Overpass API deneniyor... Koordinatlar:', lng, lat)
        try {
          const overpassData = await fetchFromOverpass(
            CATEGORIES.map(c => c.key),
            lng, lat
          )
          for (const cat of CATEGORIES) {
            const overpassPlaces = overpassData[cat.key] || []
            if (overpassPlaces.length > 0) {
              map[cat.key] = { ...map[cat.key], places: overpassPlaces, source: 'overpass' }
            }
          }
          const overpassTotal = CATEGORIES.reduce((sum, c) => sum + (map[c.key]?.places?.length || 0), 0)
          if (overpassTotal > 0) {
            console.log(`[NearbyPlaces] Overpass API ile ${overpassTotal} sonuç bulundu`)
          } else {
            console.warn('[NearbyPlaces] Overpass API\'den de sonuç alınamadı')
          }
        } catch (overpassErr) {
          console.error('[NearbyPlaces] Overpass API hatası:', overpassErr.message)
        }
      }

      setData(map)
    }).catch(e => {
      setError(e.message)
    }).finally(() => {
      setLoading(false)
    })
  }, [coords?.[0], coords?.[1], retryKey])

  return { data, loading, error, categories: CATEGORIES }
}
