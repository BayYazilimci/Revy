import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';

// DB kaydını frontend'in beklediği ilan şekline dönüştür
function toClient(p: any) {
  return {
    id: p.id,
    title: p.title,
    price: p.priceText ?? (p.price != null ? `₺${p.price.toLocaleString('tr-TR')}` : ''),
    location: p.location ?? '',
    size: p.sizeText ?? (p.size != null ? `${p.size} m²` : ''),
    rooms: p.rooms ?? '',
    floor: p.floor ?? '',
    age: p.age ?? '',
    img: p.img ?? '',
    desc: p.description ?? '',
    badge: p.badge ?? '',
    status: p.status ?? 'Aktif',
    time: p.timeText ?? '',
    coords: p.lng != null && p.lat != null ? [p.lng, p.lat] : null,
    type: p.type ?? '',
    subtype: p.subtype ?? '',
    listOrder: p.listOrder ?? null,
    isDaily: p.isDaily ?? false,
    ownerId: p.ownerId,
  };
}

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  // Tüm ilanlar (frontend properties haritası + propertyList + dailyProperties bundan türetilir)
  async findAll() {
    const rows = await this.prisma.property.findMany({
      orderBy: [{ listOrder: 'asc' }, { createdAt: 'desc' }],
    });
    const data = rows.map(toClient);
    return { data, total: data.length };
  }

  async daily() {
    const rows = await this.prisma.property.findMany({
      where: { isDaily: true },
      orderBy: { listOrder: 'asc' },
    });
    return { data: rows.map(toClient), total: rows.length };
  }

  async search(query: string) {
    const q = query.trim();
    if (!q) return { data: [], total: 0 };
    const rows = await this.prisma.property.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 100,
    });
    return { data: rows.map(toClient), total: rows.length };
  }

  async findOne(id: string) {
    const p = await this.prisma.property.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('İlan bulunamadı.');
    return toClient(p);
  }

  async create(ownerId: string, dto: CreatePropertyDto) {
    const created = await this.prisma.property.create({
      data: {
        ownerId,
        title: dto.title,
        description: dto.desc,
        location: dto.location,
        city: dto.city,
        priceText: dto.price,
        price: parsePrice(dto.price),
        sizeText: dto.size,
        size: parseSize(dto.size),
        rooms: dto.rooms,
        floor: dto.floor,
        age: dto.age,
        img: dto.img,
        badge: dto.badge,
        status: dto.status || 'Aktif',
        timeText: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        lat: dto.coords?.[1],
        lng: dto.coords?.[0],
        type: dto.type,
        subtype: dto.subtype,
        listOrder: 0,
      },
    });
    return toClient(created);
  }

  async update(ownerId: string, id: string, dto: UpdatePropertyDto) {
    await this.assertOwner(ownerId, id);
    const data: Prisma.PropertyUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.desc !== undefined) data.description = dto.desc;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.price !== undefined) { data.priceText = dto.price; data.price = parsePrice(dto.price); }
    if (dto.size !== undefined) { data.sizeText = dto.size; data.size = parseSize(dto.size); }
    if (dto.rooms !== undefined) data.rooms = dto.rooms;
    if (dto.floor !== undefined) data.floor = dto.floor;
    if (dto.age !== undefined) data.age = dto.age;
    if (dto.img !== undefined) data.img = dto.img;
    if (dto.badge !== undefined) data.badge = dto.badge;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.subtype !== undefined) data.subtype = dto.subtype;
    if (dto.coords) { data.lng = dto.coords[0]; data.lat = dto.coords[1]; }
    const updated = await this.prisma.property.update({ where: { id }, data });
    return toClient(updated);
  }

  async remove(ownerId: string, id: string) {
    await this.assertOwner(ownerId, id);
    await this.prisma.property.delete({ where: { id } });
    return { success: true };
  }

  private async assertOwner(ownerId: string, id: string) {
    const p = await this.prisma.property.findUnique({ where: { id }, select: { ownerId: true } });
    if (!p) throw new NotFoundException('İlan bulunamadı.');
    if (p.ownerId !== ownerId) throw new ForbiddenException('Bu ilan üzerinde yetkiniz yok.');
  }
}

function parsePrice(text?: string): number | undefined {
  if (!text) return undefined;
  const n = parseInt(String(text).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : undefined;
}

function parseSize(text?: string): number | undefined {
  if (!text) return undefined;
  const n = parseInt(String(text).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : undefined;
}
