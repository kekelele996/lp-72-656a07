import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FolderDocument = Folder & Document;

@Schema({ timestamps: true })
export class Folder {
  @Prop({ required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Folder', default: null })
  parentId: string | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: string;

  @Prop({ default: 0 })
  order: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const FolderSchema = SchemaFactory.createForClass(Folder);
