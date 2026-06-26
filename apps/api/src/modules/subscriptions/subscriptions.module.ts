import { Body, Controller, Delete, Get, Injectable, Module, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class SubscribeDto {
  @IsIn(['free', 'pro', 'enterprise']) planId: 'free' | 'pro' | 'enterprise';
}

@Injectable()
class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  get(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  subscribe(userId: string, planId: 'free' | 'pro' | 'enterprise') {
    const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return this.prisma.subscription.upsert({
      where: { userId },
      create: { userId, planId, status: 'active', renewsAt },
      update: { planId, status: 'active', renewsAt },
    });
  }

  async cancel(userId: string) {
    return this.prisma.subscription.update({
      where: { userId },
      data: { status: 'cancelled' },
    });
  }

  invoices(userId: string) {
    return this.prisma.invoice.findMany({ where: { userId }, orderBy: { date: 'desc' } });
  }
}

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller()
class SubscriptionsController {
  constructor(private service: SubscriptionsService) {}

  @Get('subscription') get(@CurrentUser('id') uid: string) { return this.service.get(uid); }
  @Post('subscription') subscribe(@CurrentUser('id') uid: string, @Body() dto: SubscribeDto) { return this.service.subscribe(uid, dto.planId); }
  @Delete('subscription') cancel(@CurrentUser('id') uid: string) { return this.service.cancel(uid); }
  @Get('invoices') invoices(@CurrentUser('id') uid: string) { return this.service.invoices(uid); }
}

@Module({ controllers: [SubscriptionsController], providers: [SubscriptionsService] })
export class SubscriptionsModule {}
