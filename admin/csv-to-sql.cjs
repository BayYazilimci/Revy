const fs = require('fs')
const path = require('path')

const csv = fs.readFileSync(path.join(__dirname, '..', 'emlak_verileri.csv'), 'utf-8')
const lines = csv.trim().split('\n').slice(1)

function parseCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else { inQuotes = !inQuotes }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function parsePrice(str) {
  if (!str) return null
  const cleaned = str.replace(/[^\d]/g, '')
  return cleaned ? parseInt(cleaned, 10) : null
}

function parseSize(str) {
  if (!str) return null
  const match = str.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

function parseCity(location) {
  if (!location) return ''
  const parts = location.split(',')
  return parts[0]?.trim() || ''
}

function escapeSql(str) {
  if (!str) return 'NULL'
  return "'" + str.replace(/'/g, "''") + "'"
}

const seen = new Set()
const rows = []
for (const line of lines) {
  if (!line.trim()) continue
  const cols = parseCsvLine(line)
  if (cols.length < 9) continue
  const [id, title, price, location, rooms, squareMeters, listingDate, url, scrapedAt] = cols
  if (!id || seen.has(id)) continue
  seen.add(id)
  rows.push({ id, title, price, location, rooms, squareMeters, listingDate, url, scrapedAt })
}

const OWNER_ID = '00000000-0000-0000-0000-000000000001'

let sql = `-- emlak_verileri.csv → properties tablosu import
-- Toplam: ${rows.length} kayıt (tekrarlar çıkarıldı)
-- Sahip ID: ${OWNER_ID} (admin kullanıcısı)
-- NOT: owner_id, mevcut bir public.users satırının id'si olmalı
-- NOT: id otomatik oluşturuluyor (uuid_generate_v4)

INSERT INTO public.properties (
  owner_id, title, description, location, city,
  price_text, price, size_text, size,
  rooms, status, time_text, is_daily, created_at, updated_at
) VALUES\n`

const values = rows.map(r => {
  const priceText = r.price?.trim() || ''
  const sizeText = r.squareMeters?.trim() || ''
  const title = r.title?.trim() || ''
  const location = r.location?.trim() || ''
  const city = parseCity(location)
  const price = parsePrice(priceText)
  const size = parseSize(sizeText)
  const rooms = r.rooms?.trim() || ''
  const listingDate = r.listingDate?.trim() || ''
  const scrapedAt = r.scrapedAt?.trim() || ''
  const url = r.url?.trim() || ''

  return `  ('${OWNER_ID}', ${escapeSql(title)}, ${escapeSql(url)}, ${escapeSql(location)}, ${escapeSql(city)}, ${escapeSql(priceText)}, ${price || 'NULL'}, ${escapeSql(sizeText)}, ${size || 'NULL'}, ${escapeSql(rooms)}, 'Aktif', ${escapeSql(listingDate)}, false, ${escapeSql(scrapedAt)}::timestamptz, ${escapeSql(scrapedAt)}::timestamptz)`
}).join(',\n')

sql += values + ';'

fs.writeFileSync(path.join(__dirname, '..', 'supabase', 'seed_properties.sql'), sql)
console.log(`Done: ${rows.length} rows written`)
