import { Controller, Get, Injectable, Module, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

@Injectable()
class UsersService {
  constructor(private prisma: PrismaService) {}

  async publicProfile(username: string) {
    const u = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, name: true, avatar: true, profile: true, city: true },
    });
    if (!u) throw new NotFoundException('Kullanıcı bulunamadı.');
    return u;
  }
}

@ApiTags('users')
@Controller('users')
class UsersController {
  constructor(private service: UsersService) {}

  @Public()
  @Get(':username')
  profile(@Param('username') username: string) {
    return this.service.publicProfile(username);
  }
}

@Module({ controllers: [UsersController], providers: [UsersService] })
export class UsersModule {}
