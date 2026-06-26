import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import { PLANS } from '../config'
import { CreditCard, Check, X, ArrowLeft, Phone, Star } from 'lucide-react'

const CANCEL_REASONS = [
  { id: 'pahali', label: 'Çok pahalı' },
  { id: 'kullanmiyorum', label: 'Yeterince kullanmıyorum' },
  { id: 'alternatif', label: 'Alternatif bir hizmet buldum' },
  { id: 'ozellikler', label: 'İhtiyacım olan özellikler yok' },
  { id: 'kalite', label: 'Hizmet kalitesinden memnun değilim' },
  { id: 'diger', label: 'Diğer' },
]

export default function Subscription() {
  const { user, subscribeToPlan, cancelSubscription } = useAuth()
  const { addToast } = useApp()

  const [selectedPlan, setSelectedPlan] = useState(null)
  const [step, setStep] = useState('plans')
  const [processing, setProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')

  const [cancelStep, setCancelStep] = useState(null)
  const [cancelReasons, setCancelReasons] = useState([])
  const [cancelOtherText, setCancelOtherText] = useState('')
  const [callbackRequested, setCallbackRequested] = useState(false)
  const [callbackPhone, setCallbackPhone] = useState('')
  const [rating, setRating] = useState(0)
  const [ratingHover, setRatingHover] = useState(0)

  const currentPlan = user?.subscription
  const planLabels = { free: 'Ücretsiz', pro: 'Pro', enterprise: 'Kurumsal' }

  const handleSelectPlan = (plan) => {
    if (plan.price === 0) {
      handleSubscribe(plan.id)
      return
    }
    setSelectedPlan(plan)
    setStep('payment')
  }

  const handleSubscribe = async (planId) => {
    setProcessing(true)
    const ok = await subscribeToPlan(planId)
    setProcessing(false)
    if (ok) {
      addToast('Abonelik başarıyla aktifleştirildi')
      setStep('plans')
      setSelectedPlan(null)
    }
  }

  const startCancelFlow = () => {
    setCancelStep(1)
    setCancelReasons([])
    setCancelOtherText('')
    setCallbackRequested(false)
    setCallbackPhone('')
    setRating(0)
  }

  const handleCancelConfirm = async () => {
    setProcessing(true)
    const ok = await cancelSubscription()
    setProcessing(false)
    if (ok) {
      addToast('Aboneliğiniz iptal edildi')
      setCancelStep(null)
    }
  }

  const closeCancelFlow = () => {
    setCancelStep(null)
  }

  if (step === 'payment' && selectedPlan) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <button onClick={() => { setStep('plans'); setSelectedPlan(null) }} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-deep transition-colors">
          <ArrowLeft size={14} /> Planlara Dön
        </button>

        <div>
          <h1 className="text-2xl font-extrabold text-deep">Ödeme</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            <span className="font-bold">{selectedPlan.name}</span> planına geçiyorsunuz
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-cardBorder p-6 space-y-5">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-gray-400" />
            <h2 className="text-sm font-extrabold text-deep">Kart Bilgileri</h2>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">Kart Numarası</label>
              <input
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200 border-cardBorder"
                style={{ color: '#1e1b2e' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Son Kullanma</label>
                <input
                  value={cardExpiry}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
                    setCardExpiry(v)
                  }}
                  placeholder="AA/YY"
                  className="w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200 border-cardBorder"
                  style={{ color: '#1e1b2e' }}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">CVC</label>
                <input
                  value={cardCvc}
                  onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="123"
                  className="w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200 border-cardBorder"
                  style={{ color: '#1e1b2e' }}
                />
              </div>
            </div>
          </div>

          <div className="bg-cream rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>{selectedPlan.name} Planı</span>
              <span>{selectedPlan.price} TL / ay</span>
            </div>
            <div className="border-t border-cardBorder pt-2 flex justify-between text-sm font-extrabold text-deep">
              <span>Toplam</span>
              <span>{selectedPlan.price} TL</span>
            </div>
          </div>

          <Button onClick={() => handleSubscribe(selectedPlan.id)} disabled={processing} className="w-full" icon={<CreditCard size={15} />}>
            {processing ? 'İşleniyor...' : `${selectedPlan.price} TL Öde`}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-deep">Abonelik</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Planını seç, ödeme yap, aboneliğini yönet</p>
      </div>

      {currentPlan && (
        <div className="bg-white rounded-3xl border border-cardBorder p-6 space-y-4">
          <h2 className="text-sm font-extrabold text-deep">Mevcut Abonelik</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-extrabold text-deep">{planLabels[currentPlan.planId] || currentPlan.planId}</p>
              <p className="text-xs text-gray-400 font-medium">
                {currentPlan.status === 'active' ? 'Aktif' : 'İptal Edildi'} &middot; {currentPlan.since} tarihinden beri
              </p>
              {currentPlan.status === 'active' && currentPlan.renewsAt && (
                <p className="text-xs text-gray-400 font-medium">{currentPlan.renewsAt} tarihinde yenilenecek</p>
              )}
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
              currentPlan.status === 'active' ? 'bg-softMint text-green-700' : 'bg-softPink text-red-600'
            }`}>
              {currentPlan.status === 'active' ? <Check size={10} /> : <X size={10} />}
              {currentPlan.status === 'active' ? 'Aktif' : 'İptal Edildi'}
            </span>
          </div>
          {currentPlan.status === 'active' && !cancelStep && (
            <Button variant="danger" onClick={startCancelFlow} className="w-full" icon={<X size={14} />}>
              Aboneliği İptal Et
            </Button>
          )}
        </div>
      )}

      {cancelStep && (
        <div className="bg-white rounded-3xl border border-cardBorder p-6 animate-fadeIn">
          {cancelStep === 1 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-deep">Aboneliğinizi neden iptal etmek istiyorsunuz?</h3>
                <button onClick={closeCancelFlow} className="text-xs font-bold text-gray-400 hover:text-deep transition-colors">Vazgeç</button>
              </div>
              <p className="text-xs text-gray-500 font-medium">Birden fazla seçenek işaretleyebilirsiniz</p>
              <div className="space-y-2">
                {CANCEL_REASONS.map(reason => (
                  <label
                    key={reason.id}
                    onClick={() => setCancelReasons(prev =>
                      prev.includes(reason.id) ? prev.filter(r => r !== reason.id) : [...prev, reason.id]
                    )}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      cancelReasons.includes(reason.id)
                        ? 'border-accent bg-accent/5'
                        : 'border-cardBorder hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                      cancelReasons.includes(reason.id)
                        ? 'bg-accent border-accent'
                        : 'border-gray-300'
                    }`}>
                      {cancelReasons.includes(reason.id) && <Check size={12} className="text-deep" strokeWidth={3} />}
                    </div>
                    <span className="text-xs font-semibold text-deep">{reason.label}</span>
                  </label>
                ))}
                {cancelReasons.includes('diger') && (
                  <textarea
                    value={cancelOtherText}
                    onChange={e => setCancelOtherText(e.target.value)}
                    placeholder="Açıklamanızı yazın..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200 border-cardBorder mt-2"
                    style={{ color: '#1e1b2e' }}
                  />
                )}
              </div>
              <Button
                onClick={() => setCancelStep(2)}
                disabled={cancelReasons.length === 0}
                className="w-full"
              >
                Devam Et
              </Button>
            </div>
          )}

          {cancelStep === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-deep">Sizi geri aramamızı ister misiniz?</h3>
                <button onClick={closeCancelFlow} className="text-xs font-bold text-gray-400 hover:text-deep transition-colors">Vazgeç</button>
              </div>
              <p className="text-xs text-gray-500 font-medium">İptal talebinizle ilgili size yardımcı olabiliriz</p>

              <label
                onClick={() => setCallbackRequested(!callbackRequested)}
                className="flex items-center gap-3 p-3 rounded-2xl border-2 border-cardBorder cursor-pointer hover:border-gray-300 transition-all duration-200"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                  callbackRequested ? 'bg-accent border-accent' : 'border-gray-300'
                }`}>
                  {callbackRequested && <Check size={12} className="text-deep" strokeWidth={3} />}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-xs font-semibold text-deep">Beni geri arayın</span>
                </div>
              </label>

              {callbackRequested && (
                <div className="animate-slide-down">
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Telefon Numarası</label>
                  <input
                    value={callbackPhone}
                    onChange={e => setCallbackPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="5XX XXX XX XX"
                    className="w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200 border-cardBorder"
                    style={{ color: '#1e1b2e' }}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setCancelStep(1)} className="flex-1">
                  Geri
                </Button>
                <Button onClick={() => setCancelStep(3)} className="flex-1">
                  Devam Et
                </Button>
              </div>
            </div>
          )}

          {cancelStep === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-deep">Deneyiminizi puanlandırın</h3>
                <button onClick={closeCancelFlow} className="text-xs font-bold text-gray-400 hover:text-deep transition-colors">Vazgeç</button>
              </div>
              <p className="text-xs text-gray-500 font-medium">FSBO deneyiminizi nasıl buldunuz?</p>

              <div className="flex justify-center gap-2 py-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setRatingHover(star)}
                    onMouseLeave={() => setRatingHover(0)}
                    className="transition-all duration-150 hover:scale-110 active:scale-90"
                  >
                    <Star
                      size={36}
                      className={`transition-all duration-200 ${
                        (ratingHover || rating) >= star
                          ? 'fill-accent text-accent'
                          : 'text-gray-200'
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>

              {rating > 0 && rating <= 2 && (
                <p className="text-center text-xs font-bold text-red-400">Üzgünüz, sizi memnun edemedik. Geri bildiriminizi dikkate alacağız.</p>
              )}
              {rating === 3 && (
                <p className="text-center text-xs font-bold text-amber-500">Geri bildiriminizle gelişmemize yardımcı olun!</p>
              )}
              {rating >= 4 && (
                <p className="text-center text-xs font-bold text-green-600">Güzel! Sizi kaybetmek istemeyiz.</p>
              )}

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setCancelStep(2)} className="flex-1">
                  Geri
                </Button>
                <Button
                  onClick={handleCancelConfirm}
                  disabled={rating === 0 || processing}
                  className="flex-1"
                  icon={processing ? null : <X size={14} />}
                >
                  {processing ? 'İptal Ediliyor...' : 'Aboneliği İptal Et'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map(plan => {
          const isCurrent = currentPlan?.planId === plan.id && currentPlan?.status === 'active'
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-3xl border-2 p-6 flex flex-col transition-all duration-200 ${
                plan.popular ? 'border-accent shadow-[0_8px_32px_rgba(227,209,13,.15)]' : 'border-cardBorder'
              } ${isCurrent ? 'ring-2 ring-accent' : ''}`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-extrabold px-3 py-1 rounded-full bg-accent text-deep uppercase tracking-wider">
                  Popüler
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-2.5 right-4 text-[9px] font-extrabold px-3 py-1 rounded-full bg-softMint text-green-700 uppercase tracking-wider">
                  Aktif
                </span>
              )}

              <div className="mb-4">
                <h3 className="text-sm font-extrabold text-deep">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-0.5">
                  <span className="text-3xl font-extrabold text-deep">{plan.price}</span>
                  <span className="text-xs font-bold text-gray-400">TL / ay</span>
                </div>
                {plan.price === 0 && <p className="text-xs text-gray-400 font-medium mt-0.5">Ücretsiz</p>}
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-semibold text-gray-600">
                    <Check size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'primary' : 'secondary'}
                onClick={() => handleSelectPlan(plan)}
                disabled={isCurrent || processing}
                className="w-full"
              >
                {isCurrent ? 'Mevcut Plan' : plan.price === 0 ? 'Ücretsiz Başla' : 'Seç'}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
