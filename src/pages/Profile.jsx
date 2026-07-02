import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import DefaultAvatar from '../components/DefaultAvatar'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { User, Lock, Camera, Check, X, Shield } from 'lucide-react'

export default function Profile() {
  const { user, updateProfile, updatePassword, authError, clearError } = useAuth()
  const { addToast } = useApp()
  const fileRef = useRef(null)

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [avatarPreview, setAvatarPreview] = useState(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    clearError()
    setSaving(true)
    const ok = await updateProfile({
      name,
      email,
      avatar: avatarPreview || avatar,
    })
    setSaving(false)
    if (ok) addToast('Profil güncellendi')
  }

  const handleChangePassword = async () => {
    clearError()
    if (newPassword !== confirmPassword) {
      addToast('Yeni şifreler eşleşmiyor', 'error')
      return
    }
    setChangingPassword(true)
    const ok = await updatePassword(currentPassword, newPassword)
    setChangingPassword(false)
    if (ok) {
      addToast('Şifre değiştirildi')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const planLabels = { free: 'Ücretsiz', pro: 'Pro', enterprise: 'Kurumsal' }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-deep">Profil</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Hesap bilgilerini görüntüle ve güncelle</p>
      </div>

      <div className="bg-white rounded-3xl border border-cardBorder p-6 space-y-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cardBorder">
              {avatarPreview || avatar ? (
                <img src={avatarPreview || avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <DefaultAvatar className="w-full h-full" size={80} />
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-deep flex items-center justify-center shadow-md hover:bg-accentDark transition-colors"
            >
              <Camera size={13} strokeWidth={2.5} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="text-sm font-extrabold text-deep">{user?.name}</p>
            <p className="text-xs text-gray-400 font-medium">
              {user?.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
            </p>
            {user?.subscription && (
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-softMint text-green-700">
                <Check size={10} />
                {planLabels[user.subscription.planId] || user.subscription.planId}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-cardBorder p-6 space-y-5">
        <div className="flex items-center gap-2">
          <User size={16} className="text-gray-400" />
          <h2 className="text-sm font-extrabold text-deep">Kişisel Bilgiler</h2>
        </div>

        <div className="grid gap-4">
          <Input label="Ad Soyad" value={name} onChange={e => setName(e.target.value)} placeholder="Adınız" />
          <Input label="E-posta" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta adresiniz" />
        </div>

        {authError && <p className="text-xs text-red-400 font-medium">{authError}</p>}

        <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-cardBorder p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-gray-400" />
          <h2 className="text-sm font-extrabold text-deep">Şifre Değiştir</h2>
        </div>

        <div className="grid gap-4">
          <Input label="Mevcut Şifre" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••" />
          <Input label="Yeni Şifre" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••" />
          <Input label="Yeni Şifre (Tekrar)" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••" />
        </div>

        {authError && <p className="text-xs text-red-400 font-medium">{authError}</p>}

        <Button onClick={handleChangePassword} disabled={changingPassword} variant="secondary" className="w-full">
          {changingPassword ? 'Değiştiriliyor...' : 'Şifreyi Güncelle'}
        </Button>
      </div>

      {user?.role === 'admin' && (
        <div className="bg-white rounded-3xl border border-cardBorder p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-gray-400" />
            <h2 className="text-sm font-extrabold text-deep">Yetkiler</h2>
          </div>
          <p className="text-xs text-gray-500 font-medium">Yönetici yetkilerine sahipsiniz. Tüm sayfalara ve ayarlara erişiminiz bulunuyor.</p>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-softBlue text-blue-700">
            <Shield size={10} />
            Admin
          </span>
        </div>
      )}
    </div>
  )
}
