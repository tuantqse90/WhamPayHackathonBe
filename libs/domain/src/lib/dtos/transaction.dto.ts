import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus, TransactionType } from '../enums';


export class TransactionDto {
  @ApiProperty({
    description: 'The unique identifier of the transaction',
    example: '123456789012345678901234',
  })
  id: string;

  // @ApiProperty({
  //   description: 'The account id of the transaction',
  //   example: '123456789012345678901234',
  // })
  // userId: string;

  @ApiProperty({
    description: 'The transaction hash of the transaction',
    example: '0x1234567890123456789012345678901234567890',
  })
  transactionHash: string;

  @ApiProperty({
    description: 'The from address of the transaction',
    example: 'abc',
  })
  fromUser: string;

  @ApiProperty({
    description: 'The to address of the transaction',
    example: 'xyz',
  })
  toUser: string;

  @ApiProperty({
    description: 'The from address of the transaction',
    example: '0x1234567890123456789012345678901234567890',
  })
  fromAddress: string;

  @ApiProperty({
    description: 'The to address of the transaction',
    example: '0x1234567890123456789012345678901234567890',
  })
  toAddress: string;

  @ApiProperty({
    description: 'The type of the transaction',
    example: TransactionType.DEPOSIT,
    enum: TransactionType,
  })
  type: TransactionType;

  @ApiProperty({
    description: 'The status of the transaction',
    example: TransactionStatus.PENDING,
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @ApiProperty({
    description: 'The creation timestamp of the wallet',
    example: '2024-03-20T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The last update timestamp of the wallet',
    example: '2024-03-20T10:00:00Z',
  })
  updatedAt: Date;
}
