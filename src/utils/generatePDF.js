import { DEJAVU_REGULAR, DEJAVU_BOLD } from './dejavuFont'

// ─── PALET ────────────────────────────────────────────────────────────────────
const C = {
  navy:      [22,  34,  51],
  navyDeep:  [14,  23,  37],
  navySoft:  [37,  52,  74],
  gold:      [226, 196, 41],
  goldSoft:  [120, 104, 18],
  ink:       [30,  41,  59],
  white:     [255, 255, 255],
  gray50:    [248, 250, 252],
  gray100:   [241, 245, 249],
  gray200:   [226, 232, 240],
  gray300:   [203, 213, 225],
  gray400:   [148, 163, 184],
  gray500:   [100, 116, 139],
  gray600:   [71,  85,  105],
  green:     [16,  150, 105],
  greenSoft: [236, 253, 245],
  orange:    [217, 119, 6],
  red:       [220, 38,  38],
}

const PAGE_W = 210
const PAGE_H = 297
const M = 16            // kenar boşluğu
const CW = PAGE_W - M * 2 // içerik genişliği

const FONT = 'DejaVu'

// ─── TEMEL ÇİZİM YARDIMCILARI ─────────────────────────────────────────────────
const setFill   = (pdf, [r, g, b]) => pdf.setFillColor(r, g, b)
const setStroke = (pdf, [r, g, b]) => pdf.setDrawColor(r, g, b)
const setInk    = (pdf, [r, g, b]) => pdf.setTextColor(r, g, b)

function rect(pdf, x, y, w, h, color) {
  setFill(pdf, color)
  pdf.rect(x, y, w, h, 'F')
}

function roundedRect(pdf, x, y, w, h, r, color, mode = 'F') {
  if (mode === 'F' || mode === 'FD') setFill(pdf, color)
  if (mode === 'S' || mode === 'FD') setStroke(pdf, color)
  pdf.roundedRect(x, y, w, h, r, r, mode)
}

function line(pdf, x1, y1, x2, y2, color, lw = 0.3) {
  setStroke(pdf, color)
  pdf.setLineWidth(lw)
  pdf.line(x1, y1, x2, y2)
}

function text(pdf, str, x, y, color, size, opts = {}) {
  setInk(pdf, color)
  pdf.setFont(FONT, opts.bold ? 'bold' : 'normal')
  pdf.setFontSize(size)
  pdf.text(String(str ?? ''), x, y, opts)
}

// Metni genişliğe sığdır, taşarsa … ile kırp
function fit(pdf, str, maxW, size, bold = false) {
  pdf.setFont(FONT, bold ? 'bold' : 'normal')
  pdf.setFontSize(size)
  let s = String(str ?? '')
  if (pdf.getTextWidth(s) <= maxW) return s
  while (s.length > 1 && pdf.getTextWidth(s + '…') > maxW) s = s.slice(0, -1)
  return s.trimEnd() + '…'
}

function splitText(pdf, str, maxW, size, bold = false) {
  pdf.setFont(FONT, bold ? 'bold' : 'normal')
  pdf.setFontSize(size)
  return pdf.splitTextToSize(String(str || ''), maxW)
}

function withAlpha(pdf, a, fn) {
  pdf.setGState(pdf.GState({ opacity: a }))
  fn()
  pdf.setGState(pdf.GState({ opacity: 1 }))
}

// Alttan koyuya inen yumuşak gölge (foto okunabilirliği için)
function bottomScrim(pdf, x, y, w, h, color = [0, 0, 0]) {
  const steps = 14
  for (let i = 0; i < steps; i++) {
    const a = (i / (steps - 1)) * 0.72
    withAlpha(pdf, a, () => rect(pdf, x, y + (h * i) / steps, w, h / steps + 0.4, color))
  }
}

function badge(pdf, label, x, y, bg, fg, size = 8, bold = true) {
  pdf.setFont(FONT, bold ? 'bold' : 'normal')
  pdf.setFontSize(size)
  const tw = pdf.getTextWidth(label)
  const padX = 3.2
  const h = size * 0.46 + 2.8
  const w = tw + padX * 2
  roundedRect(pdf, x, y - h + 1.4, w, h, h / 2, bg)
  text(pdf, label, x + padX, y, fg, size, { bold })
  return w
}

