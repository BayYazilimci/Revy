import { useState, useEffect } from 'react'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

const walkMinutes = m => Math.max(1, Math.round(m / 80))
const carMinutes = m => Math.max(1, Math.round(m / 500))
const formatDistance = m => m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`

// Mapbox Search Box API category endpoint
// https://docs.mapbox.com/api/search/search-box/
async function fetchCategory(categories, lng, lat) {
  const url =
    `https://api.mapbox.com/search/searchbox/v1/category/${categories}` +
    `?access_token=${MAPBOX_TOKEN}` +
    `&proximity=${lng},${lat}` +
    `&limit=5` +
    `&language=tr`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status}`)
  const json = await res.json()

  return (json.features || []).map(f => {
    const dist = Math.round(f.properties?.distance ?? 0)
    return {
      name: f.properties?.name || f.properties?.full_address || '',
      dist,
      distLabel: formatDistance(dist),
      walk: walkMinutes(dist),
      car: carMinutes(dist),
    }
  }).filter(p => p.name).sort((a, b) => a.dist - b.dist)
}

// Mapbox Search Box API category names
// https://docs.mapbox.com/api/search/search-box/#category-coverage
export const CATEGORIES = [
  {
    key: 'transport',
    label: 'Ulaşım',
    color: 'rgb(84, 110, 122)',
    iconType: 'transport',
    mapboxCat: 'bus_stop,transit_stop,train_station,subway_entrance',
  },
  {
    key: 'school',
    label: 'Eğitim',
    color: 'rgb(21, 101, 192)',
    iconType: 'school',
    mapboxCat: 'school,university,kindergarten,college',
  },
  {
    key: 'hospital',
    label: 'Sağlık',
    color: 'rgb(211, 47, 47)',
    iconType: 'hospital',
    mapboxCat: 'hospital,pharmacy,doctor,dentist,veterinary',
  },
  {
    key: 'market',
    label: 'Market',
    color: 'rgb(0, 137, 123)',
    iconType: 'market',
    mapboxCat: 'supermarket,grocery,convenience_store',
  },
  {
    key: 'mall',
    label: 'AVM',
    color: 'rgb(92, 107, 192)',
    iconType: 'mall',
    mapboxCat: 'shopping_mall,shopping_center',
  },
  {
    key: 'cafe',
    label: 'Kafe & Restoran',
    color: 'rgb(109, 76, 65)',
    iconType: 'cafe',
    mapboxCat: 'cafe,restaurant,fast_food_restaurant,bakery',
  },
  {
    key: 'entertainment',
    label: 'Eğlence',
    color: 'rgb(233, 30, 99)',
    iconType: 'entertainment',
    mapboxCat: 'bar,nightclub,movie_theater,entertainment',
  },
  {
    key: 'culture',
    label: 'Kültür & Sanat',
    color: 'rgb(142, 36, 170)',
    iconType: 'culture',
    mapboxCat: 'library,museum,art_gallery,cultural_center',
  },
  {
    key: 'sport',
    label: 'Spor',
    color: 'rgb(46, 125, 50)',
    iconType: 'sport',
    mapboxCat: 'gym,fitness_center,sports_complex,swimming_pool',
  },
  {
    key: 'mosque',
    label: 'İbadet',
    color: 'rgb(0, 131, 143)',
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
]

export function useNearbyPlaces(coords) {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!coords) return
    const [lng, lat] = coords
    setLoading(true)
    setError(null)
    setData({})

    Promise.all(
      CATEGORIES.map(cat =>
        fetchCategory(cat.mapboxCat, lng, lat)
          .then(places => ({ ...cat, places }))
          .catch(() => ({ ...cat, places: [] }))
      )
    ).then(results => {
      const map = {}
      results.forEach(r => { map[r.key] = r })
      setData(map)
    }).catch(e => {
      setError(e.message)
    }).finally(() => {
      setLoading(false)
    })
  }, [coords?.[0], coords?.[1]])

  return { data, loading, error, categories: CATEGORIES }
}
