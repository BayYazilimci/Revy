import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { FileText, Download, Check, AlertCircle, Loader2 } from 'lucide-react'

function InvoiceTemplate({ inv, user }) {
  return (
    <div style={{ width: '794px', background: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '48px 56px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e3d10d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: '#1a2a3a' }}>F</div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#1e1b2e' }}>FSBO</span>
          </div>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0', fontWeight: 500 }}>Emlak Paneli</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e1b2e', margin: 0, lineHeight: 1.1 }}>FATURA</h1>
          <p style={{ fontSize: '13px', color: '#e3d10d', fontWeight: 700, margin: '4px 0 0' }}>{inv.id}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '36px', padding: '20px 24px', background: '#faf7f2', borderRadius: '12px' }}>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>Fatura Tarihi</p>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b2e', margin: 0 }}>{new Date(inv.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>Durum</p>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#059669', margin: 0 }}>{inv.status === 'paid' ? 'Ödendi' : 'Bekliyor'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>Müşteri</p>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b2e', margin: 0 }}>{user?.name || 'Kullanıcı'}</p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>{user?.email || ''}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>Ödeme Yöntemi</p>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b2e', margin: 0 }}>Kredi Kartı</p>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #f0ece6' }}>
            <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Açıklama</th>
            <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tutar</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #f0ece6' }}>
            <td style={{ padding: '16px 0' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b2e', margin: 0 }}>{inv.plan} Planı</p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>{inv.date} - {new Date(new Date(inv.date).getTime() + 30 * 86400000).toISOString().split('T')[0]} dönemi</p>
            </td>
            <td style={{ textAlign: 'right', padding: '16px 0', fontSize: '14px', fontWeight: 700, color: '#1e1b2e' }}>{inv.amount}.00 TL</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style={{ padding: '16px 0', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>KDV (%20)</td>
            <td style={{ textAlign: 'right', padding: '16px 0', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>{(inv.amount * 0.2).toFixed(2)} TL</td>
          </tr>
          <tr style={{ borderTop: '2px solid #1e1b2e' }}>
            <td style={{ padding: '16px 0', fontSize: '18px', fontWeight: 800, color: '#1e1b2e' }}>Toplam</td>
            <td style={{ textAlign: 'right', padding: '16px 0', fontSize: '22px', fontWeight: 900, color: '#1e1b2e' }}>{(inv.amount * 1.2).toFixed(2)} TL</td>
          </tr>
        </tfoot>
      </table>

      <div style={{ borderTop: '1px solid #f0ece6', paddingTop: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', color: '#d4d0c8', margin: 0 }}>© 2026 REVY · Bu fatura FSBO.app üzerinden oluşturulmuştur.</p>
        <p style={{ fontSize: '10px', color: '#d4d0c8', margin: '2px 0 0' }}>FSBO Emlak Paneli · Levent, Beşiktaş, İstanbul</p>
      </div>
    </div>
  )
}

export default function Billing() {
  const { user, getInvoices } = useAuth()
  const { addToast } = useApp()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)
  const invoiceRef = useRef(null)

  useEffect(() => {
    getInvoices().then(data => {
      setInvoices(data)
      setLoading(false)
    })
  }, [getInvoices])

  const downloadInvoice = useCallback(async (inv) => {
    setDownloading(inv.id)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const container = invoiceRef.current
      if (!container) return

      const children = [...container.children]
      const targetEl = children.find(c => c.textContent.includes(inv.id))
      if (!targetEl) return

      const temp = document.createElement('div')
      temp.style.cssText = 'position:fixed;left:0;top:0;width:794px;z-index:9999;background:#fff;pointer-events:none'
      temp.appendChild(targetEl.cloneNode(true))
      document.body.appendChild(temp)

      await html2pdf()
        .set({
          margin: 0,
          filename: `${inv.id} - ${inv.plan} Plani.pdf`,
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        })
        .from(temp)
        .outputPdf('blob')
        .then((blob) => {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${inv.id} - ${inv.plan} Plani.pdf`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          addToast(`${inv.id} indiriliyor...`)
        })

      document.body.removeChild(temp)
    } catch {
      addToast('Fatura indirilirken hata oluştu.', 'error')
    } finally {
      setDownloading(null)
    }
  }, [addToast])

  const statusBadge = (status) => {
    if (status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-softMint text-green-700">
          <Check size={10} /> Ödendi
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-softPink text-red-600">
        <AlertCircle size={10} /> Ödenmedi
      </span>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-deep">Fatura Geçmişi</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Ödeme geçmişini görüntüle ve faturaları indir</p>
      </div>

      <div className="bg-white rounded-3xl border border-cardBorder overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400 font-semibold">Yükleniyor...</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center">
            <FileText size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400 font-semibold">Henüz fatura bulunmuyor</p>
          </div>
        ) : (
          <div className="divide-y divide-cardBorder">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-4 hover:bg-cream/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center">
                    <FileText size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-deep">{inv.id}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{inv.date} &middot; {inv.plan} Planı</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-deep">{inv.amount} TL</span>
                  {statusBadge(inv.status)}
                  <button
                    onClick={() => downloadInvoice(inv)}
                    disabled={downloading === inv.id}
                    className="w-8 h-8 rounded-lg border border-cardBorder flex items-center justify-center hover:bg-cream transition-colors disabled:opacity-40"
                    title="Faturayı İndir"
                  >
                    {downloading === inv.id ? (
                      <Loader2 size={13} className="text-gray-400 animate-spin" />
                    ) : (
                      <Download size={13} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden invoice templates for PDF generation */}
      <div ref={invoiceRef} style={{ position: 'fixed', left: 0, top: 0, zIndex: -9999, opacity: 0.01, pointerEvents: 'none', overflow: 'hidden' }}>
        {invoices.map(inv => (
          <InvoiceTemplate key={inv.id} inv={inv} user={user} />
        ))}
      </div>
    </div>
  )
}
