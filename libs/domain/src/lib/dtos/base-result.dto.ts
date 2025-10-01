import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class BaseResultDto<T> {
  success: boolean;
  message: string;
  data: T;

  constructor(data: T, message: string, success: boolean) {
    this.data = data;
    this.message = message;
    this.success = success;
  }
}

export class BasePaginationResultDto<T> {
  success: boolean;
  message: string;
  data: T;
  total: number;
  page: number;
  pageSize: number;

  constructor(data: T, total: number, page: number, pageSize: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
  }
}

export class BaseQueryParamsDto {
  @ApiProperty({
    description: 'Page number',
    required: false,
    default: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page = 1;

  @ApiProperty({
    description: 'Items per page',
    required: false,
    default: 50,
    type: Number,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pageSize = 50;

  @ApiProperty({
    description: 'Field to sort by',
    required: false,
    default: 'createdAt',
    type: String,
  })
  @IsString()
  @IsOptional()
  sortBy = 'createdAt';

  @ApiProperty({
    description: 'Sort order (asc|desc)',
    required: false,
    default: 'desc',
    type: String,
  })
  @IsString()
  @IsOptional()
  sortOrder = 'desc';

  @ApiProperty({ description: 'Search keyword', required: false })
  @IsString()
  @IsOptional()
  search?: string;
}
