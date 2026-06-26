import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto, UpdatePasswordDto, UpdateProfileDto } from './dto/auth.dto';

const PUBLIC_USER = {
  id: true,
  username: true,
  email: true,
  name: true,
  firstName: true,
  lastName: true,
  avatar: true,
  phone: true,
  role: true,
  status: true,
  profile: true,
  profileCompleted: true,
  createdAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // ---- token üretimi ----
  private async issueTokens(user: { id: string; username: string; role: string }) {
    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_TTL || '900s',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_TTL || '7d',
    });

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  private async getPublicUser(id: string) {
    return this.prisma.user.findUnique({ where: { id }, select: PUBLIC_USER });
  }

  // ---- register ----
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ username: dto.username }, { email: dto.email ?? '__none__' }] },
    });
    if (exists) throw new ConflictException('Bu kullanıcı adı veya e-posta zaten alınmış.');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const name = [dto.firstName, dto.lastName].filter(Boolean).join(' ') || dto.username;

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email || `${dto.username}@revy.local`,
        passwordHash,
        name,
        firstName: dto.firstName,
        lastName: dto.lastName,
        avatar: `https://i.pravatar.cc/100?u=${dto.username}`,
        profileCompleted: false,
        subscription: { create: { planId: 'free', status: 'active' } },
      },
    });

    const tokens = await this.issueTokens(user);
    return { user: await this.getPublicUser(user.id), ...tokens, needsProfile: true };
  }

  // ---- login ----
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Kullanıcı adı veya şifre hatalı.');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Kullanıcı adı veya şifre hatalı.');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    });

    const tokens = await this.issueTokens(user);
    return { user: await this.getPublicUser(user.id), ...tokens };
  }

  // ---- refresh (rotasyon) ----
  async refresh(refreshToken: string) {
    let payload: { sub: string; username: string; role: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Oturum süresi doldu, tekrar giriş yapın.');
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const stored = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, tokenHash, revokedAt: null },
    });
    if (!stored) throw new UnauthorizedException('Geçersiz oturum.');

    // eski token'ı iptal et (rotasyon)
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Geçersiz oturum.');

    const tokens = await this.issueTokens(user);
    return { ...tokens };
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  // ---- me / profil ----
  async me(userId: string) {
    return this.getPublicUser(userId);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.profile) data.profile = dto.profile;
    await this.prisma.user.update({ where: { id: userId }, data });
    return this.getPublicUser(userId);
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) throw new BadRequestException('Şifre değiştirilemiyor.');
    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) throw new BadRequestException('Mevcut şifre hatalı.');
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { success: true };
  }

  // ---- şifre sıfırlama (iskelet; e-posta entegrasyonu Faz 5) ----
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Kullanıcı bulunsa da bulunmasa da aynı yanıt (enumeration önleme)
    return { success: true, message: 'Eğer bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi.' };
  }
}
