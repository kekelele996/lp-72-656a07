import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  create(@Body() createFolderDto: CreateFolderDto, @Request() req: any) {
    return this.foldersService.create(createFolderDto, req.user._id);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.foldersService.findAll(req.user._id);
  }

  @Get('tree')
  getTree(@Request() req: any) {
    return this.foldersService.getTree(req.user._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foldersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('name') name: string, @Request() req: any) {
    return this.foldersService.update(id, name, req.user._id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.foldersService.remove(id, req.user._id);
  }
}
