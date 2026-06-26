# Revy — Backend Planı

> Emlak / FSBO SaaS uygulaması için backend mimarisi ve uygulama yol haritası.
> Frontend: React + Vite (mevcut). Şu an tüm veri `localStorage` + mock üzerinde çalışıyor;
> backend'in amacı `src/api/` katmanındaki mevcut REST sözleşmesini gerçek bir API ile değiştirmek.

---

## 1. Teknoloji Yığını

| Katman | Seçim | Not |
|---|---|---|
| Runtime / Framework | **Node.js (LTS) + NestJS** | Frontend ile aynı dil; modüler yapı domainlerle birebir örtüşür |
| Dil | **TypeScript** | Tip güvenliği, Prisma ile uçtan uca tipler |
| Veritabanı | **PostgreSQL 16 + PostGIS** | İlişkisel veri + harita/konum sorguları (ilan koordinatları, yakındaki yerler) |
| ORM | **Prisma** | Migration + tip üretimi |
| Cache / Kuyruk | **Redis** | Oturum/refresh, rate-limit, scraper job kuyruğu (BullMQ) |
| Kimlik | **JWT (access + refresh)** + bcrypt, **Google OAuth 2.0** | Mevcut `AuthContext` akışına uygun |
| Dosya / medya | **S3 uyumlu depo** (Cloudflare R2 / MinIO) | İlan fotoğrafları, avatar, üretilen PDF'ler |
| Doğrulama | **class-validator / Zod** | DTO seviyesinde |
| Dokümantasyon | **Swagger (OpenAPI)** | `@nestjs/swagger` ile otomatik |
| Scraper'lar | **Python (mevcut)** ayrı worker | `scraper.py`, `tuik_medas_scraper.py` korunur; kuyrukla tetiklenir |
| AI | **Anthropic Claude API** (`claude-opus-4-8`) | AI Asistan & Ev Bulucu için backend proxy |

> **Alternatif:** Scraper'lar Python olduğundan tüm backend FastAPI ile de yazılabilirdi. Tek dil isteniyorsa
> geçerli bir seçenek; ancak frontend ekosistemiyle uyum için NestJS tercih edildi.

---

## 2. Proje Yapısı (önerilen monorepo)

```
revy/
├── apps/
│   ├── web/                 # mevcut React/Vite frontend
│   └── api/                 # NestJS backend
│       └── src/
│           ├── modules/
│           │   ├── auth/
│           │   ├── users/
│           │   ├── properties/
│           │   ├── lists/
│           │   ├── customers/
│           │   ├── appointments/
│           │   ├── daily/
│           │   ├── notifications/
│           │   ├── subscriptions/
│           │   ├── admin/
│           │   ├── ai/
│           │   └── evds/
│           ├── common/      # guard, interceptor, filter, pipe
│           ├── prisma/
│           └── main.ts
├── workers/
│   └── scrapers/            # scraper.py, tuik_medas_scraper.py
├── prisma/schema.prisma
└── docker-compose.yml       # postgres + redis + minio
```

---

## 3. Veri Modeli

Frontend kaynak dosyalarından çıkarılan varlıklar (`data/accounts.js`, `data/lists.js`, `api/appointments.js`, `AuthContext.jsx`, `config/index.js`):

### User
`id, username (uniq), email (uniq), passwordHash, name, firstName, lastName, avatar, role (user|admin), phone, profile (JSON: nick, age, education, bio, interests[], platforms[], title, certificates[]), profileCompleted, status (aktif|pasif|kisitli|banli), banReason, lastIp, device, city, createdAt, lastSeenAt`

### Subscription (User 1—1)
`userId, planId (free|pro|enterprise), status (active|cancelled), since, renewsAt`

### Invoice
`id, userId, date, plan, amount, currency, status (paid|...), pdfUrl`

### Property (ilan)
`id, ownerId, title, description, location, city, district, price, currency, size, rooms, category (Satılık|Kiralık|Villa|Daire), lat, lng, images[], status, createdAt`

### List (favori liste)  + ListItem
`List: id, userId, name, color, icon` — `ListItem: listId, propertyId`

### Customer (CRM)  + CustomerListing
`Customer: id, ownerId, name, email, phone, notes` — `CustomerListing: customerId, propertyId, relation`

### Appointment
`id, ownerId, title, date, time, duration, attendeeId (→Customer), attendeeName, listingId (→Property), listingTitle, location, description, status (bekliyor|onaylandı|iptal), createdAt`

### DailyEntry (günlük)
`id, userId, date, content, type`

### Notification
`id, userId, type (calendar|...), title, description, read, createdAt`

### EvdsSeries (salt-okunur, scraper çıktısı)
`code, name, dataset (TÜİK|MEDAŞ|EVDS), period, value, region`

---

## 4. API Yüzeyi

Mevcut `src/api/*.js` modülleriyle **birebir** eşleşecek şekilde tasarlandı; böylece frontend'de yalnızca `USE_MOCK=false` yeterli olur.

### Auth
```
POST   /auth/register
POST   /auth/login
POST   /auth/google
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/me
PUT    /auth/profile
PUT    /auth/password
```

### Properties
```
GET    /properties           (filtre: category, city, price, size, sort, page)
GET    /properties/search?q=
GET    /properties/:id
POST   /properties
PUT    /properties/:id
DELETE /properties/:id
```

