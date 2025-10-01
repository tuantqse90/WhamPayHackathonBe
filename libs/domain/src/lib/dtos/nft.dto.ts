import { ApiProperty } from '@nestjs/swagger';
import { NFTType } from '../entities/nft.entity';

export class NFTDto {
  @ApiProperty({ description: 'NFT ID' })
  id: string;

  @ApiProperty({ description: 'Token ID', example: '1' })
  tokenId: string;

  @ApiProperty({ description: 'Contract address', example: '0x...' })
  contractAddress: string;

  @ApiProperty({ description: 'NFT type', enum: NFTType })
  type: NFTType;

  @ApiProperty({ description: 'NFT name', required: false })
  name?: string;

  @ApiProperty({ description: 'NFT description', required: false })
  description?: string;

  @ApiProperty({ description: 'Image URL', required: false })
  imageUrl?: string;

  @ApiProperty({ description: 'Metadata URI', required: false })
  metadataUri?: string;

  @ApiProperty({ description: 'Amount (for ERC1155)', required: false })
  amount?: number;

  @ApiProperty({ description: 'Additional attributes', required: false })
  attributes?: Record<string, unknown>;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}
