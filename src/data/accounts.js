/* ------------------------------------------------------------------ */
/*  Kalıcı hesap deposu (localStorage)                                  */
/*  Admin denetim paneli buradan "gerçek" hesap verisini okur/yazar.    */
/*  Giriş yapmış kullanıcı da otomatik buraya senkronize edilir.        */
/* ------------------------------------------------------------------ */

export const ACCOUNTS_KEY = 'fsbo_accounts'
export const ACCOUNTS_EVENT = 'fsbo_accounts_changed'

// status: 'aktif' | 'pasif' | 'kisitli' | 'banli'
const SEED = [
  { id: 'test', username: 'test', name: 'Ahmet Yılmaz', email: 'ahmet@email.com', avatar: 'https://i.pravatar.cc/100?img=16', role: 'admin', plan: 'Pro', status: 'aktif', city: 'İstanbul', listings: 12, joined: '15 Oca 2026', last: 'Çevrimiçi', phone: '+90 532 111 2233', lastIp: '88.230.10.4', device: 'Chrome · Windows' },
  { id: 1, username: 'selin.aydin', name: 'Selin Aydın', email: 'selin.aydin@mail.com', avatar: 'https://i.pravatar.cc/80?img=47', role: 'user', plan: 'Pro', status: 'aktif', city: 'İstanbul', listings: 24, joined: '12 Oca 2026', last: '3 dk önce', phone: '+90 535 220 1190', lastIp: '78.180.44.21', device: 'Safari · iPhone' },
  { id: 2, username: 'mert.k', name: 'Mert Korkmaz', email: 'mert.k@mail.com', avatar: 'https://i.pravatar.cc/80?img=12', role: 'user', plan: 'Kurumsal', status: 'aktif', city: 'Ankara', listings: 58, joined: '04 Kas 2025', last: '11 dk önce', phone: '+90 533 870 5521', lastIp: '195.142.10.7', device: 'Chrome · Android' },
  { id: 3, username: 'deniz.yilmaz', name: 'Deniz Yılmaz', email: 'deniz.yilmaz@mail.com', avatar: 'https://i.pravatar.cc/80?img=32', role: 'user', plan: 'Ücretsiz', status: 'pasif', city: 'İzmir', listings: 3, joined: '28 Şub 2026', last: '6 gün önce', phone: '+90 530 410 8842', lastIp: '85.105.3.99', device: 'Firefox · Windows' },
  { id: 4, username: 'ayse.demir', name: 'Ayşe Demir', email: 'ayse.demir@mail.com', avatar: 'https://i.pravatar.cc/80?img=5', role: 'user', plan: 'Pro', status: 'aktif', city: 'Bursa', listings: 17, joined: '19 Mar 2026', last: '1 saat önce', phone: '+90 532 661 7720', lastIp: '94.54.21.3', device: 'Chrome · macOS' },
  { id: 5, username: 'burak.sahin', name: 'Burak Şahin', email: 'burak.sahin@mail.com', avatar: 'https://i.pravatar.cc/80?img=68', role: 'user', plan: 'Ücretsiz', status: 'kisitli', city: 'Antalya', listings: 0, joined: '02 Haz 2026', last: '2 gün önce', phone: '+90 536 990 1145', lastIp: '176.88.12.50', device: 'Chrome · Windows' },
  { id: 6, username: 'elif.kaya', name: 'Elif Kaya', email: 'elif.kaya@mail.com', avatar: 'https://i.pravatar.cc/80?img=45', role: 'user', plan: 'Kurumsal', status: 'aktif', city: 'İstanbul', listings: 41, joined: '15 Eyl 2025', last: 'Çevrimiçi', phone: '+90 534 200 3310', lastIp: '88.241.55.8', device: 'Safari · iPad' },
  { id: 7, username: 'can.ozturk', name: 'Can Öztürk', email: 'can.ozturk@mail.com', avatar: 'https://i.pravatar.cc/80?img=15', role: 'user', plan: 'Pro', status: 'aktif', city: 'Eskişehir', listings: 12, joined: '21 Nis 2026', last: '34 dk önce', phone: '+90 531 740 9982', lastIp: '212.156.7.41', device: 'Chrome · Android' },
  { id: 8, username: 'zeynep.a', name: 'Zeynep Arslan', email: 'zeynep.a@mail.com', avatar: 'https://i.pravatar.cc/80?img=20', role: 'user', plan: 'Ücretsiz', status: 'banli', city: 'Konya', listings: 5, joined: '10 May 2026', last: '12 gün önce', phone: '+90 537 332 6614', lastIp: '46.197.8.12', device: 'Chrome · Windows', banReason: 'Sahte ilan / spam' },
]

function read() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* yoksay */ }
  return null
}

function write(list) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list))
  // Aynı sekmede dinleyenleri tetikle (storage olayı yalnızca diğer sekmelerde çalışır)
  window.dispatchEvent(new Event(ACCOUNTS_EVENT))
}

export function getAccounts() {
  let list = read()
  if (!list) {
    list = SEED
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list))
  }
  return list
}

export function setAccountStatus(id, status, extra = {}) {
  const list = getAccounts().map(a => (a.id === id ? { ...a, status, ...extra } : a))
  write(list)
  return list
}

export function getStatusByUsername(username) {
  if (!username) return 'aktif'
  const a = getAccounts().find(x => x.username === username)
  return a?.status || 'aktif'
}

export function getAccountByUsername(username) {
  return getAccounts().find(x => x.username === username) || null
}

// Giriş yapmış kullanıcıyı hesap deposuna ekle/güncelle
export function syncCurrentUser() {
  try {
    const cur = JSON.parse(localStorage.getItem('FSBO_user') || 'null')
    if (!cur || !cur.username) return
    const list = getAccounts()
    const idx = list.findIndex(a => a.username === cur.username)
    const planId = cur.subscription?.planId
    const plan = planId === 'enterprise' ? 'Kurumsal' : planId === 'pro' ? 'Pro' : 'Ücretsiz'
    if (idx === -1) {
      list.push({
        id: cur.username,
        username: cur.username,
        name: cur.name || cur.username,
        email: cur.email || `${cur.username}@email.com`,
        avatar: cur.avatar || 'https://i.pravatar.cc/100?img=16',
        role: cur.role || 'user',
        plan,
        status: 'aktif',
        city: cur.profile?.city || '—',
        listings: 0,
        joined: 'Bugün',
        last: 'Çevrimiçi',
        phone: cur.profile?.phone || '—',
        lastIp: '—',
        device: 'Bu oturum',
      })
      write(list)
    }
  } catch (e) { /* yoksay */ }
}
