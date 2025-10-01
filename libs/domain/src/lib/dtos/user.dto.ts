import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../enums';
import { Transform } from 'class-transformer';
export class UserDto {
  @ApiProperty({ description: 'User ID', required: false })
  id?: string;

  @ApiProperty({ description: 'User name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Account status' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Account role' })
  @IsString()
  role: string;

  @ApiProperty({
    required: false,
    description: 'Twitter ID if authenticated via Twitter',
  })
  @IsString()
  twitterId?: string;

  @ApiProperty({ required: false, description: 'User Wallet Address' })
  @IsString()
  address?: string;

  @ApiProperty({
    required: false,
    description: 'Authentication provider (e.g., twitter, local)',
  })
  provider?: string;

  @ApiProperty({ required: false, description: 'Account creation timestamp' })
  createdAt?: string;

  @ApiProperty({
    required: false,
    description: 'Last account update timestamp',
  })
  updatedAt?: string;
}

export class RegisterRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;
}

export class RegisterResponseDto {
  @ApiProperty({ type: () => UserDto })
  user: UserDto;
}

export class LoginRequestDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ type: () => UserDto, required: false })
  user?: UserDto;

  @ApiProperty()
  accessToken: string;
  
  @ApiProperty()
  refreshToken: string;
  
  @ApiProperty({
    required: false,
  })
  isCreatedWallet?: boolean;
}

export class LogoutResponseDto {
  @ApiProperty()
  message: string;
}

export class RefreshTokenRequestDto {
  @ApiProperty({ required: false, description: 'Refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}


export class TwitterLoginDto {
  @ApiProperty({ description: 'Twitter user ID' })
  twitterId: string;

  @ApiProperty({ description: 'Twitter username' })
  @Transform(({ value }) => value.toLowerCase())
  username: string;

  @ApiProperty({ description: 'Twitter display name' })
  name: string;

  @ApiProperty({ description: 'Twitter email address', required: false })
  @Transform(({ value }) => value?.toLowerCase())
  email?: string;

  @ApiProperty({ description: 'Provider (should be "twitter")', required: false })
  provider?: string;
}

export class MobileTwitterLoginDto {
  @ApiProperty({ description: 'Twitter access token from mobile OAuth' })
  @IsString()
  @IsNotEmpty()
  twitterAccessToken: string;

  @ApiProperty({ description: 'Device info for tracking', required: false })
  @IsOptional()
  @IsString()
  deviceInfo?: string;
}