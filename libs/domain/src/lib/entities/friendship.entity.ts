import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FriendshipStatus } from '../enums';

export type FriendshipDocument = HydratedDocument<Friendship>;

@Schema({
  timestamps: true,
  collection: 'friendships',
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Friendship {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requesterId: Types.ObjectId;

  @Prop({ type: String, required: true })
  requesterUsername: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  responserId: Types.ObjectId;

  @Prop({ type: String, required: true })
  responserUsername: string;

  @Prop({ 
    type: String,
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDING 
  })
  status: FriendshipStatus;

  @Prop({ type: Date, required: false })
  acceptedAt?: Date;

  @Prop({ type: Date, required: false })
  rejectedAt?: Date;

  @Prop({ type: Date, required: false })
  blockedAt?: Date;

  @Prop({ type: String, required: false })
  message?: string;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);