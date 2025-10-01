import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../enums';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  collection: 'users',
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.refreshToken;
      return ret;
    },
  },
})
export class User {
  @Prop({ type: String, required: false })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, required: false, unique: true })
  email: string;

  @Prop({ type: String, required: false })
  password: string;

  @Prop({ type: String, required: false })
  twitterId?: string;

  @Prop({ type: String, required: false })
  provider?: string;

  @Prop({ type: String, default: 'active' })
  status: string;

  @Prop({ default: UserRole.USER, enum: UserRole, type: String })
  role: UserRole;

  @Prop({ type: String, required: false })
  refreshToken?: string;

  @Prop({ type: Date, required: false })
  refreshTokenExpiresAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
