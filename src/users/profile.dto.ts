import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  avatarUrl: string;

  @IsString()
  @IsNotEmpty()
  biography: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
