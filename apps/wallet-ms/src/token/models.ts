import { ApiProperty } from '@nestjs/swagger';
import { BaseQueryDto } from '@pay-wallet/domain';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString
} from 'class-validator';

export class ListTokensDto extends BaseQueryDto {
  @ApiProperty({
    description: 'The address of the token',
    example: '0x',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  readonly address: string;

  @ApiProperty({
    description: 'The name of the token',
    example: 'My Token',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  readonly name: string;

  @ApiProperty({
    description: 'The symbol of the token',
    example: 'MTK',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  readonly symbol: string;
}

