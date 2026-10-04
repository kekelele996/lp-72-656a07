import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TagsController } from './tags.controller';
import { DocumentModel, DocumentSchema } from '../documents/document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentModel.name, schema: DocumentSchema },
    ]),
  ],
  controllers: [TagsController],
})
export class TagsModule {}