// ─── MİNİMAL VEKTÖR İKONLAR ───────────────────────────────────────────────────
// Hepsi (x,y) sol-üst köşeden s boyutunda çizilir.
function icon(pdf, kind, x, y, s, color, lw = 0.45) {
  setStroke(pdf, color)
  setFill(pdf, color)
  pdf.setLineWidth(lw)
  pdf.setLineJoin('round'); pdf.setLineCap('round')
  const X = (p) => x + s * p, Y = (p) => y + s * p

  switch (kind) {
    case 'pin': {
      const cx = X(0.5), cy = Y(0.42), r = s * 0.26
      pdf.circle(cx, cy, r, 'S')
      pdf.circle(cx, cy, r * 0.38, 'F')
      pdf.triangle(X(0.27), Y(0.55), X(0.73), Y(0.55), X(0.5), Y(0.95), 'F')
      break
    }
    case 'bed':
      pdf.line(X(0.08), Y(0.42), X(0.08), Y(0.82))
      pdf.line(X(0.92), Y(0.6), X(0.92), Y(0.82))
      pdf.line(X(0.08), Y(0.6), X(0.92), Y(0.6))
      pdf.line(X(0.08), Y(0.78), X(0.92), Y(0.78))
      // yastık + sırt
      pdf.roundedRect(X(0.12), Y(0.44), s * 0.3, s * 0.14, 0.6, 0.6, 'S')
      break
    case 'area':
      pdf.rect(X(0.14), Y(0.14), s * 0.72, s * 0.72, 'S')
      pdf.line(X(0.34), Y(0.66), X(0.66), Y(0.34))
      pdf.line(X(0.66), Y(0.34), X(0.54), Y(0.34))
      pdf.line(X(0.66), Y(0.34), X(0.66), Y(0.46))
      pdf.line(X(0.34), Y(0.66), X(0.46), Y(0.66))
      pdf.line(X(0.34), Y(0.66), X(0.34), Y(0.54))
      break
    case 'floor':
      pdf.rect(X(0.22), Y(0.1), s * 0.56, s * 0.8, 'S')
      pdf.line(X(0.22), Y(0.37), X(0.78), Y(0.37))
      pdf.line(X(0.22), Y(0.63), X(0.78), Y(0.63))
      pdf.line(X(0.5), Y(0.1), X(0.5), Y(0.9))
      break
    case 'calendar':
      pdf.roundedRect(X(0.14), Y(0.2), s * 0.72, s * 0.66, 0.8, 0.8, 'S')
      pdf.line(X(0.14), Y(0.4), X(0.86), Y(0.4))
      pdf.line(X(0.34), Y(0.1), X(0.34), Y(0.28))
      pdf.line(X(0.66), Y(0.1), X(0.66), Y(0.28))
      break
    case 'phone':
      pdf.roundedRect(X(0.3), Y(0.1), s * 0.4, s * 0.8, 1, 1, 'S')
      pdf.circle(X(0.5), Y(0.78), s * 0.04, 'F')
      break
    case 'mail':
      pdf.rect(X(0.12), Y(0.24), s * 0.76, s * 0.52, 'S')
      pdf.line(X(0.12), Y(0.26), X(0.5), Y(0.54))
      pdf.line(X(0.88), Y(0.26), X(0.5), Y(0.54))
      break
    case 'walk':
      pdf.circle(X(0.5), Y(0.16), s * 0.1, 'F')
      pdf.line(X(0.5), Y(0.28), X(0.5), Y(0.6))
      pdf.line(X(0.5), Y(0.38), X(0.28), Y(0.5))
      pdf.line(X(0.5), Y(0.38), X(0.74), Y(0.46))
      pdf.line(X(0.5), Y(0.6), X(0.32), Y(0.86))
      pdf.line(X(0.5), Y(0.6), X(0.66), Y(0.86))
      break
    case 'car':
      pdf.roundedRect(X(0.1), Y(0.42), s * 0.8, s * 0.26, 1, 1, 'S')
      pdf.line(X(0.24), Y(0.42), X(0.34), Y(0.26))
      pdf.line(X(0.34), Y(0.26), X(0.66), Y(0.26))
      pdf.line(X(0.66), Y(0.26), X(0.76), Y(0.42))
      pdf.circle(X(0.3), Y(0.7), s * 0.08, 'F')
      pdf.circle(X(0.7), Y(0.7), s * 0.08, 'F')
      break
    case 'check':
      pdf.line(X(0.2), Y(0.52), X(0.42), Y(0.74))
      pdf.line(X(0.42), Y(0.74), X(0.8), Y(0.28))
      break
    case 'trend':
      pdf.line(X(0.1), Y(0.7), X(0.4), Y(0.45))
      pdf.line(X(0.4), Y(0.45), X(0.6), Y(0.58))
      pdf.line(X(0.6), Y(0.58), X(0.9), Y(0.22))
      pdf.line(X(0.9), Y(0.22), X(0.66), Y(0.22))
      pdf.line(X(0.9), Y(0.22), X(0.9), Y(0.46))
      break
    default:
      break
  }
}

// ─── GÖRSEL YÜKLEME ───────────────────────────────────────────────────────────
const PROXIES = [
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
]

