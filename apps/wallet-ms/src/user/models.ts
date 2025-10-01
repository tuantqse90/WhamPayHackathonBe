import { ApiProperty } from "@nestjs/swagger";
import { BaseQueryDto, UserRole } from "@pay-wallet/domain";
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class ListUsersDto extends BaseQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  email: string;
}

export class UpdateUserDto {
  userId: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  email: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;
}
