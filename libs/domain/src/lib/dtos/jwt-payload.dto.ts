import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object representing the user information embedded inside a JWT.
 * This DTO intentionally excludes sensitive fields such as the password.
 */
export class JwtPayloadDto {
  @ApiProperty({ description: 'User identifier' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Display name' })
  @IsString()
  @IsNotEmpty()
  name: string;


  @ApiProperty({ description: 'Username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User Status' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ description: 'User Role' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ description: 'Twitter ID', required: false })
  @IsOptional()
  @IsString()
  twitterId?: string;

  @ApiProperty({ description: 'User Address', required: false })
  @IsNotEmpty()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Authentication provider', required: false })
  @IsOptional()
  @IsString()
  provider?: string;
}
