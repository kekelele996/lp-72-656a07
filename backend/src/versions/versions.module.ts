import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VersionsService } from './versions.service';
import { VersionsController } from './versions.controller';
import { Version, VersionSchema } from './version.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Version.name, schema: VersionSchema }]),
  ],
  controllers: [VersionsController],
  providers: [VersionsService],
  exports: [VersionsService],
})
export class VersionsModule {}
