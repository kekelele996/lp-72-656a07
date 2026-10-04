import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentModel, DocumentSchema } from './document.schema';
import { VersionsModule } from '../versions/versions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentModel.name, schema: DocumentSchema },
    ]),
    VersionsModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
