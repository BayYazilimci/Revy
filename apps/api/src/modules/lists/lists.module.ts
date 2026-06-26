import { Body, Controller, Delete, Get, Injectable, Module, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class UpsertListDto {
  @IsString() name: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() icon?: string;
}
class AddItemDto {
  @IsString() propertyId: string;
}

@Injectable()
class ListsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.list.findMany({
      where: { userId },
      include: { items: { select: { propertyId: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(userId: string, dto: UpsertListDto) {
    return this.prisma.list.create({ data: { ...dto, userId } });
  }

  private async assertOwner(userId: string, id: string) {
    const l = await this.prisma.list.findFirst({ where: { id, userId }, select: { id: true } });
    if (!l) throw new NotFoundException('Liste bulunamadı.');
  }

  async update(userId: string, id: string, dto: UpsertListDto) {
    await this.assertOwner(userId, id);
    return this.prisma.list.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.assertOwner(userId, id);
    await this.prisma.list.delete({ where: { id } });
    return { success: true };
  }

  async addItem(userId: string, id: string, propertyId: string) {
    await this.assertOwner(userId, id);
    return this.prisma.listItem.upsert({
      where: { listId_propertyId: { listId: id, propertyId } },
      create: { listId: id, propertyId },
      update: {},
    });
  }

  async removeItem(userId: string, id: string, propertyId: string) {
    await this.assertOwner(userId, id);
    await this.prisma.listItem.deleteMany({ where: { listId: id, propertyId } });
    return { success: true };
  }
}

@ApiTags('lists')
@ApiBearerAuth()
@Controller('lists')
class ListsController {
  constructor(private service: ListsService) {}

  @Get() findAll(@CurrentUser('id') uid: string) { return this.service.findAll(uid); }
  @Post() create(@CurrentUser('id') uid: string, @Body() dto: UpsertListDto) { return this.service.create(uid, dto); }
  @Put(':id') update(@CurrentUser('id') uid: string, @Param('id') id: string, @Body() dto: UpsertListDto) { return this.service.update(uid, id, dto); }
  @Delete(':id') remove(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.remove(uid, id); }
  @Post(':id/items') addItem(@CurrentUser('id') uid: string, @Param('id') id: string, @Body() dto: AddItemDto) { return this.service.addItem(uid, id, dto.propertyId); }
  @Delete(':id/items/:propertyId') removeItem(@CurrentUser('id') uid: string, @Param('id') id: string, @Param('propertyId') pid: string) { return this.service.removeItem(uid, id, pid); }
}

@Module({ controllers: [ListsController], providers: [ListsService] })
export class ListsModule {}
