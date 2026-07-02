import { readFileSync } from 'fs'
import { resolve } from 'path'

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

async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(15000),
      })
      if (resp.ok) return await resp.text()
      if (resp.status === 429) {
        const wait = (i + 1) * 5000
        console.log(`  429 - ${wait/1000}s bekleniyor...`)
        await new Promise(r => setTimeout(r, wait))
        continue
      }
      return null
    } catch (e) {
      if (i < retries) await new Promise(r => setTimeout(r, 2000))
      else return null
    }
  }
  return null
}

function extractImage(html) {
  if (!html) return null

  // og:image
  const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
    || html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i)
  if (ogMatch) return ogMatch[1]

  // RSC payload - images array
  const rscMatch = html.match(/"images"\s*:\s*\[(.*?)\]/s)
  if (rscMatch) {
    try {
      const urls = [...rscMatch[1].matchAll(/"url"\s*:\s*"([^"]+)"/g)].map(m => m[1])
      if (urls.length) return urls[0]
    } catch {}
  }

  // First img in listing detail
  const imgMatch = html.match(/<img[^>]+src="(https?:\/\/[^"]*emlakjet[^"]*\.(jpg|jpeg|png|webp)[^"]*)"/i)
  if (imgMatch) return imgMatch[1]

  return null
}

async function main() {
  const csvPath = resolve(process.cwd(), 'emlak_verileri.csv')
  const content = readFileSync(csvPath, 'utf-8')
  const lines = content.split('\n').filter(l => l.trim())
  const rows = lines.slice(1)

  // Build csvId -> url map from CSV
  const listings = []
  for (const row of rows) {
    const c = parseCSVLine(row)
    if (c.length < 8) continue
    const [csvId, title, priceText, location, rooms, sizeText, listingDate, url] = c
    if (url && url.startsWith('http')) {
      listings.push({ csvId, url })
    }
  }
  console.log(`Toplam URL: ${listings.length}`)

  // Get all Supabase properties to match by description (url)
  console.log('Supabase verileri aliniyor...')
  const allProps = []
  let offset = 0
  while (true) {
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/properties?select=id,description,img&limit=1000&offset=${offset}`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    )
    const data = await resp.json()
    if (!data.length) break
    allProps.push(...data)
    offset += 1000
    if (data.length < 1000) break
  }
  console.log(`Supabase'de ${allProps.length} ilan var`)

  // Build url -> dbId map
  const urlToDbId = {}
  for (const p of allProps) {
    if (p.description) urlToDbId[p.description] = p.id
  }

  // Find listings that need images
  const needImage = listings.filter(l => {
    const dbId = urlToDbId[l.url]
    if (!dbId) return false
    const prop = allProps.find(p => p.id === dbId)
    return prop && !prop.img
  })
  console.log(`Fotografi olmayan ilan: ${needImage.length}`)

  const BATCH = 5
  let updated = 0
  let failed = 0
  let skipped = 0

  for (let i = 0; i < needImage.length; i += BATCH) {
    const batch = needImage.slice(i, i + BATCH)
    const promises = batch.map(async ({ csvId, url }) => {
      try {
        const html = await fetchWithRetry(url)
        if (!html) { failed++; return }

        const imgUrl = extractImage(html)
        if (!imgUrl) { skipped++; return }

        const dbId = urlToDbId[url]
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/properties?id=eq.${dbId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ img: imgUrl }),
        })
        if (resp.ok) {
          updated++
        } else {
          failed++
        }
      } catch {
        failed++
      }
    })

    await Promise.all(promises)
    process.stdout.write(`\r  ${updated} guncellendi / ${skipped} resim yok / ${failed} hatali (${i + batch.length}/${needImage.length})`)

    // Small delay between batches
    if (i + BATCH < needImage.length) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  console.log(`\n\nTamamlandi! Guncellenen: ${updated}, Resim yok: ${skipped}, Hatali: ${failed}`)
}

main().catch(e => { console.error(e); process.exit(1) })
