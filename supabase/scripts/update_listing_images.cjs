// update_listing_images.cjs
// test_output.csv dosyasını okuyarak properties tablosundaki
// ilanların img ve all_images alanlarını günceller.
//
// Kullanım: node supabase/scripts/update_listing_images.cjs
// Çıktı: supabase/seed_images.sql dosyası

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '../..')
const CSV_PATH = path.join(ROOT, 'test_output.csv')
const OUTPUT_PATH = path.join(ROOT, 'supabase', 'seed_images.sql')

// CSV dosyasını oku
const csvRaw = fs.readFileSync(CSV_PATH, 'utf-8')
const lines = csvRaw.split('\n').filter(l => l.trim())

// Header'ı parse et
const header = lines[0].split(',')
const listingIdIdx = header.indexOf('listing_id')
const allImagesIdx = header.indexOf('all_images')

console.log(`Header: listing_id=${listingIdIdx}, all_images=${allImagesIdx}`)

// all_images alanını pipe-separated'den array'e çevir
function parseAllImages(raw) {
  if (!raw) return []
  return raw
    .split(' | ')
    .map(url => url.trim())
    .filter(url => url && url.startsWith('http'))
}

// Her satırdan listing_id -> images eşlemesini çıkar
const listingImages = []

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim()
  if (!line) continue

  // Basit CSV parse: listing_id (1. indeks) ve all_images (son indeks)
  const parts = line.split(',')
  
  const listingId = parts[listingIdIdx]
  // all_images: pipe-separated, son indeksten başlayıp scraped_at'e kadar olan her şey
  const allImagesRaw = parts.slice(allImagesIdx).join(',')
  
  if (!listingId || !allImagesRaw) continue

  // all_images: pipe-separated URLs - scraped_at zaman damgasını temizle
  let imagesStr = allImagesRaw.replace(/,\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/, '')
  const images = parseAllImages(imagesStr)

  if (images.length > 0) {
    listingImages.push({ listingId, images })
  }
}

console.log(`Toplam ${listingImages.length} ilan için resim verisi bulundu`)

// SQL oluştur
const sqlLines = []
sqlLines.push('-- seed_images.sql')
sqlLines.push('-- Scraper verisinden çekilen resimlerle properties tablosunu güncelle')
sqlLines.push('-- Supabase Dashboard > SQL Editor > Run')
sqlLines.push('')
sqlLines.push(`-- Toplam: ${listingImages.length} ilan güncellenecek`)
sqlLines.push('')

for (const { listingId, images } of listingImages) {
  const escapedImages = images.map(img => img.replace(/'/g, "''"))
  const firstImg = escapedImages[0]
  // PostgreSQL text array literal: '{"url1","url2"}'
  const imgArrayStr = '{"' + escapedImages.join('","') + '"}'

  sqlLines.push(`-- İlan #${listingId} (${images.length} resim)`)
  sqlLines.push(`UPDATE public.properties`)
  sqlLines.push(`SET img = '${firstImg}', all_images = '${imgArrayStr}'::text[]`)
  sqlLines.push(`WHERE description LIKE '%-${listingId}'`)
  sqlLines.push(`  AND (img IS NULL OR img = '' OR img LIKE '%unsplash%');`)
  sqlLines.push('')
}

sqlLines.push('-- İşlem tamamlandı')
sqlLines.push(`-- Toplam: ${listingImages.length} ilan güncellendi`)
sqlLines.push('')

const output = sqlLines.join('\n')
fs.writeFileSync(OUTPUT_PATH, output, 'utf-8')

console.log(`SQL dosyası oluşturuldu: ${OUTPUT_PATH}`)
console.log(`Örnek: İlk 3 ilan:`)
listingImages.slice(0, 3).forEach(({ listingId, images }) => {
  console.log(`  #${listingId}: ${images.length} resim`)
  console.log(`    İlk: ${images[0]}`)
})
