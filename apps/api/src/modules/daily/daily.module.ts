import { Body, Controller, Delete, Get, Injectable, Module, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class UpsertDailyDto {
  @IsString() date: string;
  @IsString() content: string;
  @IsOptional() @IsString() type?: string;
}

@Injectable()
class DailyService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.dailyEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } });
  }

  create(userId: string, dto: UpsertDailyDto) {
    return this.prisma.dailyEntry.create({ data: { ...dto, userId } });
  }

  private async assertOwner(userId: string, id: string) {
    const e = await this.prisma.dailyEntry.findFirst({ where: { id, userId }, select: { id: true } });
    if (!e) throw new NotFoundException('Kayıt bulunamadı.');
  }

  async update(userId: string, id: string, dto: UpsertDailyDto) {
    await this.assertOwner(userId, id);
    return this.prisma.dailyEntry.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.assertOwner(userId, id);
    await this.prisma.dailyEntry.delete({ where: { id } });
    return { success: true };
  }
}

@ApiTags('daily')
@ApiBearerAuth()
@Controller('daily')
class DailyController {
  constructor(private service: DailyService) {}

  @Get() findAll(@CurrentUser('id') uid: string) { return this.service.findAll(uid); }
  @Post() create(@CurrentUser('id') uid: string, @Body() dto: UpsertDailyDto) { return this.service.create(uid, dto); }
  @Put(':id') update(@CurrentUser('id') uid: string, @Param('id') id: string, @Body() dto: UpsertDailyDto) { return this.service.update(uid, id, dto); }
  @Delete(':id') remove(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.remove(uid, id); }
}

@Module({ controllers: [DailyController], providers: [DailyService] })
export class DailyModule {}
