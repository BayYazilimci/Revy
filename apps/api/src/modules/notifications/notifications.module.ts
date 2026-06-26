import { Body, Controller, Get, Injectable, Module, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class CreateNotificationDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() type?: string;
}

@Injectable()
class NotificationsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  create(userId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({ data: { ...dto, userId, type: dto.type || 'system' } });
  }

  async markRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    return { success: true };
  }
}

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get() findAll(@CurrentUser('id') uid: string) { return this.service.findAll(uid); }
  @Post() create(@CurrentUser('id') uid: string, @Body() dto: CreateNotificationDto) { return this.service.create(uid, dto); }
  @Put(':id/read') markRead(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.markRead(uid, id); }
  @Post('read-all') markAllRead(@CurrentUser('id') uid: string) { return this.service.markAllRead(uid); }
}

@Module({ controllers: [NotificationsController], providers: [NotificationsService] })
export class NotificationsModule {}
