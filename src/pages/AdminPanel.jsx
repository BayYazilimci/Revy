import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAccounts } from '../hooks/useAccounts'
import { useAdminOverview } from '../hooks/useAdminOverview'
import {
  Users, UserCheck, UserPlus, Crown, ShieldCheck, Search, Activity,
  TrendingUp, TrendingDown, MoreVertical, Ban, Eye, ArrowUpRight,
  Circle, Clock, MapPin, Globe, Server, Cpu, AlertTriangle, CheckCircle2,
  LayoutDashboard, LogOut, Bell, Settings, Menu, X,
  Phone, Smartphone, Calendar, Lock, Unlock, ShieldOff, ArrowUpDown,
  Mail, Building2, ChevronRight, Wifi, Home, CalendarClock, Database
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Veriler gerçek backend'den gelir (/admin/overview, /admin/accounts) */
/* ------------------------------------------------------------------ */

// Backend KPI'larında ikon adı string olarak gelir → bileşene eşle
const KPI_ICONS = { Users, UserCheck, UserPlus, Crown }

function formatUptime(sec = 0) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return `${h}s ${m}dk`
  return `${m}dk`
}

const STATUS_STYLE = {
  aktif: { dot: '#10b981', text: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15', label: 'Aktif' },
  pasif: { dot: '#94a3b8', text: 'text-gray-500', bg: 'bg-gray-400/10', border: 'border-gray-300/40', label: 'Pasif' },
  kisitli: { dot: '#f59e0b', text: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/15', label: 'Kısıtlı' },
  banli: { dot: '#ef4444', text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/15', label: 'Yasaklı' },
}

/* ------------------------------------------------------------------ */
/*  Yardımcı: sayaç animasyonu (count-up)                              */
/* ------------------------------------------------------------------ */
function useCountUp(target, duration = 1300) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf, start
    const step = (t) => {
      if (!start) start = t
      const p = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}

function CountUp({ value, format = (n) => n.toLocaleString('tr-TR') }) {
  const v = useCountUp(value)
  return <>{format(v)}</>
}

/* ------------------------------------------------------------------ */
/*  Animasyonlu alan/çizgi grafik (kullanıcı büyümesi)                 */
/* ------------------------------------------------------------------ */
function GrowthChart({ data }) {
  const w = 720, h = 240, pad = 28
  const [hover, setHover] = useState(null)
  const max = Math.max(...data.map(d => d.v)) * 1.08
  const min = Math.min(...data.map(d => d.v)) * 0.92
  const x = (i) => pad + (i * (w - pad * 2)) / (data.length - 1)
  const y = (v) => h - pad - ((v - min) / (max - min)) * (h - pad * 2)

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.v)}`).join(' ')
  const areaPath = `${linePath} L ${x(data.length - 1)} ${h - pad} L ${x(0)} ${h - pad} Z`

  const lineRef = useRef(null)
  const [len, setLen] = useState(0)
  useEffect(() => { if (lineRef.current) setLen(lineRef.current.getTotalLength()) }, [data])

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e3d10d" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#e3d10d" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* yatay ızgara */}
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
        <line key={i} x1={pad} x2={w - pad} y1={pad + p * (h - pad * 2)} y2={pad + p * (h - pad * 2)}
          stroke="#f0ece6" strokeWidth="1" />
      ))}

      {/* dolgu alanı */}
      <path d={areaPath} fill="url(#growthFill)" style={{ opacity: len ? 1 : 0, transition: 'opacity .8s ease .6s' }} />

      {/* çizgi (çizilme animasyonu) */}
      <path ref={lineRef} d={linePath} fill="none" stroke="#e3d10d" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round"
        style={{
          strokeDasharray: len, strokeDashoffset: len,
          animation: len ? 'admDraw 1.4s cubic-bezier(.4,0,.2,1) forwards' : 'none',
          filter: 'drop-shadow(0 4px 8px rgba(227,209,13,.35))'
        }} />

      {/* noktalar + hover */}
      {data.map((d, i) => (
        <g key={i}
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
          style={{ cursor: 'pointer' }}>
          <rect x={x(i) - 18} y={pad} width="36" height={h - pad * 2} fill="transparent" />
          <circle cx={x(i)} cy={y(d.v)} r={hover === i ? 6 : 3.5}
            fill="#1e1b2e" stroke="#e3d10d" strokeWidth="2.5"
            style={{ opacity: 0, animation: `admPop .4s ease forwards`, animationDelay: `${0.6 + i * 0.06}s`, transition: 'r .15s ease' }} />
          {hover === i && (
            <g>
              <rect x={x(i) - 34} y={y(d.v) - 42} width="68" height="30" rx="8" fill="#1e1b2e" />
              <text x={x(i)} y={y(d.v) - 28} textAnchor="middle" fill="#e3d10d" fontSize="12" fontWeight="800">
                {d.v.toLocaleString('tr-TR')}
              </text>
              <text x={x(i)} y={y(d.v) - 17} textAnchor="middle" fill="#ffffff99" fontSize="8" fontWeight="700">
                {d.m}
              </text>
            </g>
          )}
          <text x={x(i)} y={h - 8} textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="700">{d.m}</text>
        </g>
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Animasyonlu bar grafik (haftalık aktif)                            */
/* ------------------------------------------------------------------ */
function WeeklyBars({ data }) {
  const max = Math.max(...data.map(d => d.v))
  return (
    <div className="flex items-end justify-between gap-2 h-44 px-1">
      {data.map((d, i) => {
        const pct = (d.v / max) * 100
        const isPeak = d.v === max
        return (
          <div key={d.d} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="relative w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t-lg origin-bottom transition-all duration-300 group-hover:brightness-110 relative"
                style={{
                  height: `${pct}%`,
                  background: isPeak
                    ? 'linear-gradient(180deg,#e3d10d,#cabb0b)'
                    : 'linear-gradient(180deg,#1e1b2e,#3b3550)',
                  animation: 'admGrow .9s cubic-bezier(.34,1.56,.64,1) forwards',
                  animationDelay: `${i * 0.08}s`,
                  transform: 'scaleY(0)',
                  boxShadow: isPeak ? '0 4px 16px rgba(227,209,13,.4)' : 'none',
                }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-extrabold text-deep opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {d.v.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-400">{d.d}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Animasyonlu donut (plan dağılımı)                                  */
/* ------------------------------------------------------------------ */
function PlanDonut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const r = 70, c = 2 * Math.PI * r, sw = 22
  let offset = 0
  const segs = data.map((d) => {
    const frac = d.value / total
    const seg = { ...d, frac, dash: frac * c, offset: offset * c }
    offset += frac
    return seg
  })
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative flex-shrink-0">
        <svg viewBox="0 0 180 180" className="w-40 h-40 -rotate-90">
          <circle cx="90" cy="90" r={r} fill="none" stroke="#f0ece6" strokeWidth={sw} />
          {segs.map((s, i) => (
            <circle key={i} cx="90" cy="90" r={r} fill="none" stroke={s.color} strokeWidth={sw}
              strokeLinecap="round"
              strokeDasharray={`${s.dash} ${c - s.dash}`}
              style={{
                strokeDashoffset: -s.offset,
                opacity: 0,
                animation: `admDonut .9s ease forwards`,
                animationDelay: `${0.2 + i * 0.18}s`,
                transformOrigin: 'center',
              }} />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className="text-2xl font-black text-deep leading-none">
            <CountUp value={total} />
          </span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mt-1">Toplam</span>
        </div>
      </div>
      <div className="flex-1 w-full space-y-2.5">
        {segs.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-2 animate-fade-up" style={{ animationDelay: `${0.3 + i * 0.1}s`, opacity: 0 }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-xs font-bold text-deep truncate">{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-deep">{s.value.toLocaleString('tr-TR')}</span>
              <span className="text-[10px] font-bold text-gray-400 w-9 text-right">%{Math.round(s.frac * 100)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sistem sağlık göstergesi (animasyonlu progress)                    */
/* ------------------------------------------------------------------ */
function HealthBar({ label, value, color, icon: Icon }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-deep">
          <Icon size={12} style={{ color }} /> {label}
        </span>
        <span className="text-[11px] font-extrabold" style={{ color }}>%<CountUp value={value} format={(n) => n} /></span>
      </div>
      <div className="h-2 rounded-full bg-cream overflow-hidden">
        <div className="h-full rounded-full" style={{
          width: `${value}%`, background: color,
          animation: 'admBar 1.2s cubic-bezier(.4,0,.2,1) forwards', transform: 'scaleX(0)', transformOrigin: 'left',
        }} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Kullanıcı detay paneli (sağdan açılır drawer)                       */
/* ------------------------------------------------------------------ */
function UserDetailDrawer({ account, isSelf, onClose, onStatus }) {
  const [confirmBan, setConfirmBan] = useState(false)
  const [reason, setReason] = useState('')

  // account değişince ban onayını sıfırla
  useEffect(() => { setConfirmBan(false); setReason('') }, [account?.id])

  if (!account) return null
  const s = STATUS_STYLE[account.status] || STATUS_STYLE.aktif

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-cardBorder last:border-0">
      <span className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
        <Icon size={13} /> {label}
      </span>
      <span className="text-xs font-extrabold text-deep text-right">{value}</span>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-modal-fade" onClick={onClose} />

      {/* panel */}
      <div className="relative w-full max-w-md h-full bg-cream shadow-2xl flex flex-col animate-drawer-in-right overflow-hidden">
        {/* başlık */}
        <div className="relative p-5 text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg,#1a2a3a,#1e1b2e)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
            <X size={16} />
          </button>
          <div className="relative z-10 flex items-center gap-4">
            <img src={account.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/15" />
            <div className="min-w-0">
              <h3 className="text-lg font-black truncate">{account.name}</h3>
              <p className="text-xs text-white/60 font-semibold truncate">{account.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2 py-1 rounded-lg ${s.bg} ${s.text}`}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} /> {s.label}
                </span>
                {account.role === 'admin' && (
                  <span className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-accent/20 text-accent">YÖNETİCİ</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* içerik */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* özet istatistik */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'İlan', value: account.listings },
              { label: 'Plan', value: account.plan },
              { label: 'Üyelik', value: account.joined.split(' ').slice(-2).join(' ') },
            ].map((b, i) => (
              <div key={i} className="bg-white rounded-2xl border border-cardBorder p-3 text-center">
                <div className="text-base font-black text-deep leading-none">{b.value}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mt-1.5">{b.label}</div>
              </div>
            ))}
          </div>

          {/* hesap bilgileri */}
          <div className="bg-white rounded-2xl border border-cardBorder p-4">
            <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Hesap Bilgileri</h4>
            <InfoRow icon={Mail} label="E-posta" value={account.email} />
            <InfoRow icon={Phone} label="Telefon" value={account.phone || '—'} />
            <InfoRow icon={MapPin} label="Şehir" value={account.city} />
            <InfoRow icon={Calendar} label="Katılım" value={account.joined} />
            <InfoRow icon={Clock} label="Son görülme" value={account.last} />
          </div>

          {/* güvenlik / oturum */}
          <div className="bg-white rounded-2xl border border-cardBorder p-4">
            <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Oturum & Güvenlik</h4>
            <InfoRow icon={Wifi} label="Son IP" value={account.lastIp || '—'} />
            <InfoRow icon={Smartphone} label="Cihaz" value={account.device || '—'} />
            <InfoRow icon={ShieldCheck} label="Rol" value={account.role === 'admin' ? 'Yönetici' : 'Kullanıcı'} />
          </div>

          {account.status === 'banli' && account.banReason && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-2">
              <Ban size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-extrabold text-red-600 uppercase tracking-wide">Yasaklama Nedeni</p>
                <p className="text-xs font-semibold text-red-700 mt-0.5">{account.banReason}</p>
              </div>
            </div>
          )}
        </div>

        {/* aksiyonlar */}
        <div className="flex-shrink-0 border-t border-cardBorder bg-white p-4">
          {isSelf && (
            <p className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3 flex items-center gap-1.5">
              <AlertTriangle size={13} /> Bu sizin hesabınız — banlarsanız oturumunuz yasak ekranına düşer.
            </p>
          )}

          {confirmBan ? (
            <div className="space-y-2 animate-slide-down">
              <input
                value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="Yasaklama nedeni (opsiyonel)"
                className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold bg-cream border border-cardBorder text-deep placeholder:text-gray-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
              />
              <div className="flex gap-2">
                <button onClick={() => setConfirmBan(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-gray-500 bg-cream border border-cardBorder hover:bg-gray-100 transition-colors">
                  Vazgeç
                </button>
                <button onClick={() => onStatus('banli', { banReason: reason || 'Kullanım koşullarının ihlali' })}
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-white bg-red-500 hover:bg-red-600 transition-colors btn flex items-center justify-center gap-1.5">
                  <Ban size={13} /> Yasakla — Onayla
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {account.status === 'banli' ? (
                <button onClick={() => onStatus('aktif', { banReason: undefined })}
                  className="col-span-2 py-3 rounded-xl text-xs font-extrabold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors btn flex items-center justify-center gap-1.5">
                  <Unlock size={14} /> Yasağı Kaldır (Hesabı Aç)
                </button>
              ) : (
                <>
                  {account.status === 'kisitli' ? (
                    <button onClick={() => onStatus('aktif')}
                      className="py-3 rounded-xl text-xs font-extrabold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors btn flex items-center justify-center gap-1.5">
                      <Unlock size={14} /> Kısıtlamayı Kaldır
                    </button>
                  ) : (
                    <button onClick={() => onStatus('kisitli')}
                      className="py-3 rounded-xl text-xs font-extrabold text-amber-600 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors btn flex items-center justify-center gap-1.5">
                      <Lock size={14} /> Kısıtla
                    </button>
                  )}
                  <button onClick={() => setConfirmBan(true)}
                    className="py-3 rounded-xl text-xs font-extrabold text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors btn flex items-center justify-center gap-1.5">
                    <Ban size={14} /> Banla
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  ANA SAYFA                                                          */
/* ================================================================== */
const NAV = [
  { key: 'genel', label: 'Genel Bakış', icon: LayoutDashboard },
  { key: 'kullanicilar', label: 'Kullanıcılar', icon: Users },
  { key: 'sistem', label: 'Sistem & Aktivite', icon: Activity },
]

export default function AdminPanel() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { accounts, setStatus } = useAccounts()
  const { data: overview } = useAdminOverview()
  const kpis = overview?.kpis || []
  const growth = overview?.growth || []
  const weekly = overview?.weekly || []
  const plans = overview?.plans || []
  const activity = overview?.activity || []
  const health = overview?.health
  const [view, setView] = useState('genel')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('hepsi')
  const [selectedId, setSelectedId] = useState(null)
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' })

  const filtered = useMemo(() => {
    const list = accounts.filter(u => {
      const matchQ = (u.name + u.email + u.city).toLowerCase().includes(query.toLowerCase())
      const matchF = filter === 'hepsi' || u.status === filter
      return matchQ && matchF
    })
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key]
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv), 'tr') * dir
    })
  }, [accounts, query, filter, sort])

  const toggleSort = (key) =>
    setSort(s => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  const selected = accounts.find(a => a.id === selectedId) || null
  const onlineCount = accounts.filter(u => u.last === 'Çevrimiçi' || u.last.includes('dk')).length

  // Detaydaki hesabın durumunu değiştir (banla/aç/kısıtla) ve banlamada drawer'ı kapat
  const handleStatus = (status, extra) => {
    if (!selected) return
    setStatus(selected.id, status, extra)
    if (status === 'banli') setSelectedId(null)
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* keyframe tanımları (bileşene özel) */}
      <style>{`
        @keyframes admDraw { to { stroke-dashoffset: 0; } }
        @keyframes admPop { from { opacity:0; transform:scale(.2);} to { opacity:1; transform:scale(1);} }
        @keyframes admGrow { to { transform: scaleY(1); } }
        @keyframes admBar { to { transform: scaleX(1); } }
        @keyframes admDonut { from { opacity:0; } to { opacity:1; } }
        @keyframes admPing { 0%{transform:scale(1);opacity:.6} 70%,100%{transform:scale(2.4);opacity:0} }
      `}</style>

      {/* ============ KENDİ NAVBAR'I ============ */}
      <header className="sticky top-0 z-40 border-b border-white/10 shadow-lg"
        style={{ background: 'linear-gradient(90deg,#1a2a3a 0%,#1e1b2e 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent/20 border border-accent/20">
                <ShieldCheck size={18} className="text-accent" strokeWidth={2.5} />
              </div>
              <div className="leading-tight">
                <h1 className="text-sm font-extrabold text-white">FSBO Yönetim</h1>
                <p className="text-[9px] font-semibold text-white/40 uppercase tracking-wider -mt-0.5">Admin Konsolu</p>
              </div>
            </div>

            {/* Masaüstü nav linkleri */}
            <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1">
              {NAV.map(item => {
                const Icon = item.icon
                const active = view === item.key
                return (
                  <button key={item.key} onClick={() => setView(item.key)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${active ? 'text-deep shadow-sm' : 'text-white/55 hover:text-white hover:bg-white/5'}`}
                    style={active ? { background: '#e3d10d' } : {}}>
                    <Icon size={14} strokeWidth={2.5} />
                    {item.label}
                  </button>
                )
              })}
            </nav>

            {/* Sağ taraf */}
            <div className="flex items-center gap-2">
              <button className="hidden sm:flex relative w-9 h-9 rounded-xl items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors btn">
                <Bell size={16} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-extrabold text-deep bg-accent btn shadow-md shadow-accent/10">
                <LogOut size={13} strokeWidth={2.5} />
                Uygulamaya Dön
              </button>
              <img src={user?.avatar || 'https://i.pravatar.cc/100?img=16'} alt="" className="w-9 h-9 rounded-xl object-cover border border-white/10" />
              {/* Mobil menü düğmesi */}
              <button onClick={() => setMobileOpen(v => !v)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white">
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobil açılır menü */}
          {mobileOpen && (
            <div className="md:hidden pb-3 space-y-1 animate-slide-down">
              {NAV.map(item => {
                const Icon = item.icon
                const active = view === item.key
                return (
                  <button key={item.key} onClick={() => { setView(item.key); setMobileOpen(false) }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all ${active ? 'text-deep' : 'text-white/60 hover:bg-white/5'}`}
                    style={active ? { background: '#e3d10d' } : {}}>
                    <Icon size={15} strokeWidth={2.5} /> {item.label}
                  </button>
                )
              })}
              <button onClick={() => navigate('/')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold text-white/60 hover:bg-white/5">
                <LogOut size={15} strokeWidth={2.5} /> Uygulamaya Dön
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ============ İÇERİK ============ */}
      <main key={view} className="flex-1 w-full max-w-7xl mx-auto pb-12 animate-fade">

      {/* 1. Başlık */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/20 p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          style={{ background: 'linear-gradient(135deg, #1a2a3a 0%, #1e1b2e 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-accent/20 border border-accent/20 flex-shrink-0">
              <ShieldCheck size={26} className="text-accent" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Yönetim & Denetim Paneli
              </h1>
              <p className="text-xs sm:text-sm text-white/70 mt-1 font-medium max-w-lg leading-relaxed">
                Tüm kullanıcıları, abonelikleri ve platform aktivitesini tek ekrandan izleyin.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400" style={{ animation: 'admPing 1.8s cubic-bezier(0,0,.2,1) infinite' }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Canlı</div>
              <div className="text-xs font-extrabold text-white">{onlineCount} kullanıcı çevrimiçi</div>
            </div>
          </div>
        </div>
      </div>

      {view === 'genel' && (<>
      {/* 2. KPI kartları */}
      <div className="px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const Icon = KPI_ICONS[k.icon] || Users
          return (
            <div key={k.key}
              className="flex flex-col p-4 bg-white rounded-2xl border border-cardBorder hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-xl translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform" style={{ background: k.bg }} />
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: k.bg }}>
                  <Icon size={18} style={{ color: k.color }} strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-2xl font-black text-deep leading-none mt-4">
                <CountUp value={k.value} />
              </span>
              <span className="text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-wide">{k.label}</span>
            </div>
          )
        })}
      </div>

      {/* 3. Grafikler */}
      <div className="px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Büyüme grafiği */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-cardBorder shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-accent/15 flex items-center justify-center" style={{ color: '#cabb0b' }}>
                <TrendingUp size={13} strokeWidth={2.5} />
              </div>
              <h2 className="text-sm font-extrabold text-deep">Kullanıcı Büyümesi</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream border border-cardBorder text-deep">Son 12 ay</span>
          </div>
          {growth.length > 0 ? <GrowthChart data={growth} /> : <div className="h-[240px] flex items-center justify-center text-xs font-bold text-gray-400">Veri yükleniyor…</div>}
        </div>

        {/* Plan dağılımı */}
        <div className="bg-white rounded-3xl border border-cardBorder shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Crown size={13} strokeWidth={2.5} />
            </div>
            <h2 className="text-sm font-extrabold text-deep">Abonelik Dağılımı</h2>
          </div>
          {plans.length > 0 ? <PlanDonut data={plans} /> : <div className="h-40 flex items-center justify-center text-xs font-bold text-gray-400">Veri yükleniyor…</div>}
        </div>
      </div>
      </>)}

      {/* 4. Haftalık aktif + sistem sağlığı + aktivite */}
      {view === 'sistem' && (
      <div className="px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Haftalık aktif bar */}
        <div className="bg-white rounded-3xl border border-cardBorder shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Activity size={13} strokeWidth={2.5} />
            </div>
            <h2 className="text-sm font-extrabold text-deep">Haftalık Aktif Kullanıcı</h2>
          </div>
          <WeeklyBars data={weekly.length > 0 ? weekly : [{ d: '—', v: 0 }]} />
        </div>

        {/* Sistem sağlığı */}
        <div className="bg-white rounded-3xl border border-cardBorder shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Server size={13} strokeWidth={2.5} />
            </div>
            <h2 className="text-sm font-extrabold text-deep">Sistem Sağlığı</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Veritabanı', value: health?.db === 'up' ? 'Bağlı' : 'Kapalı', icon: Database, ok: health?.db === 'up' },
              { label: 'Çalışma süresi', value: health ? formatUptime(health.uptimeSec) : '—', icon: Server, ok: true },
              { label: 'Toplam kullanıcı', value: health?.users ?? '—', icon: Users, ok: true },
              { label: 'Toplam ilan', value: health?.properties ?? '—', icon: Home, ok: true },
              { label: 'Toplam randevu', value: health?.appointments ?? '—', icon: CalendarClock, ok: true },
            ].map((m, i) => {
              const Icon = m.icon
              return (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="flex items-center gap-2 text-[11px] font-bold text-deep">
                    <Icon size={13} style={{ color: m.ok ? '#10b981' : '#ef4444' }} /> {m.label}
                  </span>
                  <span className="text-xs font-extrabold" style={{ color: m.ok ? '#1e1b2e' : '#ef4444' }}>{m.value}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-5 flex items-center gap-2 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100/60">
            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
            <span className="text-[11px] font-bold text-emerald-700">Canlı backend bağlantısı aktif</span>
          </div>
        </div>

        {/* Aktivite akışı */}
        <div className="bg-white rounded-3xl border border-cardBorder shadow-sm p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Clock size={13} strokeWidth={2.5} />
            </div>
            <h2 className="text-sm font-extrabold text-deep">Son Aktiviteler</h2>
          </div>
          <div className="space-y-1 flex-1">
            {activity.map((a, i) => (
              <div key={a.id}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-cream/60 transition-colors animate-fade-up"
                style={{ animationDelay: `${i * 0.09}s`, opacity: 0 }}>
                <span className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color, boxShadow: `0 0 8px ${a.color}66` }} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-deep leading-snug">{a.text}</p>
                  <p className="text-[10px] font-semibold text-gray-400 mt-0.5">@{a.who}</p>
                </div>
                <span className="text-[10px] font-bold text-gray-300 flex-shrink-0">{a.time}</span>
              </div>
            ))}
            {activity.length === 0 && (
              <p className="text-xs font-bold text-gray-400 py-8 text-center">Henüz aktivite yok.</p>
            )}
          </div>
        </div>
      </div>
      )}

      {/* 5. Kullanıcı denetim tablosu */}
      {view === 'kullanicilar' && (
      <div className="px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-3xl border border-cardBorder shadow-sm overflow-hidden">
          {/* tablo başlık + filtreler */}
          <div className="px-5 py-4 border-b border-cardBorder flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-accent/15 flex items-center justify-center" style={{ color: '#cabb0b' }}>
                <Users size={13} strokeWidth={2.5} />
              </div>
              <h2 className="text-sm font-extrabold text-deep">Kullanıcı Denetimi</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream border border-cardBorder text-deep">
                {filtered.length} kayıt
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* arama */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Kullanıcı ara..."
                  className="pl-8 pr-3 py-2 rounded-xl text-xs font-semibold bg-cream border border-cardBorder text-deep placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all w-44"
                />
              </div>
              {/* durum filtresi */}
              <div className="flex bg-cream rounded-xl border border-cardBorder p-0.5">
                {['hepsi', 'aktif', 'kisitli', 'banli'].map(f => (
                  <button key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold capitalize transition-all ${filter === f ? 'bg-white text-deep shadow-sm' : 'text-gray-400 hover:text-deep'}`}>
                    {f === 'banli' ? 'Yasaklı' : f === 'kisitli' ? 'Kısıtlı' : f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* tablo gövdesi */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="text-left border-b border-cardBorder bg-cream/40">
                  {[
                    { label: 'Kullanıcı', key: 'name' },
                    { label: 'Plan', key: 'plan' },
                    { label: 'Durum', key: 'status' },
                    { label: 'Şehir', key: 'city' },
                    { label: 'İlan', key: 'listings' },
                    { label: 'Son Görülme', key: 'last' },
                    { label: '', key: null },
                  ].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                      {h.key ? (
                        <button onClick={() => toggleSort(h.key)} className="flex items-center gap-1 hover:text-deep transition-colors uppercase">
                          {h.label}
                          <ArrowUpDown size={10} className={sort.key === h.key ? 'text-accent' : 'text-gray-300'} />
                        </button>
                      ) : h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const s = STATUS_STYLE[u.status] || STATUS_STYLE.aktif
                  const online = u.last === 'Çevrimiçi'
                  const isSelf = u.username === user?.username
                  return (
                    <tr key={u.id}
                      onClick={() => setSelectedId(u.id)}
                      className="border-b border-cardBorder last:border-0 hover:bg-cream/50 transition-colors animate-fade-up cursor-pointer"
                      style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <img src={u.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
                            {online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-deep truncate flex items-center gap-1.5">
                              {u.name}
                              {isSelf && <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-accent/20 text-[#a89a08]">SİZ</span>}
                            </p>
                            <p className="text-[10px] font-semibold text-gray-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg ${u.plan === 'Kurumsal' ? 'bg-purple-500/10 text-purple-600' : u.plan === 'Pro' ? 'bg-accent/15 text-[#a89a08]' : 'bg-gray-400/10 text-gray-500'}`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2 py-1 rounded-lg border ${s.bg} ${s.text} ${s.border}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1 text-xs font-bold text-deep">
                          <MapPin size={11} className="text-gray-300" /> {u.city}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs font-extrabold text-deep">{u.listings}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[11px] font-bold ${online ? 'text-emerald-600' : 'text-gray-400'}`}>{u.last}</span>
                      </td>
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setSelectedId(u.id)} title="Detayları görüntüle" className="w-7 h-7 rounded-lg bg-cream border border-cardBorder flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-all btn">
                            <Eye size={13} />
                          </button>
                          {u.status === 'banli' ? (
                            <button onClick={() => setStatus(u.id, 'aktif', { banReason: undefined })} title="Yasağı kaldır" className="w-7 h-7 rounded-lg bg-cream border border-cardBorder flex items-center justify-center text-gray-400 hover:text-emerald-500 hover:border-emerald-200 transition-all btn">
                              <Unlock size={13} />
                            </button>
                          ) : (
                            <button onClick={() => setStatus(u.id, 'banli', { banReason: 'Kullanım koşullarının ihlali' })} title="Banla" className="w-7 h-7 rounded-lg bg-cream border border-cardBorder flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all btn">
                              <Ban size={13} />
                            </button>
                          )}
                          <button onClick={() => setSelectedId(u.id)} title="Diğer" className="w-7 h-7 rounded-lg bg-cream border border-cardBorder flex items-center justify-center text-gray-400 hover:text-deep transition-all btn">
                            <MoreVertical size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <p className="text-xs font-bold text-gray-400">Eşleşen kullanıcı bulunamadı.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      </main>

      {/* Kullanıcı detay paneli */}
      {selected && (
        <UserDetailDrawer
          account={selected}
          isSelf={selected.username === user?.username}
          onClose={() => setSelectedId(null)}
          onStatus={handleStatus}
        />
      )}
    </div>
  )
}
