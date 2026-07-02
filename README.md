# 🏠 Revy — FSBO Emlak Platformu

**Revy** ("For Sale By Owner"), emlakçılar ve bireysel gayrimenkul satıcıları için geliştirilmiş kapsamlı bir **SaaS (Software as a Service)** platformudur. İlan yönetimi, müşteri ilişkileri yönetimi (CRM), randevu takvimi, yapay zeka destekli asistan, fiyat analizi ve yönetici paneli gibi özellikleri tek bir çatı altında sunar.

---

## ✨ Özellikler

### 📋 İlan Yönetimi
- İlan oluşturma, düzenleme ve silme
- Harita üzerinde keşif (Mapbox GL ile)
- Gelişmiş filtreleme ve sıralama
- Fotoğraf, konum, oda sayısı, metrekare vb. detaylar
- Günlük ilan akışı (Daily — 24 saat içinde eklenen ilanlar)

### 👥 Müşteri Yönetimi (CRM)
- Müşteri ekleme, düzenleme ve silme
- Müşteri-ilan eşleştirme
- Müşteri geçmişi ve iletişim bilgileri

### 📅 Randevu Takvimi
- Randevu oluşturma ve yönetme
- Müşteri ve ilan bazlı randevular
- Durum takibi (bekliyor / onaylandı / iptal)

### ⭐ Listeler ve Favoriler
- Özel liste oluşturma (renk ve ikon desteği)
- İlanları listelere ekleme/çıkarma
- Favori ilanlar

### 🤖 Yapay Zeka Özellikleri
- **FSBOAI**: WhatsApp benzeri arayüzle AI destekli sohbet
- **Ev Bulucu**: AI destekli akıllı ev eşleştirme
- Claude API entegrasyonu (backend proxy üzerinden)

### 📊 Fiyat Analizi & Raporlar
- Emsal fiyat karşılaştırma sistemi (₺/m² bazında)
- 5 kademeli fiyat değerlendirme (Çok Ucuz – Çok Pahalı)
- PDF sunum oluşturma (Türkçe karakter desteğiyle)
- TÜİK/EKDS veri entegrasyonu

### 🔐 Kullanıcı Yönetimi
- JWT tabanlı kimlik doğrulama (access + refresh token)
- Rol tabanlı yetkilendirme (Kullanıcı / Admin)
- Abonelik yönetimi (Ücretsiz / Pro / Kurumsal)
- Profil yönetimi ve hesap ayarları

### 🛠️ Yönetici Paneli
- Kullanıcı hesaplarını görüntüleme ve yönetme
- Hesap durumu değiştirme (aktif/pasif/kısıtlı/banlı)
- Genel sistem istatistikleri
- Admin kendini banlayamaz (güvenlik önlemi)

---

## 🏗️ Proje Mimarisi

```
revy-main/
├── src/                    # Frontend (React + Vite)
│   ├── api/                # Backend API istemci modülleri
│   ├── components/         # Paylaşılan UI bileşenleri
│   ├── config/             # Uygulama sabitleri
│   ├── context/            # React Context (state management)
│   ├── data/               # Statik veri dosyaları
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Sayfa bileşenleri (20 sayfa)
│   ├── router/             # React Router yapılandırması
│   └── utils/              # Yardımcı fonksiyonlar
│
├── apps/
│   └── api/                # Backend (NestJS + Prisma + PostgreSQL)
│       ├── prisma/         # Veritabanı şeması ve migrasyonlar
│       └── src/
│           ├── modules/    # NestJS modülleri (auth, properties, ...)
│           └── common/     # Ortak yapılar (guards, decorators, filters)
│
├── workers/                # (planlanan) Scraper worker'ları
├── scraper.py              # EmlakJet web scraper (Python)
├── tuik_medas_scraper.py   # TÜİK MEDAS veri çekici (Python)
└── docker-compose.yml      # PostgreSQL + Redis altyapısı
```

### 🖥️ Frontend Teknolojileri

| Teknoloji | Sürüm | Amaç |
|---|---|---|
| React | ^18.3.1 | UI Framework |
| Vite | ^5.4.10 | Build Tool |
| React Router DOM | ^7.18.0 | Sayfa yönlendirme |
| Tailwind CSS | ^3.4.19 | CSS Framework (navy/gold/cream tema) |
| Mapbox GL JS | ^3.25.0 | Harita görselleştirme |
| Lucide React | ^1.21.0 | İkon seti |
| html2pdf.js | ^0.14.0 | PDF oluşturma |

### 🖧 Backend Teknolojileri

| Teknoloji | Sürüm | Amaç |
|---|---|---|
| NestJS | ^10.4.4 | Backend framework |
| TypeScript | ^5.6.2 | Tip güvenliği |
| Prisma | ^5.20.0 | ORM |
| PostgreSQL 16 | alpine | Veritabanı |
| Redis 7 | alpine | Önbellekleme |
| Passport + JWT | — | Kimlik doğrulama |
| Swagger | ^7.4.2 | API dokümantasyonu |
| class-validator | ^0.14.1 | Veri doğrulama |

### 💾 Veritabanı Şeması (13 Model)

| Model | Açıklama |
|---|---|
| `User` | Kullanıcı hesapları (rol, durum, profil) |
| `RefreshToken` | JWT refresh token yönetimi |
| `Subscription` | Abonelik planları |
| `Invoice` | Fatura kayıtları |
| `Property` | Gayrimenkul ilanları |
| `List` | Özel listeler |
| `ListItem` | Liste-ilan eşleştirme |
| `Customer` | Müşteri bilgileri |
| `CustomerListing` | Müşteri-ilan ilişkisi |
| `Appointment` | Randevular |
| `DailyEntry` | Günlük girişleri |
| `Notification` | Bildirimler |
| `EvdsSeries` | TÜİK/EKDS veri serileri |

