import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtUser } from '../decorators/current-user.decorator';

/**
 * Hesap durumuna göre erişim kısıtı:
 *  - banli   → tüm korumalı uçlarda 403
 *  - kisitli → yazma (POST/PUT/PATCH/DELETE) uçlarında 403
 * Frontend BanScreen / kısıt banner'ı bu yanıtlara göre çalışır.
 */
@Injectable()
export class AccountStatusGuard implements CanActivate {
  private readonly writeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as JwtUser | undefined;
    if (!user) return true; // public uç

    if (user.status === 'banli') {
      throw new ForbiddenException({
        message: 'Hesabınız askıya alınmış.',
        code: 'ACCOUNT_BANNED',
      });
    }
    if (user.status === 'kisitli' && this.writeMethods.has(req.method)) {
      throw new ForbiddenException({
        message: 'Hesabınız kısıtlı. Bu işlem geçici olarak devre dışı.',
        code: 'ACCOUNT_RESTRICTED',
      });
    }
    return true;
  }
}
