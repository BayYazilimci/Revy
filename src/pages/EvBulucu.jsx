import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Home, MapPin, Star, Search, Sparkles } from 'lucide-react'
import { usePropertyData } from '../context/PropertiesContext'
import { parseUserMessage, findBestMatches, generateResponse } from '../utils/evBulucuUtils'

function formatPrice(price) {
  if (!price) return ''
  const num = typeof price === 'string' ? parseFloat(price.replace(/[^0-9,.-]/g, '').replace(',', '')) : price
  if (isNaN(num)) return price
  return '₺' + num.toLocaleString('tr-TR')
}

function formatSize(size) {
  if (!size) return ''
  const num = parseFloat(size.replace(/[^0-9]/g, ''))
  return isNaN(num) ? size : num + ' m²'
}

const SUGGESTIONS = [
  { icon: Search, label: '3+1 kiralik, Istanbul' },
  { icon: Sparkles, label: 'Fiber internetli ev' },
  { icon: Home, label: 'Ankara\'da 2+1 satilik' },
  { icon: Star, label: 'Havuzlu site icinde' },
]

function ScoreBadge({ pct }) {
  const cfg = pct >= 80 ? { color: '#059669', bg: '#d1fae5', label: 'Mukemmel' }
    : pct >= 60 ? { color: '#3b82f6', bg: '#dbeafe', label: 'Iyi' }
    : pct >= 30 ? { color: '#d97706', bg: '#fef3c7', label: 'Kismen' }
    : { color: '#dc2626', bg: '#fde8e8', label: 'Az' }
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: pct + '%', background: cfg.color }} />
      </div>
      <span className="text-[9px] font-bold" style={{ color: cfg.color }}>%{pct}</span>
    </div>
  )
}

function StarRating({ pct }) {
  const stars = Math.min(5, Math.max(1, Math.round(pct / 20)))
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={9} className={i <= stars ? 'fill-current' : 'text-gray-200'} style={{ color: i <= stars ? '#e3d10d' : undefined }} />
      ))}
    </div>
  )
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60'

