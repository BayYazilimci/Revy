import { TrendingUp, TrendingDown, Minus, Info, CircleDollarSign, Home, BarChart3, Clock } from 'lucide-react'
import { useEvdsData } from '../hooks/useEvdsData'

function Sparkline({ series }) {
  if (!series?.length) return null
  const vals = series.map(s => s.kfe)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const w = 200
  const h = 48
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 8) - 4
    return `${x},${y}`
  })
  const path = 'M' + pts.join(' L')
  const fill = 'M' + pts.join(' L') + ` L${w},${h} L0,${h} Z`
  const rising = vals[vals.length - 1] > vals[0]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 48 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={rising ? '#059669' : '#dc2626'} stopOpacity="0.18" />
          <stop offset="100%" stopColor={rising ? '#059669' : '#dc2626'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#sparkGrad)" />
      <path d={path} fill="none" stroke={rising ? '#059669' : '#dc2626'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ScoreBar({ score }) {
  const color = score >= 70 ? '#059669' : score >= 45 ? '#d97706' : '#dc2626'
  const label = score >= 70 ? 'Değer Altında' : score >= 45 ? 'Piyasa Değerinde' : 'Değer Üstünde'
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-gray-400 font-medium">Fiyat Skoru</span>
        <span className="text-xs font-bold" style={{ color }}>{label}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-gray-300 font-medium">
        <span>Pahalı</span>
        <span>Piyasa</span>
        <span>Uygun</span>
      </div>
    </div>
  )
}

function StatBox({ icon: Icon, iconColor, label, value, sub, highlight }) {
  return (
    <div className={`rounded-xl p-3.5 border ${highlight ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconColor + '18' }}>
          <Icon size={14} style={{ color: iconColor }} />
        </div>
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
      <p className="text-base font-extrabold text-navy">{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function PriceAnalysis({ prop }) {
  const { data, loading, source } = useEvdsData(prop)

  if (!prop) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-extrabold text-navy flex items-center gap-2">
          <BarChart3 size={16} className="text-gold" />
          Fiyat Analizi & Karlılık
        </h3>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${source === 'live' ? 'bg-green-500' : 'bg-amber-400'}`} />
          <span className="text-[10px] text-gray-400 font-medium">
            {source === 'live' ? 'TCMB Canlı' : 'TCMB Simüle'}
          </span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-6 justify-center">
          <span className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-gold animate-spin inline-block" />
          TCMB EVDS verisi yükleniyor...
        </div>
      )}

      {!loading && data && (
        <div className="space-y-5">

          {/* KFE Sparkline */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-gray-400 font-medium">TCMB Konut Fiyat Endeksi</p>
                <p className="text-lg font-extrabold text-navy mt-0.5">
                  {data.latest?.kfe?.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                  <span className="text-xs text-gray-400 font-normal ml-1">puan (2010=100)</span>
                </p>
              </div>
              <div className="text-right">
                {data.yoyChange !== null && (
                  <div className={`flex items-center gap-1 justify-end text-sm font-bold ${data.yoyChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {data.yoyChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    %{Math.abs(data.yoyChange).toFixed(1)}
                  </div>
                )}
                <p className="text-[10px] text-gray-400">Yıllık değişim</p>
                {data.momChange !== null && (
                  <p className={`text-[10px] font-semibold mt-0.5 ${data.momChange >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                    Aylık: {data.momChange >= 0 ? '+' : ''}{data.momChange.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
            <Sparkline series={data.series} />
            <p className="text-[10px] text-gray-300 mt-1">Son 13 aylık endeks seyri</p>
          </div>

          {/* Fiyat Skoru */}
          {data.sizeM2 > 0 && <ScoreBar score={data.priceScore} />}

          {/* m² Karşılaştırma */}
          {data.sizeM2 > 0 && (
            <div className="rounded-xl border border-gray-100 p-3.5">
              <p className="text-xs text-gray-400 font-medium mb-2">m² Fiyat Karşılaştırması</p>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] text-gray-400">Bu İlan</p>
                  <p className="text-base font-extrabold text-navy">
                    ₺{Math.round(data.listingPrice / data.sizeM2).toLocaleString('tr-TR')} / m²
                  </p>
                </div>
                <div className="flex-1 flex items-center gap-1 justify-center">
                  {data.priceDeviation > 2 ? (
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                      +{data.priceDeviation.toFixed(1)}% pahalı
                    </span>
                  ) : data.priceDeviation < -2 ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      {data.priceDeviation.toFixed(1)}% uygun
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      Piyasa değerinde
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">Bölge Ortalaması</p>
                  <p className="text-base font-extrabold text-gray-500">
                    ₺{data.avgM2.toLocaleString('tr-TR')} / m²
                  </p>
                </div>
              </div>
              <div className="mt-2.5 h-1.5 rounded-full bg-gray-100 overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 right-0 flex">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '50%' }} />
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '20%' }} />
                  <div className="h-full bg-red-400 rounded-full" style={{ width: '30%' }} />
                </div>
                {/* Pointer */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-navy border-2 border-white shadow"
                  style={{ left: `${Math.min(95, Math.max(5, 50 + data.priceDeviation * 1.5))}%`, transform: 'translate(-50%, -50%)' }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-gray-300 mt-1">
                <span>Uygun</span><span>Piyasa</span><span>Pahalı</span>
              </div>
            </div>
          )}

          {/* Karlılık İstatistikleri */}
          {data.sizeM2 > 0 && data.listingPrice > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-2.5">Yatırım Analizi</p>
              <div className="grid grid-cols-2 gap-2.5">
                <StatBox
                  icon={Home}
                  iconColor="#3b82f6"
                  label="Tahmini Kira Getirisi"
                  value={`₺${data.monthlyRent.toLocaleString('tr-TR')}/ay`}
                  sub={`Yıllık ~%${(data.listingPrice > 0 ? (data.annualRent / data.listingPrice) * 100 : 0).toFixed(1)} brüt`}
                />
                <StatBox
                  icon={TrendingUp}
                  iconColor="#059669"
                  label="Değer Artışı (Yıllık)"
                  value={`₺${Math.round(data.annualAppreciation / 1000)}K`}
                  sub={`KFE trendine göre +%${data.yoyChange ? data.yoyChange.toFixed(1) : '—'}`}
                  highlight
                />
                <StatBox
                  icon={CircleDollarSign}
                  iconColor="#d97706"
                  label="Toplam Yıllık Getiri"
                  value={`%${data.totalReturnRate.toFixed(1)}`}
                  sub="Kira + değer artışı"
                />
                <StatBox
                  icon={Clock}
                  iconColor="#8b5cf6"
                  label="Geri Dönüş Süresi"
                  value={`${data.breakEvenYears || '—'} yıl`}
                  sub="Kira geliriyle amortisman"
                />
              </div>
            </div>
          )}

          {/* Tavsiye Kutusu */}
          {data.sizeM2 > 0 && (
            <div className={`rounded-xl p-3.5 border-l-4 ${
              data.priceScore >= 70
                ? 'bg-emerald-50 border-emerald-400'
                : data.priceScore >= 45
                ? 'bg-amber-50 border-amber-400'
                : 'bg-red-50 border-red-400'
            }`}>
              <div className="flex items-start gap-2">
                <Info size={14} className={`mt-0.5 shrink-0 ${
                  data.priceScore >= 70 ? 'text-emerald-600' : data.priceScore >= 45 ? 'text-amber-600' : 'text-red-500'
                }`} />
                <div>
                  <p className={`text-xs font-extrabold mb-0.5 ${
                    data.priceScore >= 70 ? 'text-emerald-700' : data.priceScore >= 45 ? 'text-amber-700' : 'text-red-600'
                  }`}>
                    {data.priceScore >= 70 ? 'Fırsat İlan' : data.priceScore >= 45 ? 'Makul Fiyat' : 'Dikkatli Değerlendirin'}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {data.priceScore >= 70
                      ? `Bu ilan bölge ortalamasına göre %${Math.abs(data.priceDeviation).toFixed(0)} daha uygun fiyatlı. TCMB KFE yıllık %${data.yoyChange?.toFixed(1)} artış gösteriyor; potansiyel yatırım fırsatı.`
                      : data.priceScore >= 45
                      ? `Fiyat bölge ortalamasıyla uyumlu. Yıllık %${data.totalReturnRate.toFixed(1)} toplam getiri potansiyeliyle orta vadeli yatırım için değerlendirilebilir.`
                      : `Fiyat bölge ortalamasının %${data.priceDeviation.toFixed(0)} üzerinde. Pazarlık payı olup olmadığını araştırmanızı öneririz.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-[10px] text-gray-300 text-center">
            Veriler TCMB EVDS Konut Fiyat Endeksi kullanılarak hesaplanmıştır. Yatırım tavsiyesi değildir.
          </p>
        </div>
      )}
    </div>
  )
}
