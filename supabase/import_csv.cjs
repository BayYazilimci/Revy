const fs = require('fs')
const path = require('path')

const csvPath = path.join(__dirname, '..', 'emlak_verileri.csv')
const outputPath = path.join(__dirname, 'import_all_properties.sql')

const OWNER_ID = '00000000-0000-0000-0000-000000000001'

const csv = fs.readFileSync(csvPath, 'utf-8')
const lines = csv.split('\n').filter(l => l.trim())
const header = lines[0]
const rows = lines.slice(1)

function escapeSql(str) {
  if (!str) return ''
  return str.replace(/'/g, "''")
}

function parsePrice(text) {
  if (!text) return 0
  return parseInt(text.replace(/[^\d]/g, '')) || 0
}

function parseSize(text) {
  if (!text) return 0
  return parseInt(text.replace(/[^\d]/g, '')) || 0
}

function extractCity(location) {
  if (!location) return ''
  const parts = location.split(',')
  return parts[0].trim()
}

function parseCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        result.push(current)
        current = ''
      } else {
        current += ch
      }
    }
  }
  result.push(current)
  return result
}

const values = []

for (const row of rows) {
  const cols = parseCsvLine(row)
  if (cols.length < 9) continue

  const [id, title, price, location, rooms, squareMeters, listingDate, url, scrapedAt] = cols

  const city = extractCity(location)
  const priceInt = parsePrice(price)
  const sizeInt = parseSize(squareMeters)
  const priceText = price.trim()
  const sizeText = squareMeters.trim()
  const now = scrapedAt ? `'${scrapedAt.trim()}'::timestamptz` : 'now()'
  const listingTime = listingDate.trim()

  values.push(
    `('${OWNER_ID}', '${escapeSql(title.trim())}', '${escapeSql(url.trim())}', '${escapeSql(location.trim())}', '${escapeSql(city)}', '${escapeSql(priceText)}', ${priceInt}, '${escapeSql(sizeText)}', ${sizeInt}, '${escapeSql(rooms.trim())}', 'Aktif', '${escapeSql(listingTime)}', false, ${now}, ${now})`
  )
}

const sql = `-- import_all_properties.sql — CSV'den toplu import
-- Toplam: ${values.length} kayıt
-- Çalıştırmak için: Supabase Dashboard > SQL Editor > Run
-- NOT: owner_id, mevcut bir public.users satırının id'si olmalı

INSERT INTO public.properties (
  owner_id, title, description, location, city,
  price_text, price, size_text, size,
  rooms, status, time_text, is_daily, created_at, updated_at
) VALUES
${values.join(',\n')};
`

fs.writeFileSync(outputPath, sql, 'utf-8')
console.log(`✓ ${values.length} kayıt işlendi → ${outputPath}`)
