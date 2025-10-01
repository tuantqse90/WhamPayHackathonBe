import { ApiProperty } from '@nestjs/swagger';
import {
    BaseQueryDto,
    TransactionDto,
    TransactionStatus,
    TransactionType,
} from '@pay-wallet/domain';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

// API DTOs
export class CreateTransactionDto extends TransactionDto {}
export class UpdateTransactionDto extends TransactionDto {}
export class TransactionQueryDto extends BaseQueryDto {
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'The status of the transaction',
    example: TransactionStatus.PENDING,
  })
  @IsOptional()
  settingId?: string;

  @ApiProperty({
    description: 'The chain id of the transaction',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  readonly chainId: number = 10143;

  @ApiProperty({
    description: 'The type of the transaction',
    example: TransactionType.DEPOSIT,
  })
  @IsEnum(TransactionType)
  type?: Omit<
    TransactionType,
    'deposit' | 'withdraw' | 'transfer'
  >;

  @ApiProperty({
    description: 'The status of the transaction',
    example: TransactionStatus.PENDING,
  })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @ApiProperty({
    description: 'The from address of the transaction',
    example: '0x1234567890abcdef',
  })
  @IsOptional()
  from?: string;
}

// Event DTOs
export class CreateTransactionEvent {
  userId: string;
  chainId: number;
  transactionHash: string;
  from: string;
  to: string;
  type: TransactionType;
  data?: Record<string, unknown>;
}

export class UpdateTransactionEvent {
  id: string;
  transactionHash?: string;
  data?: Record<string, unknown>;
  status?: TransactionStatus;
}
