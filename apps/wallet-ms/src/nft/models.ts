import { ApiProperty } from "@nestjs/swagger";
import { NFTType } from "@pay-wallet/domain";
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateNFTDto {
  @ApiProperty({ description: 'Token ID', example: '1' })
  @IsString()
  tokenId: string;

  @ApiProperty({ description: 'Contract address', example: '0x...' })
  @IsString()
  contractAddress: string;

  @ApiProperty({ description: 'NFT type', enum: NFTType })
  @IsEnum(NFTType)
  type: NFTType;

  @ApiProperty({ description: 'Owner address', example: '0x...' })
  @IsString()
  owner: string;

  @ApiProperty({ description: 'NFT name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'NFT description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Image URL', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Metadata URI', required: false })
  @IsOptional()
  @IsString()
  metadataUri?: string;

  @ApiProperty({ description: 'Amount (for ERC1155)', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number = 1;

  @ApiProperty({ description: 'Additional attributes', required: false })
  @IsOptional()
  attributes?: Record<string, unknown>;
}


export class ListNFTDto {
  @ApiProperty({ description: 'Contract address', required: false, example: '0x...' })
  @IsOptional()
  @IsString()
  contractAddress?: string;

  @ApiProperty({ description: 'NFT type', enum: NFTType, required: false })
  @IsOptional()
  @IsEnum(NFTType)
  type?: NFTType;

  @ApiProperty({ description: 'Search term for name or description', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Page number', required: false, default: 1, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  size?: number = 20;
}