---

## 🚀 Kurulum

### Ön Gereksinimler
- Node.js ≥ 18
- Docker Desktop veya PostgreSQL 16 + Redis 7
- Mapbox token (ücretsiz: [mapbox.com](https://account.mapbox.com/))

### 1. Depoyu Klonla
```bash
git clone https://github.com/BayYazilimci/Revy.git
cd Revy
```

### 2. Frontend Bağımlılıklarını Yükle
```bash
npm install
```

### 3. Backend Bağımlılıklarını Yükle
```bash
cd apps/api
npm install
```

### 4. Ortam Değişkenlerini Ayarla
```bash
# Frontend
cp .env.example .env
# .env dosyasını düzenle: VITE_MAPBOX_TOKEN ve VITE_API_URL

# Backend
cd apps/api
cp .env.example .env
# .env dosyasını düzenle: DATABASE_URL, JWT secret'lar vb.
```

### 5. Docker ile Altyapıyı Başlat
```bash
# Kök dizinde
docker compose up -d
```

### 6. Backend Migration & Seed
```bash
cd apps/api
npx prisma migrate deploy
npm run seed
```

### 7. Backend'i Başlat
```bash
cd apps/api
npm run start:dev
```

### 8. Frontend'i Başlat
```bash
# Kök dizinde
npm run dev
```

Uygulama şu adreslerde çalışacaktır:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **Swagger Dokümantasyonu:** http://localhost:3000/api/docs

---

## 🐳 Docker

```bash
# PostgreSQL + Redis altyapısını başlat
docker compose up -d

# Container'ları durdur
docker compose down

# Verileri temizle (volumes dahil)
docker compose down -v
```

---

## 📁 API Rotaları

| Rota | Modül | Açıklama |
|---|---|---|
| `POST /api/auth/register` | Auth | Kullanıcı kaydı |
| `POST /api/auth/login` | Auth | Kullanıcı girişi |
| `POST /api/auth/refresh` | Auth | Token yenileme |
| `GET /api/auth/me` | Auth | Mevcut kullanıcı bilgisi |
| `PATCH /api/auth/profile` | Auth | Profil güncelleme |
| `GET /api/properties` | Properties | İlan listesi |
| `POST /api/properties` | Properties | İlan oluşturma |
| `GET /api/properties/daily` | Properties | Günlük ilanlar |
| `GET /api/lists` | Lists | Kullanıcı listeleri |
| `POST /api/lists` | Lists | Liste oluşturma |
| `GET /api/customers` | Customers | Müşteri listesi |
| `GET /api/appointments` | Appointments | Randevular |
| `GET /api/admin/accounts` | Admin | Hesap yönetimi |
| `GET /api/admin/overview` | Admin | Sistem istatistikleri |

Tam API dökümantasyonu için Swagger arayüzünü ziyaret edin: `/api/docs`

---

## 🧪 Test Hesapları

Seed scripti ile oluşturulan test hesapları:

| Rol | E-posta | Şifre |
|---|---|---|
| Admin | `admin@revy.local` | `admin123` |
| Kullanıcı | `user@revy.local` | `user123` |

---

## 📜 Script'ler

### Frontend (kök dizin)
```bash
npm run dev      # Geliştirme sunucusu
npm run build    # Üretim build'i
npm run preview  # Build önizleme
npm run lint     # Kod kalite kontrolü
```

### Backend (apps/api)
```bash
npm run start:dev     # Geliştirme modu (watch)
npm run build         # TypeScript derleme
npm run start:prod    # Üretim modu
npm run prisma:generate  # Prisma Client oluşturma
npm run prisma:migrate   # Migration çalıştırma
npm run seed             # Test verisi yükleme
```

---

## 🛣️ Proje Durumu

| Bileşen | Durum | Açıklama |
|---|---|---|
| Frontend | ✅ ~%85 | 20 sayfa, tüm routing, harita, AI, PDF |
| Auth | ✅ Tam | JWT, kayıt, giriş, profil, refresh token |
| Properties | ✅ Tam | CRUD, arama, günlük ilanlar |
| Admin | ✅ Tam | Hesap yönetimi, istatistikler |
| Lists | 🔄 Kısmi | Backend hazır, frontend bağlanacak |
| Customers | 🔄 Kısmi | Backend hazır, frontend bağlanacak |
| Appointments | 🔄 Kısmi | Backend hazır, frontend bağlanacak |
| Daily | 🔄 Kısmi | Backend hazır, frontend bağlanacak |
| Notifications | ❌ Eksik | localStorage çözümü |
| AI (Asistan + Ev Bulucu) | ❌ Eksik | Backend proxy gerekli |
| Ödeme/Stripe | ❌ Eksik | Planlanan |
| Medya Yükleme | ❌ Eksik | S3/R2 planlanan |

---

## 🤝 Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir dal oluşturun: `git checkout -b yeni-ozellik`
3. Değişikliklerinizi yapın: `git commit -m 'feat: yeni özellik eklendi'`
4. Dalınıza push edin: `git push origin yeni-ozellik`
5. Bir Pull Request açın

---

## 📄 Lisans

Bu proje özel bir lisans ile korunmaktadır. Tüm hakları saklıdır.

---

## 📬 İletişim

- GitHub: [@BayYazilimci](https://github.com/BayYazilimci)
- Proje: [https://github.com/BayYazilimci/Revy](https://github.com/BayYazilimci/Revy)
