import { IsString, IsOptional, IsMongoId, IsArray, IsEnum } from 'class-validator';
import { Visibility } from '../document.schema';

export class CreateDocumentDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsMongoId()
  folderId?: string;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
