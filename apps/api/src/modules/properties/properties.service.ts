import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePropertyDto, QueryPropertyDto, UpdatePropertyDto } from './dto/property.dto';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(q: QueryPropertyDto) {
    const page = q.page || 1;
    const limit = Math.min(q.limit || 20, 100);

    const where: Prisma.PropertyWhereInput = {};
    if (q.category && q.category !== 'Tümü') where.category = q.category as any;
    if (q.city) where.city = { contains: q.city, mode: 'insensitive' };
    if (q.minPrice != null || q.maxPrice != null) {
      where.price = {};
      if (q.minPrice != null) (where.price as Prisma.IntFilter).gte = q.minPrice;
      if (q.maxPrice != null) (where.price as Prisma.IntFilter).lte = q.maxPrice;
    }

    const orderBy = this.resolveSort(q.sort);

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.property.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  private resolveSort(sort?: string): Prisma.PropertyOrderByWithRelationInput {
    switch (sort) {
      case 'price_asc':
        return { price: 'asc' };
      case 'price_desc':
        return { price: 'desc' };
      case 'size_asc':
        return { size: 'asc' };
      case 'size_desc':
        return { size: 'desc' };
      case 'newest':
      default:
        return { createdAt: 'desc' };
    }
  }

  async search(query: string) {
    const data = await this.prisma.property.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 50,
    });
    return { data, total: data.length };
  }

  async findOne(id: string) {
    const prop = await this.prisma.property.findUnique({ where: { id } });
    if (!prop) throw new NotFoundException('İlan bulunamadı.');
    return prop;
  }

  create(ownerId: string, dto: CreatePropertyDto) {
    return this.prisma.property.create({
      data: { ...dto, images: dto.images || [], ownerId, category: dto.category || 'satilik' },
    });
  }

  async update(ownerId: string, id: string, dto: UpdatePropertyDto) {
    await this.assertOwner(ownerId, id);
    return this.prisma.property.update({ where: { id }, data: { ...dto } });
  }

  async remove(ownerId: string, id: string) {
    await this.assertOwner(ownerId, id);
    await this.prisma.property.delete({ where: { id } });
    return { success: true };
  }

  private async assertOwner(ownerId: string, id: string) {
    const prop = await this.prisma.property.findUnique({ where: { id }, select: { ownerId: true } });
    if (!prop) throw new NotFoundException('İlan bulunamadı.');
    if (prop.ownerId !== ownerId) throw new ForbiddenException('Bu ilan üzerinde yetkiniz yok.');
  }
}
