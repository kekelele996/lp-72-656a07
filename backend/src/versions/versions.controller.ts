import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VersionsService } from './versions.service';

@Controller('versions')
@UseGuards(JwtAuthGuard)
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get('document/:documentId')
  findByDocumentId(@Param('documentId') documentId: string) {
    return this.versionsService.findByDocumentId(documentId);
  }

  @Get('compare')
  compareVersions(
    @Query('version1') version1: string,
    @Query('version2') version2: string,
    @Request() req: any,
  ) {
    return this.versionsService.compareVersions(version1, version2, req.user._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.versionsService.findById(id);
  }
}
