import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type VersionDocument = Version & Document;

@Schema({ timestamps: true })
export class Version {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'DocumentModel', required: true })
  documentId: string;

  @Prop({ required: true })
  versionNumber: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: string;

  @Prop({ default: '' })
  changeLog: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const VersionSchema = SchemaFactory.createForClass(Version);
