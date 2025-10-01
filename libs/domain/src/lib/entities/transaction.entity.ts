import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TransactionStatus, TransactionType } from '../enums';

export type TransactionDocument = Transaction & Document;

@Schema({
  timestamps: true,
  collection: 'transactions',
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Transaction {
  // @Prop({ required: true })
  // userId: string;

  // @Prop({ required: true })
  // chainId: number;

  @Prop({ required: false, default: '' })
  txHash: string;

  @Prop({ required: true })
  tokenAddress: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  fromUser: string;

  @Prop({ required: true })
  toUser: string;

  @Prop({ required: true })
  fromAddress: string;

  @Prop({ required: true })
  toAddress: string;

  @Prop({ required: true, enum: TransactionType, type: String })
  type: TransactionType;

  @Prop({
    required: false,
    enum: TransactionStatus,
    type: String,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.index({ createdAt: -1, userId: -1, from: -1, to: -1 });
