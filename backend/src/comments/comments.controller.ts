import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('document/:documentId')
  create(
    @Param('documentId') documentId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.commentsService.create(documentId, createCommentDto, req.user._id);
  }

  @Get('document/:documentId')
  findByDocumentId(@Param('documentId') documentId: string, @Request() req: any) {
    return this.commentsService.findByDocumentId(documentId, req.user._id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.commentsService.remove(id, req.user._id);
  }
}
