// Supabase Edge Function: AI Assistant
// Claude API proxy — kullanıcı sorgularını Claude'a iletir

import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0'

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const { prompt, userId } = await req.json()

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 })
    }

    // Kullanıcı yetkilendirme kontrolü
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('role, subscription:subscriptions(plan_id)')
        .eq('id', userId)
        .single()

      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
      }

      const plan = user.subscription?.[0]?.plan_id || 'free'
      if (plan === 'free') {
        return new Response(
          JSON.stringify({ error: 'AI asistan özelliği Pro ve Kurumsal paketlerde kullanılabilir.' }),
          { status: 403 }
        )
      }
    }

    // Claude API çağrısı
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: 'Sen FSBOAI adında bir emlak danışmanı asistanısın. Türkçe yanıt ver. Kullanıcılara emlak alım/satım/kiralama konusunda yardımcı ol.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: 'Claude API error', details: err }), { status: 502 })
    }

    const data = await response.json()
    const answer = data.content?.[0]?.text || ''

    return new Response(JSON.stringify({ answer }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
