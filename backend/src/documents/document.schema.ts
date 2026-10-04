import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DocumentDocument = DocumentModel & Document;

export enum Visibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

@Schema({ timestamps: true })
export class DocumentModel {
  @Prop({ required: true, index: true })
  title: string;

  @Prop({ default: '', index: true })
  content: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Folder', default: null })
  folderId: string | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  updatedBy: string | null;

  @Prop({ enum: Visibility, default: Visibility.PRIVATE })
  visibility: Visibility;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User', default: [] })
  sharedWith: string[];

  @Prop({ default: 0 })
  version: number;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentModel);

DocumentSchema.index({ title: 'text', content: 'text' });
