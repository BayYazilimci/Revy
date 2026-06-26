export const districts = [
  { id: 'all', name: 'Tüm Bölgeler', center: [28.985, 41.070], zoom: 12 },
  { id: 'besiktas', name: 'Beşiktaş', center: [28.995, 41.065], zoom: 13 },
  { id: 'kagithane', name: 'Kağıthane', center: [28.970, 41.082], zoom: 13 },
  { id: 'sisli', name: 'Şişli', center: [28.978, 41.060], zoom: 13 },
]

export function getDistrictId(location) {
  const loc = location.toLowerCase()
  if (loc.includes('beşiktaş') || loc.includes('levazım') || loc.includes('etiler') || loc.includes('levent') || loc.includes('gayrettepe') || loc.includes('türkali')) return 'besiktas'
  if (loc.includes('kağıthane') || loc.includes('seyrantepe') || loc.includes('gültepe') || loc.includes('hamidiye')) return 'kagithane'
  if (loc.includes('şişli') || loc.includes('osmanbey') || loc.includes('mecidiyeköy') || loc.includes('fulya')) return 'sisli'
  return null
}

export const districtBoundaries = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'besiktas',
      properties: { name: 'Beşiktaş' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [29.005, 41.045],
          [29.012, 41.048],
          [29.015, 41.052],
          [29.018, 41.056],
          [29.020, 41.060],
          [29.016, 41.064],
          [29.012, 41.068],
          [29.008, 41.072],
          [29.004, 41.076],
          [29.000, 41.078],
          [28.994, 41.080],
          [28.988, 41.081],
          [28.982, 41.080],
          [28.976, 41.078],
          [28.972, 41.074],
          [28.968, 41.070],
          [28.966, 41.066],
          [28.968, 41.062],
          [28.972, 41.058],
          [28.978, 41.054],
          [28.984, 41.050],
          [28.992, 41.046],
          [29.005, 41.045],
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'kagithane',
      properties: { name: 'Kağıthane' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [28.975, 41.065],
          [28.970, 41.068],
          [28.966, 41.072],
          [28.962, 41.076],
          [28.958, 41.080],
          [28.954, 41.084],
          [28.950, 41.088],
          [28.952, 41.092],
          [28.956, 41.096],
          [28.962, 41.099],
          [28.968, 41.101],
          [28.974, 41.102],
          [28.980, 41.101],
          [28.986, 41.099],
          [28.990, 41.096],
          [28.994, 41.092],
          [28.996, 41.088],
          [28.998, 41.084],
          [29.000, 41.080],
          [28.998, 41.076],
          [28.994, 41.072],
          [28.988, 41.068],
          [28.982, 41.066],
          [28.975, 41.065],
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'sisli',
      properties: { name: 'Şişli' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [28.968, 41.048],
          [28.962, 41.052],
          [28.958, 41.056],
          [28.956, 41.060],
          [28.958, 41.064],
          [28.962, 41.068],
          [28.966, 41.070],
          [28.972, 41.071],
          [28.978, 41.070],
          [28.984, 41.068],
          [28.990, 41.066],
          [28.994, 41.064],
          [28.996, 41.060],
          [28.994, 41.056],
          [28.990, 41.052],
          [28.984, 41.049],
          [28.976, 41.047],
          [28.968, 41.048],
        ]]
      }
    },
  ]
}
