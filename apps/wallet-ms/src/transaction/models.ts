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
  @IsOptional()
  username?: string;

  @IsOptional()
  userAddress?: string;

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
    description: 'The from username of the transaction',
    example: 'abc',
  })
  @IsOptional()
  fromUsername?: string;


  @ApiProperty({
    description: 'The to username of the transaction',
    example: 'xyz',
  })
  @IsOptional()
  toUsername?: string;

  @ApiProperty({
    description: 'The from address of the transaction',
    example: '0x1234567890abcdef',
  })
  @IsOptional()
  fromAddress?: string;

  @ApiProperty({
    description: 'The to address of the transaction',
    example: '0xabcdef1234567890',
  })
  @IsOptional()
  toAddress?: string;
}