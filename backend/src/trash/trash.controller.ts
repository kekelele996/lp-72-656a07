import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentModel, DocumentDocument } from '../documents/document.schema';

@Controller('trash')
@UseGuards(JwtAuthGuard)
export class TrashController {
  constructor(
    @InjectModel(DocumentModel.name) private documentModel: Model<DocumentDocument>,
  ) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.documentModel
      .find({
        isDeleted: true,
        createdBy: req.user._id,
      })
      .populate('createdBy', 'username displayName')
      .sort({ deletedAt: -1 })
      .exec();
  }
}
