import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PropertyCategory {
  satilik = 'satilik',
  kiralik = 'kiralik',
  villa = 'villa',
  daire = 'daire',
}

export class CreatePropertyDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsInt() @Min(0) price?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsInt() @Min(0) size?: number;
  @IsOptional() @IsString() rooms?: string;
  @IsOptional() @IsEnum(PropertyCategory) category?: PropertyCategory;
  @IsOptional() @IsNumber() lat?: number;
  @IsOptional() @IsNumber() lng?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
}

export class UpdatePropertyDto extends CreatePropertyDto {
  @IsOptional() @IsString() declare title: string;
  @IsOptional() @IsString() status?: string;
}

export class QueryPropertyDto {
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() sort?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) minPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) maxPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;
}
