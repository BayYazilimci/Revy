import { readFileSync } from 'fs'
import { resolve } from 'path'
import { randomUUID } from 'crypto'

const SUPABASE_URL = 'https://fnkneaxblykzvhdslcrg.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua25lYXhibHlrenZoZHNsY3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NDQzMjAsImV4cCI6MjA5ODQyMDMyMH0.D9_xIItbGbkijd8a7YviP-fmpk2PB34o18lgtV_I7qc'

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

function parsePrice(s) { if (!s) return null; const c = s.replace(/[^\d]/g, ''); return c ? parseInt(c) : null }
function parseSize(s) { if (!s) return null; const c = s.replace(/[^\d]/g, ''); return c ? parseInt(c) : null }

async function upsertBatch(records) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/properties`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(records),
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`${resp.status}: ${text}`)
  }
}

async function main() {
  const csvPath = resolve(process.cwd(), 'emlak_verileri.csv')
  console.log(`CSV: ${csvPath}`)

  const content = readFileSync(csvPath, 'utf-8')
  const lines = content.split('\n').filter(l => l.trim())
  const rows = lines.slice(1)
  console.log(`Satir: ${rows.length}`)

  const BATCH = 100
  let ok = 0, fail = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const records = []

    for (const row of batch) {
      const c = parseCSVLine(row)
      if (c.length < 6) continue
      const [csvId, title, priceText, location, rooms, sizeText, listingDate, url, scrapedAt] = c
      const cityPart = (location || '').split(',')[0]?.trim() || ''
      const locPart = (location || '').split(',').slice(1).join(',').trim() || ''

      records.push({
        id: randomUUID(),
        title: title || '',
        description: url || '',
        location: locPart || location || '',
        city: cityPart,
        price_text: priceText || '',
        price: parsePrice(priceText),
        size_text: sizeText || '',
        size: parseSize(sizeText),
        rooms: rooms || '',
        type: 'Kiralık',
        subtype: 'Daire',
        status: 'active',
        is_daily: false,
        time_text: listingDate || '',
        created_at: scrapedAt ? new Date(scrapedAt).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    if (!records.length) continue
    try {
      await upsertBatch(records)
      ok += records.length
      process.stdout.write(`\r  ${ok}/${rows.length} yuklendi...`)
    } catch (e) {
      fail += records.length
      console.error(`\n  Batch ${Math.floor(i/BATCH)+1} hata: ${e.message}`)
    }
  }

  console.log(`\n\nTamamlandi! Yuklenen: ${ok}, Hatali: ${fail}`)
}

main().catch(e => { console.error(e); process.exit(1) })
