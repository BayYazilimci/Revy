// Supabase Edge Function: PDF Generator
// İlanları PDF'e dönüştürür

import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function generateHtml(property: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica', sans-serif; margin: 40px; color: #333; }
    h1 { color: #1a2a3a; border-bottom: 3px solid #e3d10d; padding-bottom: 10px; }
    .details { margin: 20px 0; }
    .detail-row { display: flex; margin: 8px 0; }
    .label { font-weight: bold; width: 150px; color: #666; }
    .value { flex: 1; }
    .price { font-size: 24px; color: #059669; font-weight: bold; margin: 20px 0; }
    .footer { margin-top: 40px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>${property.title || 'İlan Detayı'}</h1>
  <div class="price">${property.price_text || ''}</div>
  <div class="details">
    ${property.description ? `<p>${property.description}</p>` : ''}
    ${property.location ? `<div class="detail-row"><span class="label">Konum</span><span class="value">${property.location}</span></div>` : ''}
    ${property.city ? `<div class="detail-row"><span class="label">Şehir</span><span class="value">${property.city}</span></div>` : ''}
    ${property.size_text ? `<div class="detail-row"><span class="label">Büyüklük</span><span class="value">${property.size_text}</span></div>` : ''}
    ${property.rooms ? `<div class="detail-row"><span class="label">Oda</span><span class="value">${property.rooms}</span></div>` : ''}
    ${property.type ? `<div class="detail-row"><span class="label">Tür</span><span class="value">${property.type}</span></div>` : ''}
    ${property.status ? `<div class="detail-row"><span class="label">Durum</span><span class="value">${property.status}</span></div>` : ''}
  </div>
  <div class="footer">
    FSBO ile oluşturulmuştur • ${new Date().toLocaleDateString('tr-TR')}
  </div>
</body>
</html>`
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const { propertyId, userId } = await req.json()

    if (!propertyId) {
      return new Response(JSON.stringify({ error: 'propertyId is required' }), { status: 400 })
    }

    // İlanı getir
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (error || !property) {
      return new Response(JSON.stringify({ error: 'Property not found' }), { status: 404 })
    }

    const html = generateHtml(property)

    // PDF oluştur (html2pdf kullanarak)
    const pdfResponse = await fetch('https://api.html2pdf.app/v1/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html,
        apiKey: Deno.env.get('HTML2PDF_API_KEY') || '',
      }),
    })

    if (!pdfResponse.ok) {
      return new Response(JSON.stringify({ error: 'PDF generation failed' }), { status: 502 })
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()

    // PDF'i Supabase Storage'a yükle
    const fileName = `properties/${propertyId}/listing-${Date.now()}.pdf`
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('pdfs')
      .upload(fileName, new Uint8Array(pdfBuffer), {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 })
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('pdfs')
      .getPublicUrl(fileName)

    return new Response(JSON.stringify({ url: publicUrl }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
