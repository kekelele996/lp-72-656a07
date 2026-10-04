import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentModel, DocumentDocument, Visibility } from '../documents/document.schema';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(
    @InjectModel(DocumentModel.name) private documentModel: Model<DocumentDocument>,
  ) {}

  @Get()
  async search(@Query('q') query: string, @Request() req: any) {
    if (!query || query.trim() === '') {
      return { results: [] };
    }

    const results = await this.documentModel
      .find(
        {
          isDeleted: false,
          $text: { $search: query },
          $or: [
            { createdBy: req.user._id },
            { visibility: Visibility.PUBLIC },
            { sharedWith: { $in: [req.user._id] } },
          ],
        },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .populate('createdBy', 'username displayName')
      .limit(50)
      .exec();

    return {
      results: results.map((doc) => ({
        id: doc._id,
        title: doc.title,
        content: doc.content,
        folderId: doc.folderId,
        createdBy: doc.createdBy,
        visibility: doc.visibility,
        tags: doc.tags,
        updatedAt: doc.updatedAt,
        version: doc.version,
        score: (doc as any).score,
      })),
    };
  }
}
