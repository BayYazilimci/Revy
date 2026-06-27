import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePropertyDto {
  @IsString() title: string;
  @IsOptional() @IsString() desc?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() price?: string;   // '₺14.600.000'
  @IsOptional() @IsString() size?: string;    // '130 m²'
  @IsOptional() @IsString() rooms?: string;
  @IsOptional() @IsString() floor?: string;
  @IsOptional() @IsString() age?: string;
  @IsOptional() @IsString() img?: string;
  @IsOptional() @IsString() badge?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() type?: string;    // 'Satılık' | 'Kiralık'
  @IsOptional() @IsString() subtype?: string; // 'Daire' | 'Villa' | ...
  @IsOptional() @IsArray() @IsNumber({}, { each: true }) coords?: number[]; // [lng, lat]
}

export class UpdatePropertyDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() desc?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() price?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() rooms?: string;
  @IsOptional() @IsString() floor?: string;
  @IsOptional() @IsString() age?: string;
  @IsOptional() @IsString() img?: string;
  @IsOptional() @IsString() badge?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() subtype?: string;
  @IsOptional() @IsArray() @IsNumber({}, { each: true }) coords?: number[];
}
