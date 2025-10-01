import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ErrorLogDocument = HydratedDocument<ErrorLog>;

@Schema({
  timestamps: true,
  collection: 'error-logs',
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class ErrorLog {
  @Prop({ required: true })
  settingId: string;

  @Prop({ required: true })
  error: string;

  @Prop({ required: false })
  details: Record<string, unknown>;

  @Prop({ required: true })
  createdAt: Date;
}

// Create index for the error log
export const ErrorLogSchema = SchemaFactory.createForClass(ErrorLog);
ErrorLogSchema.index({ createdAt: -1, settingId: -1 });
