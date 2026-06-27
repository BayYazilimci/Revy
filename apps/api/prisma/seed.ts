import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

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

function parseInt0(text?: string): number | undefined {
  if (!text) return undefined;
  const n = parseInt(String(text).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : undefined;
}

// 'Gayrettepe, Beşiktaş, İstanbul' → 'İstanbul'
function cityFromLocation(loc?: string): string | undefined {
  if (!loc) return undefined;
  const parts = loc.split(',').map((s) => s.trim()).filter(Boolean);
  return parts[parts.length - 1];
}

async function main() {
  const passwordHash = await bcrypt.hash('test1234', 10);

  const userIds: string[] = [];
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
    userIds.push(user.id);
  }

  // --- İlan veri seti (src/data/properties.js'ten çıkarıldı) ---
  const seedPath = path.join(__dirname, 'properties-seed.json');
  if (!fs.existsSync(seedPath)) {
    console.warn('⚠ properties-seed.json yok — ilanlar atlandı.');
  } else {
    const existing = await prisma.property.count();
    if (existing > 0) {
      console.log(`ℹ ${existing} ilan zaten var — ilan importu atlandı.`);
    } else {
      const raw = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
      const map = raw.properties as Record<string, any>;
      const listOrderById = new Map<string, number>();
      (raw.propertyListIds as string[]).forEach((id, i) => listOrderById.set(id, i));
      const dailySet = new Set<string>(raw.dailyIds as string[]);

      const rows = Object.values(map).map((p: any, i: number) => ({
        id: p.id,
        ownerId: userIds[i % userIds.length], // sahipleri kullanıcılara dağıt
        title: p.title || 'İlan',
        description: p.desc || null,
        location: p.location || null,
        city: cityFromLocation(p.location) || null,
        priceText: p.price || null,
        price: parseInt0(p.price),
        sizeText: p.size || null,
        size: parseInt0(p.size),
        rooms: p.rooms || null,
        floor: p.floor || null,
        age: p.age || null,
        img: p.img || null,
        badge: p.badge || null,
        status: p.status || 'Aktif',
        timeText: p.time || null,
        lng: Array.isArray(p.coords) ? p.coords[0] : null,
        lat: Array.isArray(p.coords) ? p.coords[1] : null,
        type: p.type || null,
        subtype: p.subtype || null,
        listOrder: listOrderById.has(p.id) ? listOrderById.get(p.id)! : null,
        isDaily: dailySet.has(p.id),
      }));

      // Parça parça ekle (createMany)
      const chunk = 500;
      for (let i = 0; i < rows.length; i += chunk) {
        await prisma.property.createMany({ data: rows.slice(i, i + chunk), skipDuplicates: true });
      }
      console.log(`✔ ${rows.length} ilan içe aktarıldı.`);
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
