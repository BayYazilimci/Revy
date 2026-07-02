// Supabase Edge Function: EVDS Proxy
// TCMB EVDS API'sinden konut fiyat endeksi verilerini çeker ve önbelleğe alır

import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY') || ''
const EVDS_API_KEY = Deno.env.get('EVDS_API_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface EvdsItem {
  Tarih: string
  TP_HKFE01?: string
  TP_HKFE02?: string
  TP_HKFE03?: string
}

serve(async (req) => {
  try {
    // URL'den parametreleri al
    const url = new URL(req.url)
    const series = url.searchParams.get('series') || 'TP.HKFE01-TP.HKFE02-TP.HKFE03'

    // Önbellek kontrolü — son 1 saat içinde çekilen veri var mı?
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: cached } = await supabase
      .from('evds_cache')
      .select('*')
      .eq('series', series)
      .gte('fetched_at', oneHourAgo)
      .maybeSingle()

    if (cached) {
      return new Response(JSON.stringify({ data: cached.data, source: 'cache' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // EVDS API'den veriyi çek
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    const endDate = new Date()
    const fmtDate = (d: Date) => {
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}-${month}-${year}`
    }

    const apiUrl =
      `https://evds2.tcmb.gov.tr/service/evds/series=${series}` +
      `&startDate=${fmtDate(startDate)}&endDate=${fmtDate(endDate)}&type=json&key=${EVDS_API_KEY}`

    const response = await fetch(apiUrl)
    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'EVDS API error' }), { status: 502 })
    }

    const json = await response.json()
    const items: EvdsItem[] = json?.items || []

    const mappedData = items.map(item => ({
      date: item.Tarih || '',
      kfe: parseFloat(item.TP_HKFE01 ?? item['TP.HKFE01']) || null,
      kfeNew: parseFloat(item.TP_HKFE02 ?? item['TP.HKFE02']) || null,
      kfeSecond: parseFloat(item.TP_HKFE03 ?? item['TP.HKFE03']) || null,
    })).filter(r => r.kfe !== null)

    // Önbelleğe kaydet
    await supabase.from('evds_cache').upsert({
      series,
      data: mappedData,
      fetched_at: new Date().toISOString(),
    }, { onConflict: 'series' })

    return new Response(JSON.stringify({ data: mappedData, source: 'live' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
