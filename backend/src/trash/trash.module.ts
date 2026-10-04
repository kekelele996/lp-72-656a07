import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrashController } from './trash.controller';
import { DocumentModel, DocumentSchema } from '../documents/document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentModel.name, schema: DocumentSchema },
    ]),
  ],
  controllers: [TrashController],
})
export class TrashModule {}