### Lists / Favorites
```
GET    /lists
POST   /lists
PUT    /lists/:id
DELETE /lists/:id
POST   /lists/:id/items      DELETE /lists/:id/items/:propertyId
```

### Customers
```
GET    /customers            GET /customers/:id
POST   /customers            PUT/DELETE /customers/:id
GET    /customers/:id/listings
```

### Appointments
```
GET    /appointments         GET /appointments/:id
POST   /appointments         PUT/DELETE /appointments/:id
```

### Daily & Notifications
```
GET/POST/PUT/DELETE /daily
GET    /notifications        PUT /notifications/:id/read   POST /notifications/read-all
```

### Subscription & Billing
```
GET    /subscription         POST /subscription            DELETE /subscription
GET    /invoices
POST   /payments/webhook     (iyzico/Stripe)
```

### EVDS (salt-okunur)
```
GET    /evds/series          GET /evds/series/:code
```

### Admin (role=admin guard)
```
GET    /admin/accounts
PUT    /admin/accounts/:id/status     (ban / kısıt / aktif)
GET    /admin/stats
```

### AI
```
POST   /ai/assistant         (Claude proxy, streaming)
POST   /ai/ev-bulucu         (kriterlere göre ilan eşleştirme)
```

---

## 5. Çapraz Kesen Konular

- **Auth akışı:** access token (kısa ömür) + refresh token (Redis'te, döndürülür). `apiClient.request`'e yalnızca `Authorization: Bearer` header'ı eklenecek.
- **Yetkilendirme:** `RolesGuard` (user/admin) + kaynak sahipliği kontrolü (kullanıcı yalnızca kendi ilan/müşteri/randevusuna erişir).
- **Hesap durumu:** `banli` → tüm korumalı uçlarda 403; `kisitli` → yazma uçlarında 403. Frontend'deki `BanScreen` / kısıt banner'ı bu yanıtlara göre çalışır.
- **Doğrulama & hata biçimi:** `{ message, statusCode, errors? }` — `apiClient` zaten `error.status` ve `error.data` okuyor.
- **Rate limiting:** `@nestjs/throttler` + Redis; login ve AI uçlarında sıkı limit.
- **Loglama & gözlemlenebilirlik:** request-id, yapısal log (pino), sağlık ucu `/health`.
- **Seed:** `emlak_verileri.csv`, `initial_listing_dump.json`, `data/accounts.js` SEED verisi ile ilk DB doldurma scripti.

---

## 6. Aşamalı Yol Haritası

### Faz 0 — İskelet
- [ ] NestJS uygulaması, `docker-compose` (Postgres + Redis + MinIO)
- [ ] Prisma şeması + ilk migration
- [ ] Config/env yönetimi, `/health`, global exception filter, Swagger

### Faz 1 — Auth & Kullanıcı
- [ ] Register / login / JWT + refresh, bcrypt
- [ ] Google OAuth
- [ ] Profil & şifre güncelleme, rol guard
- [ ] Frontend: `AuthContext` mock'unu API'ye bağla

### Faz 2 — Çekirdek Domainler
- [ ] Properties (CRUD + arama/filtre/sayfalama) + medya yükleme
- [ ] Lists/Favorites, Customers (+CustomerListings)
- [ ] Appointments, Daily, Notifications
- [ ] CSV/JSON seed scripti
- [ ] Frontend: ilgili modüllerde `USE_MOCK=false`

### Faz 3 — Abonelik & Admin
- [ ] Plan/abonelik, fatura, ödeme sağlayıcı (iyzico/Stripe) + webhook
- [ ] Admin: hesap listesi, durum değiştirme, istatistik

### Faz 4 — AI & Scraper Entegrasyonu
- [ ] Claude API proxy (AI Asistan, Ev Bulucu), streaming
- [ ] Python scraper'ları BullMQ job'u olarak zamanla; çıktıyı `EvdsSeries` / `Property` tablolarına yaz
- [ ] EVDS salt-okunur uçları

### Faz 5 — Sertleştirme & Dağıtım
- [ ] Rate-limit, kapsamlı DTO doğrulama
- [ ] Birim + e2e testler (Jest + Supertest)
- [ ] CI/CD (lint, test, migrate, build)
- [ ] Deploy (Railway/Render/Fly.io veya VPS + Docker)

---

## 7. Frontend Geçişini Kolaylaştıran Mevcut Yapı

- `src/api/client.js` — `fetch` tabanlı `apiClient`, `VITE_API_URL` (→ `/api`), hata/`status` yönetimi hazır.
- Her `api/*.js` modülünde `USE_MOCK` bayrağı + gerçek `apiClient.get/post/...` çağrıları **zaten yazılı**.
- Geçiş için gereken: (1) backend'i ayağa kaldır, (2) `VITE_API_URL` ayarla, (3) `VITE_USE_MOCK=false`, (4) `apiClient`'e token header'ı ekle.

---

## 8. Açık Kararlar

- Ödeme sağlayıcı: **iyzico** (TR pazarı) vs **Stripe** — netleştirilecek.
- Medya depo: yönetilen R2 mi yoksa self-host MinIO mu?
- Dağıtım hedefi (managed PaaS vs VPS).
- AI maliyet/limit politikası (plan bazlı kota).
