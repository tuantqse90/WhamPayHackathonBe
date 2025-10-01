import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export enum NFTType {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
}

export enum NFTStatus {
  ACTIVE = 'active',
  TRANSFERRED = 'transferred',
  BURNED = 'burned',
}

export type NFTDocument = NFT & Document;

@Schema({ timestamps: true })
export class NFT {
  @Prop({ required: true })
  @ApiProperty({ description: 'Token ID', example: '1' })
  tokenId: string;

  @Prop({ required: true })
  @ApiProperty({ description: 'Contract address', example: '0x...' })
  contractAddress: string;

  @Prop({ required: true, enum: NFTType })
  @ApiProperty({ description: 'NFT type', enum: NFTType })
  type: NFTType;
  @Prop()
  @ApiProperty({ description: 'NFT name', example: 'NFT #1' })
  name?: string;

  @Prop()
  @ApiProperty({ description: 'NFT description', example: 'NFT' })
  description?: string;

  @Prop()
  @ApiProperty({ description: 'Image URL', example: 'https://...' })
  imageUrl?: string;

  @Prop()
  @ApiProperty({ description: 'Metadata URI', example: 'https://...' })
  metadataUri?: string;

  @Prop({ default: 1 })
  @ApiProperty({ description: 'Amount (for ERC1155)', required: false, example: 1 })
  amount?: number;
  
  @Prop({ type: Object })
  @ApiProperty({ description: 'Additional attributes', required: false })
  attributes?: Record<string, unknown>;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt?: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt?: Date;
}

export const NFTSchema = SchemaFactory.createForClass(NFT);