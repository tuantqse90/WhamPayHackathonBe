import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TokenTransfer extends Document {
  @Prop({ required: true })
  tokenAddress: string;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  amount: string;

  @Prop({ required: true })
  timestamp: number;

  @Prop({ required: true })
  blockNumber: number;

  @Prop({ required: true })
  transactionHash: string;
}

export const TokenTransferSchema = SchemaFactory.createForClass(TokenTransfer);

// Create a compound index for faster lookups and to ensure uniqueness of events
TokenTransferSchema.index(
  { transactionHash: 1, tokenAddress: 1, from: 1, to: 1 },
  { unique: true }
);
