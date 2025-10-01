import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { WalletType } from '../enums';

export type WalletDocument = Wallet & Document;

@Schema({
  timestamps: true,
  collection: 'wallets',
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Wallet {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  encryptedMnemonic: string;

  @Prop({ required: true })
  encryptedPrivateKey: string;

  @Prop({ required: true })
  mnemonicSalt: string;

  @Prop({ required: true })
  privateKeySalt: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, default: WalletType.MAIN, type: String })
  type: WalletType;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
