import { ApiProperty } from '@nestjs/swagger';
import {
    BaseQueryDto,
    TransactionDto,
    TransactionStatus,
    TransactionType,
} from '@pay-wallet/domain';
import { IsEnum, IsOptional } from 'class-validator';

// API DTOs
export class CreateTransactionDto extends TransactionDto {}
export class UpdateTransactionDto extends TransactionDto {}
export class ListTransactionsDto extends BaseQueryDto {
  @ApiProperty({
    description: 'The username of the user associated with the transaction',
    required: false,
  })
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'The wallet address of the user associated with the transaction',
    required: false,
  })
  @IsOptional()
  userAddress?: string;

  @ApiProperty({
    description: 'The type of the transaction',
    example: TransactionType.DEPOSIT,
    required: false,
  })
  @IsEnum(TransactionType)
  type?: Omit<
    TransactionType,
    'deposit' | 'withdraw' | 'transfer'
  >;

  @ApiProperty({
    description: 'The status of the transaction',
    example: TransactionStatus.PENDING,
    required: false,
  })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @ApiProperty({
    description: 'The from username of the transaction',
    required: false,
  })
  @IsOptional()
  fromUsername?: string;


  @ApiProperty({
    description: 'The to username of the transaction',
    required: false,
  })
  @IsOptional()
  toUsername?: string;

  @ApiProperty({
    description: 'The from address of the transaction',
    required: false,
  })
  @IsOptional()
  fromAddress?: string;

  @ApiProperty({
    description: 'The to address of the transaction',
    required: false,
  })
  @IsOptional()
  toAddress?: string;
}