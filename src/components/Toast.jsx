import { useApp } from '../context/AppContext'
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'

export default function Toast() {
  const { toasts } = useApp()

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] pointer-events-none flex flex-col gap-2 items-center">
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium animate-toast-in pointer-events-auto"
          style={{ background: t.type === 'error' ? '#dc2626' : t.type === 'warning' ? '#d97706' : '#1e1b2e', color: '#fff' }}
        >
          {t.type === 'error' ? <AlertCircle size={16} /> : t.type === 'warning' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}
