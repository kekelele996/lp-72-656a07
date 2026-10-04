import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentModel, DocumentDocument, Visibility } from '../documents/document.schema';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(
    @InjectModel(DocumentModel.name) private documentModel: Model<DocumentDocument>,
  ) {}

  @Get()
  async getAllTags(@Request() req: any) {
    const documents = await this.documentModel
      .find({
        isDeleted: false,
        $or: [
          { createdBy: req.user._id },
          { visibility: Visibility.PUBLIC },
          { sharedWith: { $in: [req.user._id] } },
        ],
        tags: { $ne: [] },
      })
      .select('tags')
      .exec();

    const allTags = new Set<string>();
    documents.forEach((doc) => {
      doc.tags.forEach((tag) => allTags.add(tag));
    });

    return { tags: Array.from(allTags) };
  }

  @Get('documents')
  async getDocumentsByTag(@Query('tag') tag: string, @Request() req: any) {
    if (!tag) {
      return { documents: [] };
    }

    const documents = await this.documentModel
      .find({
        isDeleted: false,
        tags: { $in: [tag] },
        $or: [
          { createdBy: req.user._id },
          { visibility: Visibility.PUBLIC },
          { sharedWith: { $in: [req.user._id] } },
        ],
      })
      .populate('createdBy', 'username displayName')
      .sort({ updatedAt: -1 })
      .exec();

    return { documents };
  }
}
