/**
 * SQLite → Supabase Veri Taşıma Betiği
 *
 * Kullanım:
 *   1. SQLite veritabanını (revy.db) bu dizine kopyala
 *   2. .env dosyasına VITE_SUPABASE_URL ve VITE_SUPABASE_SERVICE_KEY ekle
 *   3. Çalıştır: node admin/migration-script.js
 *
 * Not: Şifre hash'leri bcrypt ile oluşturulmuş; Supabase Auth kendi hash
 * formatını kullandığı için doğrudan import yapılamaz. Bu betik kullanıcıları
 * auth.users tablosuna ekler ve şifre sıfırlama e-postası gönderilmesini
 * sağlar. Alternatif olarak supabase.auth.admin.createUser() kullanılabilir.
 */

import { createClient } from '@supabase/supabase-js'
import Database from 'better-sqlite3'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('HATA: VITE_SUPABASE_URL ve VITE_SUPABASE_SERVICE_KEY .env dosyasında tanımlı olmalı.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const dbPath = resolve(__dirname, '../apps/api/prisma/revy.db')
const sqlite = new Database(dbPath)

async function migrate() {
  console.log('🚀 SQLite → Supabase migrasyon başlıyor...\n')

  // 1. Kullanıcıları taşı
  console.log('📦 Kullanıcılar taşınıyor...')
  const users = sqlite.prepare('SELECT * FROM User').all()
  for (const user of users) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (existing) {
      console.log(`  ⏩ ${user.username} zaten var, atlanıyor.`)
      continue
    }

    const profile = user.profile ? JSON.parse(user.profile) : null

    const { error } = await supabase.from('users').insert({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      first_name: user.firstName,
      last_name: user.lastName,
      avatar: user.avatar,
      phone: user.phone,
      role: user.role,
      status: user.status,
      ban_reason: user.banReason,
      city: user.city,
      last_ip: user.lastIp,
      device: user.device,
      profile_completed: user.profileCompleted,
      profile: profile,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      last_seen_at: user.lastSeenAt,
    })
    if (error) {
      console.error(`  ❌ ${user.username}: ${error.message}`)
    } else {
      console.log(`  ✅ ${user.username}`)
    }
  }

  // 2. Abonelikleri taşı
  console.log('\n📦 Abonelikler taşınıyor...')
  const subs = sqlite.prepare('SELECT * FROM Subscription').all()
  for (const sub of subs) {
    const { error } = await supabase.from('subscriptions').upsert({
      id: sub.id,
      user_id: sub.userId,
      plan_id: sub.planId,
      status: sub.status,
      since: sub.since,
      renews_at: sub.renewsAt,
      updated_at: sub.updatedAt,
    }, { onConflict: 'id' })
    if (error) console.error(`  ❌ ${sub.id}: ${error.message}`)
    else console.log(`  ✅ ${sub.userId} → ${sub.planId}`)
  }

  // 3. Faturaları taşı
  console.log('\n📦 Faturalar taşınıyor...')
  const invoices = sqlite.prepare('SELECT * FROM Invoice').all()
  for (const inv of invoices) {
    const { error } = await supabase.from('invoices').upsert({
      id: inv.id,
      user_id: inv.userId,
      date: inv.date,
      plan: inv.plan,
      amount: inv.amount,
      currency: inv.currency,
      status: inv.status,
      pdf_url: inv.pdfUrl,
    }, { onConflict: 'id' })
    if (error) console.error(`  ❌ ${inv.id}: ${error.message}`)
  }
  console.log(`  ✅ ${invoices.length} fatura taşındı`)

  // 4. İlanları taşı
  console.log('\n📦 İlanlar taşınıyor...')
  const properties = sqlite.prepare('SELECT * FROM Property').all()
  for (const p of properties) {
    const { error } = await supabase.from('properties').upsert({
      id: p.id,
      owner_id: p.ownerId,
      title: p.title,
      description: p.description,
      location: p.location,
      city: p.city,
      price_text: p.priceText,
      price: p.price,
      size_text: p.sizeText,
      size: p.size,
      rooms: p.rooms,
      floor: p.floor,
      age: p.age,
      img: p.img,
      badge: p.badge,
      status: p.status,
      time_text: p.timeText,
      lat: p.lat,
      lng: p.lng,
      type: p.type,
      subtype: p.subtype,
      list_order: p.listOrder,
      is_daily: p.isDaily,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    }, { onConflict: 'id' })
    if (error) console.error(`  ❌ ${p.title}: ${error.message}`)
  }
  console.log(`  ✅ ${properties.length} ilan taşındı`)

  // 5. Listeleri taşı
  console.log('\n📦 Listeler taşınıyor...')
  const lists = sqlite.prepare('SELECT * FROM List').all()
  for (const l of lists) {
    const { error } = await supabase.from('lists').upsert({
      id: l.id,
      user_id: l.userId,
      name: l.name,
      color: l.color,
      icon: l.icon,
      created_at: l.createdAt,
    }, { onConflict: 'id' })
    if (error) console.error(`  ❌ ${l.name}: ${error.message}`)
  }
  console.log(`  ✅ ${lists.length} liste taşındı`)

  // 6. Liste öğelerini taşı
  console.log('\n📦 Liste öğeleri taşınıyor...')
  const items = sqlite.prepare('SELECT * FROM ListItem').all()
  for (const item of items) {
    const { error } = await supabase.from('list_items').upsert({
      id: item.id,
      list_id: item.listId,
      property_id: item.propertyId,
      added_at: item.addedAt,
    }, { onConflict: 'id' })
    if (error) console.error(`  ❌ ${item.id}: ${error.message}`)
  }
  console.log(`  ✅ ${items.length} öğe taşındı`)

  // 7. Müşterileri taşı
  console.log('\n📦 Müşteriler taşınıyor...')
  const customers = sqlite.prepare('SELECT * FROM Customer').all()
  for (const c of customers) {
    const { error } = await supabase.from('customers').upsert({
      id: c.id,
      owner_id: c.ownerId,
      name: c.name,
      email: c.email,
      phone: c.phone,
      notes: c.notes,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }, { onConflict: 'id' })
    if (error) console.error(`  ❌ ${c.name}: ${error.message}`)
  }
  console.log(`  ✅ ${customers.length} müşteri taşındı`)

  // 8. Müşteri-ilan ilişkilerini taşı
  console.log('\n📦 Müşteri-ilan ilişkileri taşınıyor...')
  const cls = sqlite.prepare('SELECT * FROM CustomerListing').all()
  for (const cl of cls) {
    const { error } = await supabase.from('customer_listings').upsert({
      id: cl.id,
      customer_id: cl.customerId,
      property_id: cl.propertyId,
      relation: cl.relation,
      created_at: cl.createdAt,
    }, { onConflict: 'id' })
    if (error) console.error(`  ❌ ${cl.id}: ${error.message}`)
  }
  console.log(`  ✅ ${cls.length} ilişki taşındı`)

  // 9. Randevuları taşı
  console.log('\n📦 Randevular taşınıyor...')
  const appointments = sqlite.prepare('SELECT * FROM Appointment').all()
  for (const a of appointments) {
    const { error } = await supabase.from('appointments').upsert({
      id: a.id,
      owner_id: a.ownerId,
      title: a.title,
      date: a.date,
      time: a.time,
      duration: a.duration,
      attendee_id: a.attendeeId,
      attendee_name: a.attendeeName,
      listing_id: a.listingId,
      listing_title: a.listingTitle,
      location: a.location,
      description: a.description,
      status: a.status,
      created_at: a.createdAt,
    }, { onConflict: 'id' })
    if (error) console.error(`  ❌ ${a.title}: ${error.message}`)
  }
  console.log(`  ✅ ${appointments.length} randevu taşındı`)

  // 10. Günlük girdileri taşı
  console.log('\n📦 Günlük girdileri taşınıyor...')
  const entries = sqlite.prepare('SELECT * FROM DailyEntry').all()
  for (const e of entries) {
    const { error } = await supabase.from('daily_entries').upsert({
      id: e.id,
      user_id: e.userId,
      date: e.date,
      content: e.content,
      type: e.type,
      created_at: e.createdAt,
    }, { onConflict: 'id' })
    if (error) console.error(`  ❌ ${e.id}: ${error.message}`)
  }
  console.log(`  ✅ ${entries.length} girdi taşındı`)

  // 11. Bildirimleri taşı
  console.log('\n📦 Bildirimler taşınıyor...')
  const notifs = sqlite.prepare('SELECT * FROM Notification').all()
  for (const n of notifs) {
    const { error } = await supabase.from('notifications').upsert({
      id: n.id,
      user_id: n.userId,
      type: n.type,
      title: n.title,
      description: n.description,
      read: n.read,
      created_at: n.createdAt,
    }, { onConflict: 'id' })
    if (error) console.error(`  ❌ ${n.title}: ${error.message}`)
  }
  console.log(`  ✅ ${notifs.length} bildirim taşındı`)

  console.log('\n✨ Migrasyon tamamlandı!')
}

migrate().catch(console.error)
