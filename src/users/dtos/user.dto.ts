import { Type } from 'class-transformer';
import { IsNotEmpty, IsEmail, IsString, MinLength, ValidateNested, IsOptional } from 'class-validator';
import { CreateProfileDto, UpdateProfileDto } from './profile.dto';
import { PartialType, OmitType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => CreateProfileDto)
  profile: CreateProfileDto;
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['profile'])) {
  @ValidateNested()
  @IsOptional()
  @Type(() => UpdateProfileDto)
  profile?: UpdateProfileDto;
}
