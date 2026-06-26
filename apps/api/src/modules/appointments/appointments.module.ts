import { Body, Controller, Delete, Get, Injectable, Module, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class UpsertAppointmentDto {
  @IsOptional() @IsString() title?: string;
  @IsString() date: string;
  @IsString() time: string;
  @IsOptional() @IsInt() duration?: number;
  @IsOptional() @IsString() attendeeId?: string;
  @IsOptional() @IsString() attendeeName?: string;
  @IsOptional() @IsString() listingId?: string;
  @IsOptional() @IsString() listingTitle?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() status?: string;
}

@Injectable()
class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  findAll(ownerId: string) {
    return this.prisma.appointment.findMany({ where: { ownerId }, orderBy: { date: 'asc' } });
  }

  async findOne(ownerId: string, id: string) {
    const a = await this.prisma.appointment.findFirst({ where: { id, ownerId } });
    if (!a) throw new NotFoundException('Randevu bulunamadı.');
    return a;
  }

  create(ownerId: string, dto: UpsertAppointmentDto) {
    return this.prisma.appointment.create({
      data: {
        ownerId,
        title: dto.title || `${dto.attendeeName || 'Katılımcı'} ile Görüşme`,
        date: dto.date,
        time: dto.time,
        duration: dto.duration || 60,
        attendeeId: dto.attendeeId || null,
        attendeeName: dto.attendeeName,
        listingId: dto.listingId || null,
        listingTitle: dto.listingTitle,
        location: dto.location,
        description: dto.description,
        status: (dto.status as any) || 'bekliyor',
      },
    });
  }

  async update(ownerId: string, id: string, dto: UpsertAppointmentDto) {
    await this.findOne(ownerId, id);
    return this.prisma.appointment.update({ where: { id }, data: { ...dto, status: dto.status as any } });
  }

  async remove(ownerId: string, id: string) {
    await this.findOne(ownerId, id);
    await this.prisma.appointment.delete({ where: { id } });
    return { success: true };
  }
}

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
class AppointmentsController {
  constructor(private service: AppointmentsService) {}

  @Get() findAll(@CurrentUser('id') uid: string) { return this.service.findAll(uid); }
  @Get(':id') findOne(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.findOne(uid, id); }
  @Post() create(@CurrentUser('id') uid: string, @Body() dto: UpsertAppointmentDto) { return this.service.create(uid, dto); }
  @Put(':id') update(@CurrentUser('id') uid: string, @Param('id') id: string, @Body() dto: UpsertAppointmentDto) { return this.service.update(uid, id, dto); }
  @Delete(':id') remove(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.remove(uid, id); }
}

@Module({ controllers: [AppointmentsController], providers: [AppointmentsService] })
export class AppointmentsModule {}
