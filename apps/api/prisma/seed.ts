import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Frontend src/data/accounts.js SEED ile uyumlu örnek hesaplar
const ACCOUNTS = [
  { username: 'test', name: 'Ahmet Yılmaz', email: 'ahmet@email.com', role: 'admin', plan: 'pro', status: 'aktif', city: 'İstanbul' },
  { username: 'selin.aydin', name: 'Selin Aydın', email: 'selin.aydin@mail.com', role: 'user', plan: 'pro', status: 'aktif', city: 'İstanbul' },
  { username: 'mert.k', name: 'Mert Korkmaz', email: 'mert.k@mail.com', role: 'user', plan: 'enterprise', status: 'aktif', city: 'Ankara' },
  { username: 'deniz.yilmaz', name: 'Deniz Yılmaz', email: 'deniz.yilmaz@mail.com', role: 'user', plan: 'free', status: 'pasif', city: 'İzmir' },
  { username: 'burak.sahin', name: 'Burak Şahin', email: 'burak.sahin@mail.com', role: 'user', plan: 'free', status: 'kisitli', city: 'Antalya' },
  { username: 'zeynep.a', name: 'Zeynep Arslan', email: 'zeynep.a@mail.com', role: 'user', plan: 'free', status: 'banli', city: 'Konya' },
] as const;

const SAMPLE_PROPERTIES = [
  { title: 'Kağıthane Merkezde 3+1 Satılık Daire', city: 'İstanbul', district: 'Kağıthane', price: 4750000, size: 125, rooms: '3+1', category: 'satilik' as const, lat: 41.085, lng: 28.972 },
  { title: 'Çankaya Eşyalı 2+1 Kiralık', city: 'Ankara', district: 'Çankaya', price: 24000, size: 95, rooms: '2+1', category: 'kiralik' as const, lat: 39.908, lng: 32.854 },
  { title: 'Çeşme Deniz Manzaralı Villa', city: 'İzmir', district: 'Çeşme', price: 18500000, size: 320, rooms: '5+1', category: 'villa' as const, lat: 38.323, lng: 26.305 },
];

async function main() {
  const passwordHash = await bcrypt.hash('test1234', 10);

  for (const acc of ACCOUNTS) {
    const user = await prisma.user.upsert({
      where: { username: acc.username },
      update: {},
      create: {
        username: acc.username,
        email: acc.email,
        passwordHash,
        name: acc.name,
        avatar: `https://i.pravatar.cc/100?u=${acc.username}`,
        role: acc.role as any,
        status: acc.status as any,
        city: acc.city,
        profileCompleted: true,
        banReason: acc.status === 'banli' ? 'Sahte ilan / spam' : null,
        subscription: { create: { planId: acc.plan as any, status: 'active' } },
      },
    });

    // test (admin) hesabına örnek ilanlar bağla
    if (acc.username === 'test') {
      const existing = await prisma.property.count({ where: { ownerId: user.id } });
      if (existing === 0) {
        for (const p of SAMPLE_PROPERTIES) {
          await prisma.property.create({ data: { ...p, ownerId: user.id, images: [] } });
        }
      }
    }
  }

  console.log('✔ Seed tamamlandı. Giriş: test / test1234 (admin)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
