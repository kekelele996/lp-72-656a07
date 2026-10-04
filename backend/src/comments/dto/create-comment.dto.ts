import { IsString, IsMongoId, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;
}
