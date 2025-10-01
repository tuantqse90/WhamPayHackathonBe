import { ApiProperty } from '@nestjs/swagger';

export class WalletDto {
  @ApiProperty({
    description: 'The unique identifier of the wallet',
    example: '123456789012345678901234',
  })
  id: string;

  @ApiProperty({
    description: 'The account ID associated with the wallet',
    example: '123456789012345678901234',
  })
  userId: string;

  @ApiProperty({
    description: 'The blockchain address of the wallet',
    example: '0x1234567890123456789012345678901234567890',
  })
  address: string;

  @ApiProperty({
    description: 'The encrypted private key of the wallet',
    example: 'encrypted_private_key',
    required: false,
  })
  encryptedPrivateKey: string;

  @ApiProperty({
    description: 'The salt used for encrypting the private key',
    example: 'private_key_salt',
    required: false,
  })
  privateKeySalt: string;

  @ApiProperty({
    description: 'Flag indicating if the wallet has been used',
    example: false,
    default: false,
  })
  isUsed: boolean;

  @ApiProperty({
    description: 'The MetaMask settings ID associated with the wallet',
    example: 'mm_settings_123',
    required: false,
  })
  mmSettingId?: string;

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