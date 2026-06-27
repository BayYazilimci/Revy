import { BadRequestException, Body, Controller, Get, Injectable, Module, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class SetStatusDto {
  @IsIn(['aktif', 'pasif', 'kisitli', 'banli']) status: 'aktif' | 'pasif' | 'kisitli' | 'banli';
  @IsOptional() @IsString() banReason?: string;
}

const TR_MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const TR_DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

function relativeTr(date: Date | null): string {
  if (!date) return 'Hiç';
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 2) return 'Çevrimiçi';
  if (min < 60) return `${min} dk önce`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} saat önce`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} gün önce`;
  const mo = Math.floor(day / 30);
  return `${mo} ay önce`;
}

@Injectable()
class AdminService {
  constructor(private prisma: PrismaService) {}

  accounts() {
    return this.prisma.user.findMany({
      select: {
        id: true, username: true, name: true, email: true, avatar: true, role: true,
        status: true, banReason: true, city: true, phone: true, lastIp: true, device: true,
        createdAt: true, lastSeenAt: true,
        subscription: { select: { planId: true } },
        _count: { select: { properties: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setStatus(actorId: string, id: string, dto: SetStatusDto) {
    // Admin kendini banlayıp/kısıtlayıp kilitlenemesin
    if (actorId === id && dto.status !== 'aktif') {
      throw new BadRequestException('Kendi hesabınızın durumunu kısıtlayamaz/banlayamazsınız.');
    }
    return this.prisma.user.update({
      where: { id },
      data: { status: dto.status, banReason: dto.status === 'banli' ? dto.banReason : null },
      select: { id: true, status: true, banReason: true },
    });
  }

  async overview() {
    const now = new Date();
    const day = 86400000;

    const [users, properties, appointments] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          createdAt: true, lastSeenAt: true, status: true, name: true, username: true,
          subscription: { select: { planId: true } },
        },
      }),
      this.prisma.property.findMany({
        select: { createdAt: true, title: true, owner: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.appointment.count(),
    ]);

    // --- KPI'lar ---
    const total = users.length;
    const active24h = users.filter((u) => u.lastSeenAt && now.getTime() - u.lastSeenAt.getTime() < day).length;
    const new7d = users.filter((u) => now.getTime() - u.createdAt.getTime() < 7 * day).length;
    const premium = users.filter((u) => u.subscription && u.subscription.planId !== 'free').length;

    // --- Plan dağılımı ---
    const planCounts = { free: 0, pro: 0, enterprise: 0 };
    users.forEach((u) => {
      const p = u.subscription?.planId ?? 'free';
      planCounts[p as keyof typeof planCounts]++;
    });
    const plans = [
      { label: 'Ücretsiz', value: planCounts.free, color: '#94a3b8' },
      { label: 'Pro', value: planCounts.pro, color: '#e3d10d' },
      { label: 'Kurumsal', value: planCounts.enterprise, color: '#8b5cf6' },
    ];

    // --- Büyüme (son 12 ay, kümülatif kullanıcı) ---
    const growth: { m: string; v: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = users.filter((u) => u.createdAt < monthEnd).length;
      const label = TR_MONTHS[(now.getMonth() - i + 12) % 12];
      growth.push({ m: label, v: count });
    }

    // --- Haftalık aktif (son 7 gün, gün bazında lastSeenAt) ---
    const weekly: { d: string; v: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(dayStart.getTime() + day);
      const count = users.filter((u) => u.lastSeenAt && u.lastSeenAt >= dayStart && u.lastSeenAt < dayEnd).length;
      weekly.push({ d: TR_DAYS[dayStart.getDay()], v: count });
    }

    // --- Aktivite akışı (gerçek son olaylar) ---
    const recentSignups = [...users]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3)
      .map((u, i) => ({
        id: `s${i}`, type: 'signup', text: 'Yeni kullanıcı kaydoldu',
        who: u.username, time: relativeTr(u.createdAt), color: '#3b82f6', at: u.createdAt,
      }));
    const recentListings = properties.map((p, i) => ({
      id: `l${i}`, type: 'listing', text: `Yeni ilan: ${p.title}`,
      who: p.owner?.username ?? '—', time: relativeTr(p.createdAt), color: '#10b981', at: p.createdAt,
    }));
    const activity = [...recentSignups, ...recentListings]
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, 6)
      .map(({ at, ...rest }) => rest);

    const kpis = [
      { key: 'total', label: 'Toplam Kullanıcı', value: total, icon: 'Users', color: '#e3d10d', bg: 'rgba(227,209,13,.15)' },
      { key: 'active', label: 'Aktif (24s)', value: active24h, icon: 'UserCheck', color: '#10b981', bg: 'rgba(16,185,129,.12)' },
      { key: 'new', label: 'Yeni Kayıt (7g)', value: new7d, icon: 'UserPlus', color: '#3b82f6', bg: 'rgba(59,130,246,.12)' },
      { key: 'premium', label: 'Premium Üye', value: premium, icon: 'Crown', color: '#8b5cf6', bg: 'rgba(139,92,246,.12)' },
    ];

    return {
      kpis, growth, weekly, plans, activity,
      health: {
        db: 'up',
        uptimeSec: Math.round(process.uptime()),
        users: total,
        properties: await this.prisma.property.count(),
        appointments,
      },
    };
  }
}

@ApiTags('admin')
@ApiBearerAuth()
@Roles('admin')
@Controller('admin')
class AdminController {
  constructor(private service: AdminService) {}

  @Get('accounts') accounts() { return this.service.accounts(); }
  @Get('overview') overview() { return this.service.overview(); }
  @Put('accounts/:id/status') setStatus(@CurrentUser('id') actorId: string, @Param('id') id: string, @Body() dto: SetStatusDto) { return this.service.setStatus(actorId, id, dto); }
}

@Module({ controllers: [AdminController], providers: [AdminService] })
export class AdminModule {}
