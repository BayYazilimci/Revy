import { Ban, LogOut, Mail, ShieldAlert, RotateCcw } from 'lucide-react'

/**
 * Banlanan hesap uygulamaya girdiğinde tüm ekranı kaplayan yasak ekranı.
 * - account: hesap kaydı (banReason içerebilir)
 * - onLogout: çıkış
 * - onAdminRestore: yalnızca admin hesabı banlandıysa kendi erişimini geri alma (lockout önleme)
 */
export default function BanScreen({ account, onLogout, onAdminRestore }) {
  const isAdmin = account?.role === 'admin'
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'radial-gradient(circle at 50% 0%, #2a1414 0%, #1a0e0e 60%, #120a0a 100%)' }}>
      {/* dekoratif arka plan */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md text-center animate-scale-in">
        {/* ikon */}
        <div className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border border-red-500/30"
          style={{ background: 'rgba(239,68,68,.12)' }}>
          <Ban size={38} className="text-red-500" strokeWidth={2.2} />
          <span className="absolute w-20 h-20 rounded-3xl border border-red-500/40 animate-pulse" />
        </div>

        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-red-400 mb-3">
          <ShieldAlert size={13} /> Hesap Askıya Alındı
        </span>

        <h1 className="text-2xl font-black text-white leading-tight">
          Hesabınız yasaklandı
        </h1>
        <p className="text-sm text-white/60 mt-3 font-medium leading-relaxed">
          <span className="font-bold text-white/80">{account?.name || account?.email}</span> hesabı bir yönetici
          tarafından askıya alındığı için platforma erişiminiz geçici olarak durduruldu.
        </p>

        {/* sebep */}
        <div className="mt-5 text-left bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-red-400 mb-1">Yasaklama Nedeni</div>
          <p className="text-sm font-semibold text-white">{account?.banReason || 'Kullanım koşullarının ihlali'}</p>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-white/40">
            <span>Hesap: {account?.email}</span>
            <span>Durum: Yasaklı</span>
          </div>
        </div>

        {/* aksiyonlar */}
        <div className="mt-6 space-y-2.5">
          <a href="mailto:destek@fsbo.com"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold text-deep bg-accent btn shadow-lg shadow-accent/10">
            <Mail size={15} strokeWidth={2.5} /> Destek Ekibine İtiraz Et
          </a>
          <button onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <LogOut size={15} strokeWidth={2.5} /> Çıkış Yap
          </button>

          {isAdmin && onAdminRestore && (
            <button onClick={onAdminRestore}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-amber-300/80 hover:text-amber-200 transition-colors">
              <RotateCcw size={13} strokeWidth={2.5} /> Yönetici: erişimi geri yükle
            </button>
          )}
        </div>

        <p className="text-[11px] text-white/30 mt-6 font-medium">
          Bu bir hata olduğunu düşünüyorsanız itiraz formunu kullanın. Talebiniz 48 saat içinde incelenir.
        </p>
      </div>
    </div>
  )
}
