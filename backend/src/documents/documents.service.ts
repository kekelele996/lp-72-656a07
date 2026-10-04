import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentModel, DocumentDocument, Visibility } from './document.schema';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { VersionsService } from '../versions/versions.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentModel.name) private documentModel: Model<DocumentDocument>,
    private versionsService: VersionsService,
  ) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    userId: string,
  ): Promise<DocumentDocument> {
    const createdDocument = new this.documentModel({
      ...createDocumentDto,
      createdBy: userId,
      updatedBy: userId,
      version: 1,
    });

    const saved = await createdDocument.save();

    await this.versionsService.createVersion(
      saved._id.toString(),
      saved.title,
      saved.content,
      userId,
      'Initial version',
    );

    return saved;
  }

  async findAll(userId: string, folderId: string | null = null): Promise<DocumentDocument[]> {
    const query: any = {
      isDeleted: false,
      $or: [
        { createdBy: userId },
        { visibility: Visibility.PUBLIC },
        { sharedWith: { $in: [userId] } },
      ],
    };

    if (folderId === 'null' || folderId === null) {
      query.folderId = null;
    } else {
      query.folderId = folderId;
    }

    return this.documentModel
      .find(query)
      .populate('createdBy', 'username displayName')
      .populate('updatedBy', 'username displayName')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<DocumentDocument> {
    const document = await this.documentModel
      .findById(id)
      .populate('createdBy', 'username displayName')
      .populate('updatedBy', 'username displayName')
      .populate('sharedWith', 'username displayName')
      .exec();

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.isDeleted) {
      throw new NotFoundException('Document has been deleted');
    }

    if (
      document.visibility !== Visibility.PUBLIC &&
      document.createdBy.toString() !== userId &&
      !document.sharedWith.some((u: any) => u._id.toString() === userId)
    ) {
      throw new ForbiddenException('You are not allowed to access this document');
    }

    return document;
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    userId: string,
  ): Promise<DocumentDocument> {
    const document = await this.findById(id, userId);

    if (
      document.createdBy.toString() !== userId
    ) {
      throw new ForbiddenException('You are not allowed to update this document');
    }

    const hasContentChange =
      updateDocumentDto.content !== undefined &&
      updateDocumentDto.content !== document.content;
    const hasTitleChange =
      updateDocumentDto.title !== undefined &&
      updateDocumentDto.title !== document.title;

    if (hasContentChange || hasTitleChange) {
      const newVersion = document.version + 1;

      await this.versionsService.createVersion(
        id,
        updateDocumentDto.title || document.title,
        updateDocumentDto.content || document.content,
        userId,
        hasContentChange ? 'Content updated' : 'Title updated',
      );

      document.version = newVersion;
    }

    if (updateDocumentDto.title !== undefined) {
      document.title = updateDocumentDto.title;
    }
    if (updateDocumentDto.content !== undefined) {
      document.content = updateDocumentDto.content;
    }
    if (updateDocumentDto.folderId !== undefined) {
      document.folderId = updateDocumentDto.folderId;
    }
    if (updateDocumentDto.visibility !== undefined) {
      document.visibility = updateDocumentDto.visibility;
    }
    if (updateDocumentDto.tags !== undefined) {
      document.tags = updateDocumentDto.tags;
    }
    if (updateDocumentDto.sharedWith !== undefined) {
      document.sharedWith = updateDocumentDto.sharedWith;
    }

    document.updatedBy = userId;

    return document.save();
  }

  async delete(id: string, userId: string): Promise<DocumentDocument> {
    const document = await this.findById(id, userId);

    if (
      document.createdBy.toString() !== userId
    ) {
      throw new ForbiddenException('You are not allowed to delete this document');
    }

    document.isDeleted = true;
    document.deletedAt = new Date();

    return document.save();
  }

  async restore(id: string, userId: string): Promise<DocumentDocument> {
    const document = await this.documentModel.findById(id).exec();

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (
      document.createdBy.toString() !== userId
    ) {
      throw new ForbiddenException('You are not allowed to restore this document');
    }

    document.isDeleted = false;
    document.deletedAt = null;

    return document.save();
  }

  async findDeleted(userId: string): Promise<DocumentDocument[]> {
    return this.documentModel
      .find({
        isDeleted: true,
        createdBy: userId,
      })
      .populate('createdBy', 'username displayName')
      .sort({ deletedAt: -1 })
      .exec();
  }

  async rollbackToVersion(
    documentId: string,
    versionId: string,
    userId: string,
  ): Promise<DocumentDocument> {
    const document = await this.findById(documentId, userId);

    if (
      document.createdBy.toString() !== userId
    ) {
      throw new ForbiddenException('You are not allowed to rollback this document');
    }

    const version = await this.versionsService.findById(versionId);

    if (version.documentId.toString() !== documentId) {
      throw new ForbiddenException('Version does not belong to this document');
    }

    const newVersion = document.version + 1;

    await this.versionsService.createVersion(
      documentId,
      version.title,
      version.content,
      userId,
      `Rolled back to version ${version.versionNumber}`,
    );

    document.title = version.title;
    document.content = version.content;
    document.version = newVersion;
    document.updatedBy = userId;

    return document.save();
  }

  async moveToFolder(
    id: string,
    folderId: string | null,
    userId: string,
  ): Promise<DocumentDocument> {
    return this.update(
      id, { folderId }, userId);
  }
}
