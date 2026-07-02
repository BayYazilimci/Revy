import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++ }
        else { inQuotes = false }
      } else { current += ch }
    } else {
      if (ch === '"') { inQuotes = true }
      else if (ch === ',') { result.push(current.trim()); current = '' }
      else { current += ch }
    }
  }
  result.push(current.trim())
  return result
}

function esc(s) {
  if (!s) return 'NULL'
  return "'" + s.replace(/'/g, "''") + "'"
}

function parsePrice(s) { if (!s) return 'NULL'; const c = s.replace(/[^\d]/g, ''); return c || 'NULL' }
function parseSize(s) { if (!s) return 'NULL'; const c = s.replace(/[^\d]/g, ''); return c || 'NULL' }

const csvPath = resolve(process.cwd(), 'emlak_verileri.csv')
const content = readFileSync(csvPath, 'utf-8')
const lines = content.split('\n').filter(l => l.trim())
const rows = lines.slice(1)

const BATCH = 50
const chunks = []

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const values = []

  for (const row of batch) {
    const c = parseCSVLine(row)
    if (c.length < 6) continue
    const [csvId, title, priceText, location, rooms, sizeText, listingDate, url, scrapedAt] = c
    const cityPart = (location || '').split(',')[0]?.trim() || ''
    const locPart = (location || '').split(',').slice(1).join(',').trim() || ''
    const createdAt = scrapedAt ? scrapedAt.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1T00:00:00Z') : new Date().toISOString()

    values.push(
      `(${esc(csvId)}, ${esc(title)}, ${esc(url)}, ${esc(locPart || location)}, ${esc(cityPart)}, ${esc(priceText)}, ${parsePrice(priceText)}, ${esc(sizeText)}, ${parseSize(sizeText)}, ${esc(rooms)}, 'Kiralık', 'Daire', 'active', false, ${esc(listingDate)}, ${esc(createdAt)})`
    )
  }

  if (values.length) {
    chunks.push(`INSERT INTO properties (id, title, description, location, city, price_text, price, size_text, size, rooms, type, subtype, status, is_daily, time_text, created_at) VALUES\n${values.join(',\n')}\nON CONFLICT (id) DO NOTHING;`)
  }
}

// Write each chunk to a separate file
for (let i = 0; i < chunks.length; i++) {
  writeFileSync(resolve(process.cwd(), `admin/sql_batch_${i + 1}.sql`), chunks[i])
}

console.log(`Created ${chunks.length} SQL batch files in admin/`)
console.log(`Total rows: ${rows.length}`)
