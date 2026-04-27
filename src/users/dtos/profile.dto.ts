import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl: string;

  @IsOptional()
  @IsString()
  biography: string;

  @IsOptional()
  @IsString()
  phone: string;
}

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
