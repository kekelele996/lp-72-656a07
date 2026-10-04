import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto, @Request() req: any) {
    return this.documentsService.create(createDocumentDto, req.user._id);
  }

  @Get()
  findAll(@Query('folderId') folderId: string, @Request() req: any) {
    return this.documentsService.findAll(req.user._id, folderId);
  }

  @Get('trash')
  findDeleted(@Request() req: any) {
    return this.documentsService.findDeleted(req.user._id);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string, @Request() req: any) {
    return this.documentsService.restore(id, req.user._id);
  }

  @Post(':id/rollback/:versionId')
  rollbackToVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Request() req: any,
  ) {
    return this.documentsService.rollbackToVersion(id, versionId, req.user._id);
  }

  @Post(':id/move')
  moveToFolder(
    @Param('id') id: string,
    @Body('folderId') folderId: string,
    @Request() req: any,
  ) {
    return this.documentsService.moveToFolder(
      id,
      folderId === 'null' || !folderId ? null : folderId,
      req.user._id,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.documentsService.findById(id, req.user._id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req: any,
  ) {
    return this.documentsService.update(id, updateDocumentDto, req.user._id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.documentsService.delete(id, req.user._id);
  }
}
