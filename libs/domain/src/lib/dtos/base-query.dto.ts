import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page = 1;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  size = 10;
}

export class BaseQueryDto extends PaginationQueryDto {
  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  search: string;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  orderBy: string;

  @ApiProperty({
    required: false,
    nullable: true,
    default: 'false',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    return [true, 'enabled', 'true'].indexOf(value) > -1;
  })
  desc = false;
}
