import { Body, Controller, Delete, Get, Injectable, Module, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class UpsertCustomerDto {
  @IsString() name: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() notes?: string;
}
class LinkListingDto {
  @IsString() propertyId: string;
  @IsOptional() @IsString() relation?: string;
}

@Injectable()
class CustomersService {
  constructor(private prisma: PrismaService) {}

  findAll(ownerId: string) {
    return this.prisma.customer.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(ownerId: string, id: string) {
    const c = await this.prisma.customer.findFirst({ where: { id, ownerId } });
    if (!c) throw new NotFoundException('Müşteri bulunamadı.');
    return c;
  }

  create(ownerId: string, dto: UpsertCustomerDto) {
    return this.prisma.customer.create({ data: { ...dto, ownerId } });
  }

  async update(ownerId: string, id: string, dto: UpsertCustomerDto) {
    await this.findOne(ownerId, id);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(ownerId: string, id: string) {
    await this.findOne(ownerId, id);
    await this.prisma.customer.delete({ where: { id } });
    return { success: true };
  }

  async listings(ownerId: string, id: string) {
    await this.findOne(ownerId, id);
    return this.prisma.customerListing.findMany({
      where: { customerId: id },
      include: { property: true },
    });
  }

  async linkListing(ownerId: string, id: string, dto: LinkListingDto) {
    await this.findOne(ownerId, id);
    return this.prisma.customerListing.upsert({
      where: { customerId_propertyId: { customerId: id, propertyId: dto.propertyId } },
      create: { customerId: id, propertyId: dto.propertyId, relation: dto.relation },
      update: { relation: dto.relation },
    });
  }
}

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
class CustomersController {
  constructor(private service: CustomersService) {}

  @Get() findAll(@CurrentUser('id') uid: string) { return this.service.findAll(uid); }
  @Get(':id') findOne(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.findOne(uid, id); }
  @Get(':id/listings') listings(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.listings(uid, id); }
  @Post() create(@CurrentUser('id') uid: string, @Body() dto: UpsertCustomerDto) { return this.service.create(uid, dto); }
  @Post(':id/listings') link(@CurrentUser('id') uid: string, @Param('id') id: string, @Body() dto: LinkListingDto) { return this.service.linkListing(uid, id, dto); }
  @Put(':id') update(@CurrentUser('id') uid: string, @Param('id') id: string, @Body() dto: UpsertCustomerDto) { return this.service.update(uid, id, dto); }
  @Delete(':id') remove(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.remove(uid, id); }
}

@Module({ controllers: [CustomersController], providers: [CustomersService] })
export class CustomersModule {}
