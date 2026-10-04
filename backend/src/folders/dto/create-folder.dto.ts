import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;
}