async function loadViaProxy(url) {
  for (const proxy of PROXIES) {
    try {
      const resp = await fetch(proxy(url))
      if (!resp.ok) continue
      const blob = await resp.blob()
      const dataUrl = await new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(blob) })
      const img = new Image()
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl })
      return { data: dataUrl, w: img.naturalWidth, h: img.naturalHeight }
    } catch {}
  }
  return null
}

async function loadImageBase64(url) {
  if (!url) return null
  // Try direct CORS loading first
  const img = new Image()
  img.crossOrigin = 'anonymous'
  const loaded = await new Promise(resolve => {
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
  if (loaded) {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    canvas.getContext('2d').drawImage(img, 0, 0)
    try { return { data: canvas.toDataURL('image/jpeg', 0.92), w: img.naturalWidth, h: img.naturalHeight } }
    catch {} // CORS blocked, fall through to proxy
  }
  // Fallback: load via CORS proxy
  return loadViaProxy(url)
}

// Görseli alana kırparak (cover) yerleştir
function drawCoverImage(pdf, img, x, y, w, h) {
  if (!img) {
    rect(pdf, x, y, w, h, C.gray100)
    return
  }
  const boxRatio = w / h
  const imgRatio = img.w / img.h
  let dw = w, dh = h, dx = x, dy = y
  if (imgRatio > boxRatio) { dw = h * imgRatio; dx = x - (dw - w) / 2 }
  else { dh = w / imgRatio; dy = y - (dh - h) / 2 }
  // kırpma için clip
  pdf.saveGraphicsState()
  pdf.rect(x, y, w, h)
  pdf.clip(); pdf.discardPath()
  pdf.addImage(img.data, 'JPEG', dx, dy, dw, dh)
  pdf.restoreGraphicsState()
}

// ─── SAYFA BAŞLIĞI & FOOTER ───────────────────────────────────────────────────
function drawHeader(pdf, title, subtitle, iconKind) {
  const h = 26
  rect(pdf, 0, 0, PAGE_W, h, C.navy)
  rect(pdf, 0, h, PAGE_W, 1.4, C.gold)
  let tx = M
  if (iconKind) {
    icon(pdf, iconKind, M, 8.5, 9, C.gold, 0.5)
    tx = M + 12.5
  }
  text(pdf, title, tx, 16.5, C.white, 14, { bold: true })
  if (subtitle) text(pdf, subtitle, PAGE_W - M, 16.5, C.gray400, 8, { align: 'right' })
}

function drawFooter(pdf, prop, pageNum, total) {
  const y = PAGE_H - 10
  line(pdf, M, y - 4, PAGE_W - M, y - 4, C.gray200, 0.4)
  text(pdf, 'FSBO', M, y, C.gold, 7.5, { bold: true })
  text(pdf, 'Emlak Platformu', M + 9, y, C.gray400, 7)
  text(pdf, fit(pdf, prop.title, 90, 7), PAGE_W / 2, y, C.gray400, 7, { align: 'center' })
  text(pdf, `${pageNum} / ${total}`, PAGE_W - M, y, C.gray500, 7, { align: 'right' })
}

function sectionTitle(pdf, label, y, accent = C.gold) {
  rect(pdf, M, y - 3.4, 1.6, 4.4, accent)
  text(pdf, label, M + 4, y, C.navy, 11, { bold: true })
  return y + 6
}

// ─── SAYFA 1: KAPAK ───────────────────────────────────────────────────────────
async function drawCover(pdf, prop, coverImg) {
  const photoH = 150

  // Hero foto
  drawCoverImage(pdf, coverImg, 0, 0, PAGE_W, photoH)

  // Üst marka şeridi gölgesi
  withAlpha(pdf, 0.45, () => rect(pdf, 0, 0, PAGE_W, 24, [0, 0, 0]))
  text(pdf, 'FSBO', M, 15, C.gold, 16, { bold: true })
  text(pdf, 'EMLAK PLATFORMU', M + 19, 15, C.white, 6.5, { bold: true })
  text(pdf, 'Profesyonel İlan Sunumu', PAGE_W - M, 15, C.gray200, 8, { align: 'right' })

  // Foto alt gölgesi + üzerine durum/fiyat
  bottomScrim(pdf, 0, photoH - 58, PAGE_W, 58)
  let py = photoH - 36
  const status = prop.status || prop.type || 'Satılık'
  let bw = badge(pdf, status, M, py, C.gold, C.navy, 8.5)
  if (prop.badge) {
    pdf.setFont(FONT, 'bold'); pdf.setFontSize(8.5)
    const w2 = pdf.getTextWidth(prop.badge) + 6.4
    roundedRect(pdf, M + bw + 3, py - (8.5 * 0.46 + 2.8) + 1.4, w2, 8.5 * 0.46 + 2.8, (8.5 * 0.46 + 2.8) / 2, C.white, 'S')
    setStroke(pdf, C.white); pdf.setLineWidth(0.5)
    pdf.roundedRect(M + bw + 3, py - (8.5 * 0.46 + 2.8) + 1.4, w2, 8.5 * 0.46 + 2.8, (8.5 * 0.46 + 2.8) / 2, (8.5 * 0.46 + 2.8) / 2, 'S')
    text(pdf, prop.badge, M + bw + 6.2, py, C.white, 8.5, { bold: true })
  }
  py += 16
  text(pdf, prop.price, M, py, C.white, 28, { bold: true })

  // Alt panel (navy)
  rect(pdf, 0, photoH, PAGE_W, PAGE_H - photoH, C.navy)
  rect(pdf, 0, photoH, PAGE_W, 1.4, C.gold)

  let y = photoH + 16
  // Başlık
  const titleLines = splitText(pdf, prop.title, CW, 15, true).slice(0, 2)
  titleLines.forEach(l => { text(pdf, l, M, y, C.white, 15, { bold: true }); y += 7.5 })
  y += 1

  // Konum
  icon(pdf, 'pin', M, y - 4, 5.5, C.gold, 0.5)
  text(pdf, prop.location || '', M + 8, y, C.gray300, 10)
  y += 8

  line(pdf, M, y, PAGE_W - M, y, C.navySoft, 0.5)
  y += 4

  // Özellik hücreleri
  const cells = [
    ['bed', prop.rooms, 'Oda'],
    ['area', prop.size, 'Alan'],
    ['floor', prop.floor, 'Kat'],
    ['calendar', prop.age, 'Bina Yaşı'],
  ].filter(c => c[1])

  const cellW = CW / cells.length
  const cellY = y + 4
  cells.forEach((c, i) => {
    const cx = M + i * cellW
    if (i > 0) line(pdf, cx, cellY + 2, cx, cellY + 22, C.navySoft, 0.5)
    const innerX = cx + 5
    icon(pdf, c[0], innerX, cellY + 3, 8, C.gold, 0.5)
    text(pdf, fit(pdf, c[1], cellW - 16, 12, true), innerX + 11, cellY + 7, C.white, 12, { bold: true })
    text(pdf, c[2], innerX + 11, cellY + 13.5, C.gray400, 7.5)
  })

  // Alt iletişim şeridi
  const fb = PAGE_H - 26
  rect(pdf, 0, fb, PAGE_W, 26, C.navyDeep)
  rect(pdf, 0, fb, PAGE_W, 0.8, C.gold)
  const fy = fb + 11
  text(pdf, 'DANIŞMAN', M, fy, C.gold, 6.5, { bold: true })
  text(pdf, 'Ahmet Yılmaz', M, fy + 6, C.white, 9.5, { bold: true })
  text(pdf, '+90 532 123 45 67  ·  ahmet@fsbo.com', M, fy + 11.5, C.gray300, 8)
  text(pdf, `İlan No #${(prop.id || '').toUpperCase()}`, PAGE_W - M, fy + 2, C.gray400, 8, { align: 'right' })
  text(pdf, prop.time || new Date().toLocaleDateString('tr-TR'), PAGE_W - M, fy + 9, C.gray300, 8, { align: 'right' })
}

// ─── SAYFA 2: ÖZELLİKLER & AÇIKLAMA ───────────────────────────────────────────
function drawFeatures(pdf, prop, sections, pageNum, total) {
  pdf.addPage()
  drawHeader(pdf, 'İlan Özellikleri', fit(pdf, prop.title, 75, 8), 'floor')

  let y = 40

  if (sections.has('features_basic')) {
    y = sectionTitle(pdf, 'Temel Bilgiler', y)
    y += 2

    const netM2 = parseInt(prop.size) || null
    const rows = [
      ['Konut Tipi', prop.subtype || prop.type || 'Daire'],
      ['Oda Sayısı', prop.rooms || '—'],
      ['Net m²', prop.size || '—'],
      ['Brüt m²', netM2 ? `${netM2 + 20} m²` : '—'],
      ['Bulunduğu Kat', prop.floor || '—'],
      ['Bina Yaşı', prop.age || '—'],
      ['Isıtma', 'Doğalgaz Kombi'],
      ['Asansör', 'Var'],
      ['Otopark', 'Kapalı Otopark'],
      ['Aidat', '350 TL / ay'],
      ['Cephe', 'Güney'],
      ['Krediye Uygun', 'Evet'],
    ]

    const colW = CW / 2
    const rowH = 9.5
    const nRows = Math.ceil(rows.length / 2)
    rows.forEach((row, i) => {
      const col = i % 2
      const rIdx = Math.floor(i / 2)
      const rx = M + col * colW
      const ry = y + rIdx * rowH
      if (rIdx % 2 === 0) { setFill(pdf, C.gray50); pdf.rect(rx, ry, colW, rowH, 'F') }
      text(pdf, row[0], rx + 4, ry + rowH / 2 + 1, C.gray500, 8.5)
      text(pdf, fit(pdf, row[1], colW / 2 - 6, 8.5, true), rx + colW - 4, ry + rowH / 2 + 1, C.navy, 8.5, { align: 'right', bold: true })
    })
    // ince çerçeve + orta ayraç
    roundedRect(pdf, M, y, CW, nRows * rowH, 1.5, C.gray200, 'S')
    line(pdf, M + colW, y, M + colW, y + nRows * rowH, C.gray200, 0.4)
    y += nRows * rowH + 12
  }

  if (sections.has('description') && prop.desc) {
    y = sectionTitle(pdf, 'Açıklama', y)
    y += 3
    const lines = splitText(pdf, prop.desc, CW, 10)
    lines.forEach(l => { text(pdf, l, M, y, C.gray600, 10); y += 6 })
  }

  drawFooter(pdf, prop, pageNum, total)
}

// ─── SAYFA 3: FİYAT ANALİZİ ───────────────────────────────────────────────────
function drawPriceAnalysis(pdf, prop, d, sections, pageNum, total) {
  pdf.addPage()
  drawHeader(pdf, 'Fiyat Analizi & Karlılık', 'TCMB EVDS Konut Fiyat Endeksi', 'trend')

  let y = 40
  if (!d) {
    text(pdf, 'Fiyat analizi verisi bu ilan için mevcut değil.', M, y, C.gray400, 10)
    drawFooter(pdf, prop, pageNum, total)
    return
  }

  // KFE kartı
  if (sections.has('kfe') && d.latest?.kfe) {
    const boxH = 40
    roundedRect(pdf, M, y, CW, boxH, 3, C.navy)
    text(pdf, 'TCMB KONUT FİYAT ENDEKSİ', M + 7, y + 9, C.gray400, 7.5, { bold: true })
    text(pdf, d.latest.kfe.toLocaleString('tr-TR', { maximumFractionDigits: 0 }), M + 7, y + 22, C.white, 22, { bold: true })
    text(pdf, 'puan (2010 = 100)', M + 7, y + 30, C.gray400, 8)

    if (d.yoyChange !== null && d.yoyChange !== undefined) {
      const up = d.yoyChange >= 0
      const col = up ? C.gold : C.red
      text(pdf, `${up ? '↑' : '↓'} %${Math.abs(d.yoyChange).toFixed(1)}`, PAGE_W - M - 7, y + 16, col, 16, { align: 'right', bold: true })
      text(pdf, 'yıllık değişim', PAGE_W - M - 7, y + 23, C.gray400, 7.5, { align: 'right' })
    }

    // Sparkline (sağ alt)
    if (d.series?.length > 1) {
      const vals = d.series.map(s => s.kfe)
      const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1
      const sw = 70, sh = 9
      const sx = PAGE_W - M - 7 - sw, sy = y + boxH - 7
      setStroke(pdf, C.gold); pdf.setLineWidth(0.7); pdf.setLineCap('round')
      for (let i = 1; i < vals.length; i++) {
        const x1 = sx + ((i - 1) / (vals.length - 1)) * sw
        const x2 = sx + (i / (vals.length - 1)) * sw
        const y1 = sy - ((vals[i - 1] - min) / range) * sh
        const y2 = sy - ((vals[i] - min) / range) * sh
        pdf.line(x1, y1, x2, y2)
      }
    }
    y += boxH + 12
  }

  // m² karşılaştırma
  if (sections.has('m2') && d.sizeM2 > 0) {
    y = sectionTitle(pdf, 'm² Fiyat Karşılaştırması', y)
    y += 3
    const ilanM2 = Math.round(d.listingPrice / d.sizeM2)
    const dev = d.priceDeviation
    const cards = [
      ['Bu İlan', `₺${ilanM2.toLocaleString('tr-TR')}`, '/ m²', C.navy],
      ['Bölge Ortalaması', `₺${d.avgM2.toLocaleString('tr-TR')}`, '/ m²', C.gray500],
      ['Fark', `${dev > 0 ? '+' : ''}${dev.toFixed(1)}%`, dev > 0 ? 'bölgenin üzeri' : 'bölgenin altı', dev > 5 ? C.red : dev < -5 ? C.green : C.orange],
    ]
    const cardW = (CW - 8) / 3
    cards.forEach(([label, val, sub, col], i) => {
      const cx = M + i * (cardW + 4)
      roundedRect(pdf, cx, y, cardW, 24, 2.5, C.gray50)
      rect(pdf, cx, y, 1.6, 24, col)
      text(pdf, label, cx + 6, y + 7, C.gray500, 7.5)
      text(pdf, fit(pdf, val, cardW - 12, 13, true), cx + 6, y + 15, col, 13, { bold: true })
      text(pdf, sub, cx + 6, y + 20.5, C.gray400, 6.5)
    })
    y += 32
  }

  // Yatırım analizi
  if (sections.has('investment') && d.listingPrice > 0) {
    y = sectionTitle(pdf, 'Yatırım Analizi', y)
    y += 3
    const metrics = [
      ['Tahmini Kira Getirisi', `₺${(d.monthlyRent || 0).toLocaleString('tr-TR')} / ay`],
      ['Yıllık Değer Artışı', `₺${Math.round((d.annualAppreciation || 0) / 1000)}K`],
      ['Toplam Yıllık Getiri', `%${(d.totalReturnRate || 0).toFixed(1)}`],
      ['Geri Dönüş Süresi', `${d.breakEvenYears || '—'} yıl`],
    ]
    const colW = (CW - 4) / 2
    metrics.forEach(([label, val], i) => {
      const cx = M + (i % 2) * (colW + 4)
      const cy = y + Math.floor(i / 2) * 16
      roundedRect(pdf, cx, cy, colW, 13, 2, C.gray50)
      text(pdf, label, cx + 5, cy + 8, C.gray500, 8.5)
      text(pdf, val, cx + colW - 5, cy + 8, C.navy, 10, { align: 'right', bold: true })
    })
    y += 36

    const score = d.priceScore || 50
    const col = score >= 70 ? C.green : score >= 45 ? C.orange : C.red
    const tint = score >= 70 ? C.greenSoft : [254, 249, 235]
    const label = score >= 70 ? 'Fırsat İlanı' : score >= 45 ? 'Makul Fiyatlı' : 'Dikkatli Değerlendirin'
    roundedRect(pdf, M, y, CW, 16, 3, tint)
    rect(pdf, M, y, 2, 16, col)
    icon(pdf, 'check', M + 7, y + 4.5, 7, col, 0.7)
    text(pdf, label, M + 18, y + 7.5, col, 11, { bold: true })
    text(pdf, 'Bölge verilerine göre değerlendirme', M + 18, y + 12.5, C.gray500, 7.5)
    y += 22
  }

  text(pdf, 'Veriler TCMB EVDS Konut Fiyat Endeksi kullanılarak hesaplanmıştır. Yatırım tavsiyesi değildir.',
    M, y + 4, C.gray400, 7)
  drawFooter(pdf, prop, pageNum, total)
}

// ─── SAYFA: ÇEVREDEKİ YERLER ──────────────────────────────────────────────────
const CAT_COLOR = {
  transport: [84, 110, 122], school: [21, 101, 192], hospital: [211, 47, 47],
  market: [0, 137, 123], mall: [92, 107, 192], cafe: [109, 76, 65],
  entertainment: [233, 30, 99], culture: [142, 36, 170], sport: [46, 125, 50],
  mosque: [0, 131, 143], park: [56, 142, 60], residential: [37, 52, 74],
}
const CAT_LABEL = {
  transport: 'Ulaşım', school: 'Eğitim', hospital: 'Sağlık', market: 'Market',
  mall: 'AVM', cafe: 'Kafe & Restoran', entertainment: 'Eğlence',
  culture: 'Kültür & Sanat', sport: 'Spor', mosque: 'İbadet',
  park: 'Park & Yeşil Alan', residential: 'Site',
}

function drawNearby(pdf, prop, nearbyData, cats, startPage, total) {
  let pageNum = startPage
  pdf.addPage()
  drawHeader(pdf, 'Çevredeki Yerler', 'Yürüme & araç mesafeleri', 'pin')
  let y = 38
  let col = 0
  const colW = (CW - 6) / 2

  const newPage = (cont) => {
    drawFooter(pdf, prop, pageNum, total)
    pdf.addPage(); pageNum++
    drawHeader(pdf, cont ? 'Çevredeki Yerler (devam)' : 'Çevredeki Yerler', 'Yürüme & araç mesafeleri', 'pin')
    y = 38; col = 0
  }

  cats.forEach(key => {
    const cat = nearbyData[key]
    if (!cat?.places?.length) return
    const places = cat.places.slice(0, 5)
    const cardH = 13 + places.length * 12

    if (col === 0 && y + cardH > PAGE_H - 18) newPage(true)

    const cx = M + col * (colW + 6)
    const color = CAT_COLOR[key] || C.navy
    const label = CAT_LABEL[key] || key

    roundedRect(pdf, cx, y, colW, cardH, 2.5, C.gray50)
    roundedRect(pdf, cx, y, colW, cardH, 2.5, C.gray200, 'S')
    // başlık şeridi
    setFill(pdf, color)
    pdf.roundedRect(cx, y, colW, 10, 2.5, 2.5, 'F')
    pdf.rect(cx, y + 5, colW, 5, 'F')
    text(pdf, label, cx + 5, y + 6.7, C.white, 8.5, { bold: true })
    text(pdf, `${places.length} yer`, cx + colW - 5, y + 6.7, C.white, 7, { align: 'right' })

    places.forEach((p, i) => {
      const py = y + 10 + i * 12
      if (i > 0) line(pdf, cx + 4, py + 0.5, cx + colW - 4, py + 0.5, C.gray200, 0.3)
      text(pdf, fit(pdf, p.name, colW - 26, 8.5, true), cx + 5, py + 5.5, C.navy, 8.5, { bold: true })
      text(pdf, p.distLabel, cx + colW - 5, py + 5.5, color, 8, { align: 'right', bold: true })
      icon(pdf, 'walk', cx + 5, py + 7.2, 3.4, C.gray400, 0.35)
      text(pdf, `${p.walk} dk`, cx + 9.5, py + 9.8, C.gray500, 7)
      icon(pdf, 'car', cx + 20, py + 7.6, 3.6, C.gray400, 0.35)
      text(pdf, `${p.car} dk`, cx + 25, py + 9.8, C.gray500, 7)
    })

    if (col === 0) { col = 1 }
    else { col = 0; y += cardH + 6 }
  })

  drawFooter(pdf, prop, pageNum, total)
  return pageNum
}

// ─── SAYFA: GALERİ ────────────────────────────────────────────────────────────
async function drawGallery(pdf, prop, pageNum, total) {
  const urls = (prop.all_images?.length ? prop.all_images : [prop.img]).slice(0, 6)
  const loaded = (await Promise.all(urls.map(loadImageBase64))).filter(Boolean)
  if (!loaded.length) return false

  pdf.addPage()
  drawHeader(pdf, 'Fotoğraflar', `${loaded.length} görsel`, 'area')

  const gap = 5
  const cols = 2
  const imgW = (CW - gap) / cols
  const imgH = imgW * 0.66
  loaded.forEach((img, i) => {
    const cx = M + (i % cols) * (imgW + gap)
    const cy = 36 + Math.floor(i / cols) * (imgH + gap)
    drawCoverImage(pdf, img, cx, cy, imgW, imgH)
    roundedRect(pdf, cx, cy, imgW, imgH, 2, C.gray200, 'S')
  })
  drawFooter(pdf, prop, pageNum, total)
  return true
}

// ─── SAYFA: İLETİŞİM ──────────────────────────────────────────────────────────
function drawContact(pdf, prop, coverImg, pageNum, total) {
  pdf.addPage()
  rect(pdf, 0, 0, PAGE_W, PAGE_H, C.navy)
  rect(pdf, 0, 0, PAGE_W, 2, C.gold)

  // Marka
  text(pdf, 'FSBO', PAGE_W / 2 - 16, 40, C.gold, 18, { bold: true })
  text(pdf, 'EMLAK PLATFORMU', PAGE_W / 2 - 16, 47, C.gray300, 7, { bold: true })
  text(pdf, 'İLETİŞİME GEÇİN', PAGE_W / 2, 64, C.gray400, 8, { align: 'center', bold: true })
  text(pdf, 'Profesyonel Danışmanınız', PAGE_W / 2, 73, C.white, 15, { align: 'center', bold: true })

  // Danışman kartı
  const cw = 150, ch = 56, cx = (PAGE_W - cw) / 2, cardY = 84
  roundedRect(pdf, cx, cardY, cw, ch, 4, C.white)
  // avatar
  setFill(pdf, C.gold); pdf.circle(cx + 22, cardY + 22, 13, 'F')
  text(pdf, 'AY', cx + 22, cardY + 25, C.navy, 13, { align: 'center', bold: true })
  text(pdf, 'Ahmet Yılmaz', cx + 40, cardY + 16, C.navy, 13, { bold: true })
  text(pdf, 'Emlak Danışmanı', cx + 40, cardY + 22.5, C.gray500, 8.5)
  badge(pdf, '✓ Onaylı Danışman', cx + 40, cardY + 32, C.greenSoft, C.green, 7.5)
  line(pdf, cx + 6, cardY + 38, cx + cw - 6, cardY + 38, C.gray200, 0.4)
  icon(pdf, 'phone', cx + 8, cardY + 42, 6, C.navy, 0.5)
  text(pdf, '+90 532 123 45 67', cx + 17, cardY + 46.5, C.navy, 10, { bold: true })
  icon(pdf, 'mail', cx + 82, cardY + 42.5, 6, C.navy, 0.5)
  text(pdf, 'ahmet@fsbo.com', cx + 91, cardY + 46.5, C.navy, 10, { bold: true })

  // İstatistik şeridi
  const stY = cardY + ch + 12
  const stats = [['%98', 'Geri Dönüş'], ['15 dk', 'Ort. Yanıt'], ['42', 'Aktif İlan']]
  const sw = cw / 3
  stats.forEach(([v, l], i) => {
    const sx = cx + i * sw
    if (i > 0) line(pdf, sx, stY - 2, sx, stY + 10, C.navySoft, 0.5)
    text(pdf, v, sx + sw / 2, stY + 2, C.gold, 13, { align: 'center', bold: true })
    text(pdf, l, sx + sw / 2, stY + 8, C.gray400, 7.5, { align: 'center' })
  })

  // İlan özeti kartı
  const sumY = stY + 24
  roundedRect(pdf, cx, sumY, cw, 44, 4, C.navyDeep)
  rect(pdf, cx, sumY, cw, 1, C.gold)
  if (coverImg) drawCoverImage(pdf, coverImg, cx + 6, sumY + 6, 40, 32)
  else roundedRect(pdf, cx + 6, sumY + 6, 40, 32, 2, C.navySoft)
  const tX = cx + 52
  const tLines = splitText(pdf, prop.title, cw - 58, 9.5, true).slice(0, 2)
  let ty = sumY + 12
  tLines.forEach(l => { text(pdf, l, tX, ty, C.white, 9.5, { bold: true }); ty += 5.5 })
  text(pdf, prop.price, tX, ty + 3, C.gold, 14, { bold: true })
  text(pdf, fit(pdf, prop.location, cw - 58, 8), tX, ty + 9, C.gray400, 8)

  text(pdf, `fsbo.com   ·   İlan #${(prop.id || '').toUpperCase()}   ·   ${new Date().toLocaleDateString('tr-TR')}`,
    PAGE_W / 2, PAGE_H - 16, C.gray500, 8, { align: 'center' })
}

// ─── ANA EXPORT ───────────────────────────────────────────────────────────────
function b64ToBinary(b64) {
  let bin = ''
  try { bin = atob(b64) } catch {}
  return bin
}

export async function generatePDF(prop, sections, nearbyData, evdsData) {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

  // Türkçe destekli font kaydı (binary string formatında)
  pdf.addFileToVFS('DejaVu.ttf', b64ToBinary(DEJAVU_REGULAR))
  pdf.addFont('DejaVu.ttf', FONT, 'normal')
  pdf.addFileToVFS('DejaVu-Bold.ttf', b64ToBinary(DEJAVU_BOLD))
  pdf.addFont('DejaVu-Bold.ttf', FONT, 'bold')
  pdf.setFont(FONT, 'normal')

  // Kapak fotoğrafı
  const coverImg = sections.has('cover_photo') || sections.has('contact')
    ? await loadImageBase64(prop.img)
    : null

  // Hangi sayfalar var → toplam sayfa sayısı (footer için)
  const hasFeatures = sections.has('features_basic') || sections.has('description')
  const hasPrice = sections.has('kfe') || sections.has('m2') || sections.has('investment')
  const nearbyCats = [...sections].filter(s => s.startsWith('nearby_')).map(s => s.replace('nearby_', ''))
  const hasNearby = nearbyCats.length > 0 && nearbyData
  const hasGallery = sections.has('gallery') && (prop.all_images?.length > 0 || prop.img)
  const hasContact = sections.has('contact')

  let total = 1
  if (hasFeatures) total++
  if (hasPrice) total++
  if (hasNearby) total++ // çevredeki yerler taşarsa drawNearby ek sayfa ekler; tahmini
  if (hasGallery) total++
  if (hasContact) total++

  let page = 1
  await drawCover(pdf, prop, sections.has('cover_photo') ? coverImg : null)

  if (hasFeatures) { page++; drawFeatures(pdf, prop, sections, page, total) }
  if (hasPrice) { page++; drawPriceAnalysis(pdf, prop, evdsData, sections, page, total) }
  if (hasNearby) { page++; page = drawNearby(pdf, prop, nearbyData, nearbyCats, page, total) }
  if (hasGallery) { page++; await drawGallery(pdf, prop, page, total) }
  if (hasContact) { page++; drawContact(pdf, prop, coverImg, page, total) }

  const safe = (prop.title || 'ilan').replace(/[\\/:*?"<>|]/g, '').slice(0, 50).trim()
  pdf.save(`${safe} - FSBO Sunum.pdf`)
}
