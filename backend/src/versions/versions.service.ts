import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as Diff from 'diff';
import { Version, VersionDocument } from './version.schema';
import { DocumentModel } from '../documents/document.schema';

@Injectable()
export class VersionsService {
  constructor(
    @InjectModel(Version.name) private versionModel: Model<VersionDocument>,
  ) {}

  async createVersion(
    documentId: string,
    title: string,
    content: string,
    userId: string,
    changeLog: string = '',
  ): Promise<VersionDocument> {
    const latestVersion = await this.versionModel
      .findOne({ documentId })
      .sort({ versionNumber: -1 })
      .exec();

    const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    const version = new this.versionModel({
      documentId,
      versionNumber,
      title,
      content,
      createdBy: userId,
      changeLog,
    });

    return version.save();
  }

  async findByDocumentId(documentId: string): Promise<VersionDocument[]> {
    return this.versionModel
      .find({ documentId })
      .sort({ versionNumber: -1 })
      .populate('createdBy', 'username displayName')
      .exec();
  }

  async findById(id: string): Promise<VersionDocument> {
    const version = await this.versionModel
      .findById(id)
      .populate('createdBy', 'username displayName')
      .exec();

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    return version;
  }

  async compareVersions(
    versionId1: string,
    versionId2: string,
    userId: string,
  ): Promise<any> {
    const version1 = await this.findById(versionId1);
    const version2 = await this.findById(versionId2);

    if (
      version1.documentId.toString() !== version2.documentId.toString()
    ) {
      throw new ForbiddenException('Versions are from different documents');
    }

    const contentDiff = Diff.diffChars(version1.content, version2.content);

    return {
      version1: {
        id: version1._id,
        versionNumber: version1.versionNumber,
        title: version1.title,
        createdAt: version1.createdAt,
      },
      version2: {
        id: version2._id,
        versionNumber: version2.versionNumber,
        title: version2.title,
        createdAt: version2.createdAt,
      },
      contentDiff,
    };
  }
}
