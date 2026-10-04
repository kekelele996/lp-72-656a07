import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Folder, FolderDocument } from './folder.schema';
import { CreateFolderDto } from './dto/create-folder.dto';

@Injectable()
export class FoldersService {
  constructor(@InjectModel(Folder.name) private folderModel: Model<FolderDocument>) {}

  async create(createFolderDto: CreateFolderDto, userId: string): Promise<FolderDocument> {
    const createdFolder = new this.folderModel({
      ...createFolderDto,
      createdBy: userId,
    });
    return createdFolder.save();
  }

  async findAll(userId: string): Promise<FolderDocument[]> {
    return this.folderModel.find({ createdBy: userId }).sort({ order: 1, createdAt: 1 }).exec();
  }

  async findById(id: string): Promise<FolderDocument> {
    const folder = await this.folderModel.findById(id).exec();
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    return folder;
  }

  async update(id: string, name: string, userId: string): Promise<FolderDocument> {
    const folder = await this.findById(id);
    
    if (folder.createdBy.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to update this folder');
    }

    folder.name = name;
    return folder.save();
  }

  async remove(id: string, userId: string): Promise<FolderDocument> {
    const folder = await this.findById(id);
    
    if (folder.createdBy.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to delete this folder');
    }

    return this.folderModel.findByIdAndDelete(id).exec();
  }

  async getTree(userId: string): Promise<any[]> {
    const folders = await this.findAll(userId);
    return this.buildTree(folders);
  }

  private buildTree(folders: FolderDocument[], parentId: string | null = null): any[] {
    return folders
      .filter(folder => {
        const folderParentId = folder.parentId ? folder.parentId.toString() : null;
        const targetParentId = parentId;
        return folderParentId === targetParentId;
      })
      .map(folder => ({
        id: folder._id,
        name: folder.name,
        parentId: folder.parentId,
        createdBy: folder.createdBy,
        createdAt: folder.createdAt,
        children: this.buildTree(folders, folder._id.toString()),
      }));
  }
}
