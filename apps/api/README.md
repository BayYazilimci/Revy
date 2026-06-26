# Revy API (NestJS)

Emlak / FSBO SaaS backend. Plan: [`../../BACKEND_PLAN.md`](../../BACKEND_PLAN.md).

## Hızlı başlangıç

```bash
# 1) Altyapıyı başlat (Postgres + Redis)
docker compose up -d        # kök dizinden

# 2) Bağımlılıklar
cd apps/api
npm install
cp .env.example .env        # değerleri kontrol et

# 3) Veritabanı şeması + seed
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run seed

# 4) Çalıştır
npm run start:dev
```

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`
- Health: `GET /api/health`
- Seed giriş: **test / test1234** (admin)

## Frontend bağlama

Frontend kökünde `.env`:

```
VITE_API_URL=http://localhost:3000/api
VITE_USE_MOCK=false
```

## Modüller
auth · users · properties · lists · customers · appointments · daily · notifications · subscriptions · admin · health

Detay ve sonraki fazlar (AI proxy, scraper kuyruğu, ödeme) için `BACKEND_PLAN.md`.
