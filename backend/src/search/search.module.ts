import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { DocumentModel, DocumentSchema } from '../documents/document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentModel.name, schema: DocumentSchema },
    ]),
  ],
  controllers: [SearchController],
})
export class SearchModule {}
