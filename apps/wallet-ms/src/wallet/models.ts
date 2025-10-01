import { ApiProperty } from '@nestjs/swagger';
import { WalletType } from '@pay-wallet/domain';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class WalletInfoDto {
  @ApiProperty({
    description: 'The address of the wallet',
    example: '0x1234567890123456789012345678901234567890',
  })
  readonly address: string;

  @ApiProperty({
    description: 'The private key of the wallet',
    example: '0x1234567890123456789012345678901234567890',
  })
  readonly privateKey: string;

  @ApiProperty({
    description: 'The mnemonic of the wallet',
    example:
      'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12',
  })
  readonly mnemonic: string;
}

export class TransferTokenToMainWalletDto {
  @ApiProperty({
    description: 'The token address',
  })
  @IsString()
  @IsNotEmpty()
  tokenAddress: string;

  @ApiProperty({
    description: 'Use existing wallets',
  })
  @IsBoolean()
  useExistingWallets: boolean;

  @ApiProperty({
    description: 'The main wallet address',
  })
  @IsString()
  @IsNotEmpty()
  mainWalletAddress: string;
}

export class GetWalletsBySettingIdDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsString()
  @IsNotEmpty()
  readonly settingId: string;

  @IsEnum(WalletType)
  @IsNotEmpty()
  readonly type: WalletType;

  @IsNumber()
  @IsOptional()
  readonly page?: number = 1;

  @IsNumber()
  @IsOptional()
  readonly limit?: number = 10;
}

export class WalletWithTokenBalancesDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  sellTokenBalance?: string;

  @ApiProperty()
  buyTokenBalance?: string;

  @ApiProperty()
  targetTokenBalance?: string;
}

export class SendTokensDto {
  @ApiProperty({
    description: 'The chain id',
  })
  @IsOptional()
  @Type(() => Number)
  readonly chainId: number = 8453;

  @ApiProperty({
    description: 'The address of the token',
    default: '0x',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  readonly tokenAddress: string;

  @ApiProperty({
    description: 'Token native',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly isNative: boolean;

  @ApiProperty({
    description: 'The amount of the token for each wallet',
  })
  @IsNotEmpty()
  @Type(() => Number)
  readonly amount: number;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  readonly privateKey: string;

  @ApiProperty({
    description: 'The address receive token',
    type: [String],
  })
  @ArrayMinSize(1)
  wallets: string[];
}

// Dto for multisend tokens from user's main wallet
export class WalletMultiSendDto extends SendTokensDto {
  @IsString()
  @IsOptional()
  userId: string;

  // @ApiProperty({
  //   description: 'The setting id',
  // })
  // @IsString()
  // @IsNotEmpty()
  // readonly settingId: string;
}

export class WithdrawRequestDto {
  @ApiProperty({
    description: 'The chain id',
  })
  @IsOptional()
  @Type(() => Number)
  readonly chainId: number = 8543;

  @ApiProperty({
    description: 'The address of the token',
    default: '0x',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  readonly tokenAddress: string;

  @ApiProperty({
    description: 'Token native',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly isNative: boolean = false;

  @ApiProperty({
    description: 'The amount of the token for each wallet',
  })
  @IsNotEmpty()
  @Type(() => Number)
  readonly amount: number;

  @ApiProperty({
    description: 'The addresses of the wallets',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  readonly wallets: string[];

  // @ApiProperty({
  //   description: 'The setting id',
  // })
  // @IsString()
  // @IsNotEmpty()
  // readonly settingId: string;

  @IsString()
  @IsOptional()
  userId?: string;
}

export interface WithdrawQueueItem {
  walletAddress: string;
  // settingId: string;
  userId: string;
  amount: string;
  recipient: string;
  tokenAddress: string;
  chainId: number;
  jobId: string;
  createdAt: string;
  isNative: boolean;
}

export class SendTokenResponseDto {
  @ApiProperty({
    description: 'The transaction hash of the multisend operation',
  })
  transactionHash: string;

  @ApiProperty({
    description: 'The token address; empty if native token was sent',
    example: '0x...',
  })
  tokenAddress: string;

  @ApiProperty({
    description: 'The amount sent to each recipient',
    example: 10,
  })
  amount: number;

  @ApiProperty({ description: 'List of recipient addresses', type: [String] })
  recipients: string[];

  @ApiProperty({ description: 'Transaction status', example: 'success' })
  status: 'success' | 'failed';
}

export class TransferTokenDto {
  userId: string;

  @ApiProperty({
    description: 'The username of the recipient',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  readonly recipient: string;

  @ApiProperty({
    description: 'The address of the recipient',
  })
  @IsString()
  @IsOptional()
  readonly address: string;

  @ApiProperty({
    description: 'The chain id',
  })
  @IsOptional()
  @Type(() => Number)
  readonly chainId: number = 8453;

  @ApiProperty({
    description: 'Token native',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly isNative: boolean;

  @ApiProperty({
    description: 'The address of the token',
    default: '0x',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  readonly tokenAddress: string;

  @ApiProperty({
    description: 'The amount of the token for each wallet',
  })
  @IsNotEmpty()
  @Type(() => Number)
  readonly amount: number;
}

export class TransferNFT721Dto {
  userId: string;

  @ApiProperty({
    description: 'The username of the recipient',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  readonly recipient?: string;

  @ApiProperty({
    description: 'The address of the recipient',
  })
  @IsString()
  @IsOptional()
  readonly address?: string;

  @ApiProperty({
    description: 'The chain id',
  })
  @IsOptional()
  @Type(() => Number)
  readonly chainId: number = 8453;

  @ApiProperty({
    description: 'The address of the NFT contract',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  readonly nftAddress: string;

  @ApiProperty({
    description: 'The token ID of the NFT',
  })
  @IsNotEmpty()
  @Type(() => Number)
  readonly tokenId: number;
}

export class TransferNFT1155Dto {
  userId: string;

  @ApiProperty({
    description: 'The username of the recipient',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  readonly recipient?: string;

  @ApiProperty({
    description: 'The address of the recipient',
  })
  @IsString()
  @IsOptional()
  readonly address?: string;

  @ApiProperty({
    description: 'The chain id',
  })
  @IsOptional()
  @Type(() => Number)
  readonly chainId: number = 8453;

  @ApiProperty({
    description: 'The address of the NFT contract',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  readonly nftAddress: string;

  @ApiProperty({
    description: 'The token ID of the NFT',
  })
  @IsNotEmpty()
  @Type(() => Number)
  readonly tokenId: number;

  @ApiProperty({
    description: 'The amount of tokens to transfer',
  })
  @IsNotEmpty()
  @Type(() => Number)
  readonly amount: number;

  @ApiProperty({
    description: 'Additional data to pass with the transfer',
  })
  @IsString()
  @IsOptional()
  readonly data?: string = '0x';
}

export class NFTTransferResponseDto {
  @ApiProperty({
    description: 'The transaction hash of the NFT transfer',
  })
  transactionHash: string;

  @ApiProperty({
    description: 'The NFT contract address',
  })
  nftAddress: string;

  @ApiProperty({
    description: 'The token ID transferred',
  })
  tokenId: number;

  @ApiProperty({
    description: 'The amount transferred (for ERC1155)',
  })
  amount?: number;

  @ApiProperty({
    description: 'The recipient address',
  })
  recipient: string;

  @ApiProperty({
    description: 'Transaction status',
  })
  status: 'success' | 'failed';

  @ApiProperty({
    description: 'Error message if failed',
  })
  error?: string;
}