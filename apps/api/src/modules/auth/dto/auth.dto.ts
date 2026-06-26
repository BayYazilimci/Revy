import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'Kullanıcı adı en az 3 karakter olmalıdır.' })
  username: string;

  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  password: string;

  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEmail() email?: string;
}

export class LoginDto {
  @IsString() username: string;
  @IsString() password: string;
}

export class RefreshDto {
  @IsString() refreshToken: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin.' })
  email: string;
}

export class ResetPasswordDto {
  @IsString() token: string;
  @IsString() @MinLength(6) password: string;
}

export class UpdateProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() avatar?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() profile?: Record<string, unknown>;
  @IsOptional() profileCompleted?: boolean;
}

export class UpdatePasswordDto {
  @IsString() currentPassword: string;
  @IsString() @MinLength(6) newPassword: string;
}

export class GoogleLoginDto {
  @IsString() idToken: string;
}