export default function EvBulucu() {
  const { properties } = usePropertyData()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'assistant', text: '', results: [] }])
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (text) => {
    const query = (text || input).trim()
    if (!query || loading) return

    const userMsg = { id: 'user-' + Date.now(), role: 'user', text: query }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const criteria = parseUserMessage(query)
      const results = findBestMatches(properties, criteria, 15)
      const response = generateResponse(criteria, results)
      setMessages(prev => [...prev, {
        id: 'asst-' + Date.now(),
        role: 'assistant',
        text: response.message,
        results: response.results,
        criteria,
      }])
      setLoading(false)
    }, 600)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasMessages = messages.length > 1 || (messages.length === 1 && messages[0].results?.length > 0)
  const isWelcome = messages.length === 1 && messages[0].id === 'welcome'

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 sm:px-6 lg:px-8 mt-4 mb-2">
        <div className="flex items-center justify-between animate-fade-up" style={{ animationDelay: '.04s' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md" style={{ background: '#1e1b2e' }}>
              <Home size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold" style={{ color: '#1e1b2e' }}>Ev Bulucu</h2>
              <p className="text-[10px] font-semibold text-gray-400 -mt-0.5">AI destekli akilli ev arama motoru</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold" style={{ background: '#e3d10d', color: '#1e1b2e' }}>
              {Object.keys(properties).length} ilan
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="max-w-3xl mx-auto">
          {isWelcome ? (
            <div className="animate-fade-up pt-2">
              <div className="bg-white rounded-2xl border border-cardBorder p-6 shadow-sm text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md" style={{ background: '#1e1b2e' }}>
                  <Home size={24} className="text-white" />
                </div>
                <h3 className="text-base font-extrabold mb-1" style={{ color: '#1e1b2e' }}>Hayalindeki evi bul</h3>
                <p className="text-xs font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Kriterlerini yaz, AI sana en uygun ilanlari siralasin. Ne kadar detayli yazarsan o kadar dogru eslesme buluruz.
                </p>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-semibold text-gray-400 mb-2.5 text-center">Hizli baslangic icin birini sec:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SUGGESTIONS.map((s, i) => {
                    const Icon = s.icon
                    return (
                      <button
                        key={i}
                        onClick={() => { setInput(s.label); handleSend(s.label) }}
                        className="flex items-center gap-2 px-3.5 py-3 rounded-xl text-[11px] font-bold btn bg-white border border-cardBorder hover:bg-cream transition-all shadow-sm"
                        style={{ color: '#1e1b2e' }}
                      >
                        <Icon size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate">{s.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg.id}>
                  {msg.role === 'assistant' ? (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: '#1e1b2e' }}>
                        <Bot size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        {msg.text && (
                          <div className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm">
                            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap" style={{ color: '#1e1b2e' }}>{msg.text}</p>
                          </div>
                        )}

                        {msg.results?.length > 0 && (
                          <div className="space-y-2">
                            {msg.results.map((result, i) => {
                              const p = result.property
                              if (!p) return null
                              const isExpanded = expandedId === p.id
                              return (
                                <div key={p.id} style={{ animation: `fadeInUp .35s ease-out ${i * 0.04}s forwards` }} className="opacity-0">
                                  <div
                                    className={`bg-white rounded-2xl border overflow-hidden shadow-sm btn transition-all ${
                                      isExpanded ? 'border-accent/40 ring-1 ring-accent/20' : 'border-cardBorder hover:shadow-md'
                                    }`}
                                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                                  >
                                    <div className="flex gap-3 p-3">
                                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                                        <img
                                          src={p.img || FALLBACK_IMG}
                                          alt={p.title}
                                          className="w-full h-full object-cover"
                                          loading="lazy"
                                          onError={(e) => { e.target.src = FALLBACK_IMG }}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                          <h3 className="text-xs font-extrabold leading-snug line-clamp-2" style={{ color: '#1e1b2e' }}>
                                            {p.title}
                                          </h3>
                                        </div>
                                        <p className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                                          <MapPin size={9} />
                                          {p.location}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold">
                                          <span style={{ color: '#1e1b2e' }}>{p.rooms || '?'}</span>
                                          <span className="text-gray-300">|</span>
                                          <span className="text-gray-500">{formatSize(p.size)}</span>
                                          <span className="text-gray-300">|</span>
                                          <span className="font-extrabold" style={{ color: '#059669' }}>{formatPrice(p.price)}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1.5">
                                          <ScoreBadge pct={result.matchPercent} />
                                          <StarRating pct={result.matchPercent} />
                                        </div>
                                        {result.reasons?.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {result.reasons.slice(0, 2).map((r, ri) => (
                                              <span key={ri} className="px-1.5 py-0.5 rounded text-[7px] font-bold" style={{ background: '#f0ece6', color: '#1e1b2e' }}>
                                                {r}
                                              </span>
                                            ))}
                                            {result.reasons.length > 2 && (
                                              <span className="text-[7px] font-medium text-gray-400">+{result.reasons.length - 2}</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {isExpanded && (
                                      <div className="border-t" style={{ borderColor: '#f0ece6' }}>
                                        <div className="px-3 py-3 text-xs space-y-2" style={{ background: '#faf7f2' }}>
                                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                                            <span>{p.rooms || '-'}</span>
                                            <span>{formatSize(p.size)}</span>
                                            <span className="font-bold" style={{ color: '#059669' }}>{formatPrice(p.price)}</span>
                                            <span>{p.location}</span>
                                          </div>
                                          {p.desc && (
                                            <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">{p.desc}</p>
                                          )}
                                          <div className="flex items-center gap-3 pt-1">
                                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white border" style={{ borderColor: '#f0ece6' }}>
                                              %{result.matchPercent} eslesme
                                            </span>
                                            <StarRating pct={result.matchPercent} />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 justify-end">
                      <div className="bg-deep rounded-2xl px-4 py-3 shadow-sm max-w-[75%]">
                        <p className="text-sm font-medium text-white whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 bg-cream border border-cardBorder">
                        <span className="text-[10px] font-extrabold" style={{ color: '#1e1b2e' }}>S</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: '#1e1b2e' }}>
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-white rounded-2xl border border-cardBorder px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-deep animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-deep animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-deep animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-4 pt-3 border-t border-cardBorder" style={{ background: '#faf7f2' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-cardBorder shadow-sm px-4 py-1.5">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Sehir, oda sayisi, butce, ozellikler..."
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium py-2.5"
              style={{ color: '#1e1b2e' }}
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center btn transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: !input.trim() || loading ? '#e5e7eb' : '#1e1b2e' }}
            >
              <Send size={14} className={!input.trim() || loading ? 'text-gray-400' : 'text-white'} />
            </button>
          </div>
          <p className="text-[9px] font-medium text-gray-400 mt-1.5 text-center">
            Ornek: "Istanbul Besiktas\'ta 3+1 kiralik, butcem 25.000 TL, fiber internetli"
          </p>
        </div>
      </div>
    </div>
  )
}
