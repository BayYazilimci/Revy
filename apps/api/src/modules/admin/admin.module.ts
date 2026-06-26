import { Body, Controller, Get, Injectable, Module, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../../common/decorators/roles.decorator';

class SetStatusDto {
  @IsIn(['aktif', 'pasif', 'kisitli', 'banli']) status: 'aktif' | 'pasif' | 'kisitli' | 'banli';
  @IsOptional() @IsString() banReason?: string;
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

  setStatus(id: string, dto: SetStatusDto) {
    return this.prisma.user.update({
      where: { id },
      data: { status: dto.status, banReason: dto.status === 'banli' ? dto.banReason : null },
      select: { id: true, status: true, banReason: true },
    });
  }

  async stats() {
    const [users, properties, appointments, banned] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.property.count(),
      this.prisma.appointment.count(),
      this.prisma.user.count({ where: { status: 'banli' } }),
    ]);
    return { users, properties, appointments, banned };
  }
}

@ApiTags('admin')
@ApiBearerAuth()
@Roles('admin')
@Controller('admin')
class AdminController {
  constructor(private service: AdminService) {}

  @Get('accounts') accounts() { return this.service.accounts(); }
  @Get('stats') stats() { return this.service.stats(); }
  @Put('accounts/:id/status') setStatus(@Param('id') id: string, @Body() dto: SetStatusDto) { return this.service.setStatus(id, dto); }
}

@Module({ controllers: [AdminController], providers: [AdminService] })
export class AdminModule {}
