# Revy — Eksik Sayfalar & Eksik Backend'ler (Sahte Veri Temizliği)

Hedef: **hiçbir yerde sahte/mock veri kalmaması** — tüm sayfalar gerçek NestJS backend'ine bağlı olacak.
Durum: 2026-06-27. ✅ = gerçek backend'e bağlı · 🟡 = kısmen · ❌ = hâlâ mock/statik.

## 1. Sayfalar (20) — veri kaynağı durumu

| Sayfa | Durum | Veri kaynağı / sorun |
|---|---|---|
| Login | ✅ | `/auth/login` |
| ForgotPassword | ✅ | `/auth/forgot-password` (e-posta gönderimi yok) |
| ProfileSetup | ✅ | `/auth/profile` |
| Profile | 🟡 | profil gerçek; **avatar yükleme yok** (medya backend'i) |
| Account | 🟡 | abonelik gerçek; **faturalar boş** (üretilmiyor) |
| Subscription | 🟡 | planlar statik (config — kabul); abone olma gerçek |
| Billing | 🟡 | **faturalar boş** |
| Dashboard | ❌ | `data/properties`, `data/daily`, `useAppointments`(mock), `useCustomers`(mock) |
| Discover (Keşfet) | ❌ | `data/properties` + `data/districts` (statik); `propertiesApi` kullanılmıyor |
| MyListings (Portföyüm) | ✅ | Supabase `lists` + `list_items` (notlar dahil kalıcı) |
| Favorites (Listeler) | ✅ | Supabase `lists` + `list_items` (kalıcı) |
| ListingDetail | ❌ | `data/properties` + `useCustomers/useCustomerListings`(mock) + `useEvdsData`(mock) |
| CreateListing | ❌ | backend'e **kaydetmiyor** (yalnızca yerel) |
| Customers (Müşteriler) | ❌ | `useCustomers`(mock) + `useCustomerListings`(mock) — **alan uyumsuz** |
| Appointments (Randevular) | ❌ | `useAppointments` (mock + localStorage) |
| Daily (Günlük) | ❌ | `data/daily` + `data/properties`; backend `/daily` bağlı değil |
| **AdminPanel (/admin)** | ✅ | `/admin/accounts` + `/admin/overview` (gerçek); `data/accounts.js` silindi |
| AiAssistant | ❌ | `AiAssistantContext` (bellek, "test modu"); **AI backend yok** |
| EvBulucu | ❌ | `data/properties` + yerel eşleştirme; **AI backend yok** |
| Landing | ❌ | `data/properties` (vitrin) |

## 2. Eksik / yetersiz backend'ler

| # | Alan | Durum | Yapılacak |
|---|---|---|---|
| 1 | **Properties (ilan)** | Modül var ama boş + model dar | `data/properties.js` veri setini gerçek seed olarak DB'ye aktar; Property modeline UI alanları (görseller, oda, koordinat, ilan sahibi bilgisi, kategori) ekle; sayfaları `propertiesApi`'ye geçir |
| 2 | **Customers** | Alan uyumsuz | Model/DTO'yu `ad/soyad/telefon/sirket/sektor/notlar` ile hizala (veya frontend remap) |
| 3 | **CustomerListings** | Yarım | İlişki listesi + ilişki başına **not** alanı; `customerListingsApi` gerçek dalı yaz |
| 4 | **Lists / Favorites** | ✅ Tamam | Listeler + öğe başına `notes` alanı Supabase'de kalıcı; `AppContext` backend'e bağlı |
| 5 | **Daily** | Bağlı değil | Frontend'i `/daily`'ye bağla; "günün ilanları" modelini netleştir |
| 6 | **Notifications** | Bağlı değil | localStorage yerine `/notifications`; randevu hatırlatıcıları sunucuda |
| 7 | **Admin** | ✅ Tamam | `/admin/accounts` (durum değiştirme) + `/admin/overview` (KPI, büyüme, haftalık, plan, aktivite, sağlık) — hepsi gerçek veri |
| 8 | **AI (AiAssistant + EvBulucu)** | Yok | Claude proxy (`claude-opus-4-8`) + ilan eşleştirme uçları (Faz 4) |
| 9 | **EVDS / fiyat analizi** | Yok | `/evds` ucu + scraper'ı bağla; `useEvdsData` mock fallback'ı kaldır |
| 10 | **Medya / yükleme** | Yok | Avatar + ilan foto yükleme (S3/R2) |
| 11 | **Faturalar** | Yok | Fatura üretimi/listesi |
| 12 | **Google OAuth + şifre e-postası** | Stub | Gerçek OAuth + e-posta sağlayıcı |

## 3. Silinecek/temizlenecek sahte veri kaynakları

- `src/data/properties.js` (811 KB) — ~10 sayfa doğrudan kullanıyor → DB seed'e taşı, sonra sil
- ~~`src/data/accounts.js`~~ — ✅ silindi (admin artık gerçek backend)
- `src/data/daily.js` — günlük mock
- `src/data/lists.js` `defaultLists` — AppContext seed
- `src/data/districts.js` — harita sınırları (referans coğrafi veri; korunabilir)
- `api/*.js` içindeki `USE_MOCK` mock dalları: appointments, customers, lists, customerListings, properties
- localStorage kalıcılığı: `App.jsx` (randevu hatırlatma + bildirim), `NotificationPopup.jsx`, `api/appointments.js`
- `useEvdsData` mock fallback
- `AiAssistantContext` "test modu" (whatsapp/arka plan simülasyonu)

## Önerilen sıra
1. **Admin** (vurgulandı) → hesaplar gerçek backend'den, `data/accounts.js` kaldır
2. **Properties** (en büyük sahte veri kaynağı) → veri setini seed'le, sayfaları bağla
3. ~~Customers + CustomerListings + Lists/Favorites~~ → ✅ Lists/Favorites tamamlandı
4. Appointments + Daily + Notifications
5. AI (AiAssistant + EvBulucu) + EVDS
6. Medya yükleme + Faturalar + Google OAuth
