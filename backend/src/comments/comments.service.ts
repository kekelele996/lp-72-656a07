import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comment.schema';
import { DocumentModel, DocumentDocument, Visibility } from '../documents/document.schema';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(DocumentModel.name) private documentModel: Model<DocumentDocument>,
  ) {}

  async create(
    documentId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<CommentDocument> {
    const document = await this.documentModel.findById(documentId).exec();
    if (!document || document.isDeleted) {
      throw new NotFoundException('Document not found');
    }

    if (
      document.visibility !== Visibility.PUBLIC &&
      document.createdBy.toString() !== userId
    ) {
      throw new ForbiddenException('You are not allowed to comment on this document');
    }

    const comment = new this.commentModel({
      documentId,
      createdBy: userId,
      content: createCommentDto.content,
      parentId: createCommentDto.parentId || null,
    });

    return comment.save();
  }

  async findByDocumentId(documentId: string, userId: string): Promise<CommentDocument[]> {
    const document = await this.documentModel.findById(documentId).exec();
    if (!document || document.isDeleted) {
      throw new NotFoundException('Document not found');
    }

    if (
      document.visibility !== Visibility.PUBLIC &&
      document.createdBy.toString() !== userId
    ) {
      throw new ForbiddenException('You are not allowed to view comments on this document');
    }

    return this.commentModel
      .find({ documentId })
      .populate('createdBy', 'username displayName')
      .sort({ createdAt: 1 })
      .exec();
  }

  async remove(id: string, userId: string): Promise<CommentDocument> {
    const comment = await this.commentModel.findById(id).exec();
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.createdBy.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to delete this comment');
    }

    return this.commentModel.findByIdAndDelete(id).exec();
  }
}
