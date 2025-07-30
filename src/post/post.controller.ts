import { Controller, Get, Post as HttpPost, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({ summary: 'Получить все посты с пагинацией' })
  @Get()
  getAll(@Query('page') page = 1, @Query('step') step = 10) {
    return this.postService.findAll(+page, +step);
  }

  @ApiOperation({ summary: 'Создать пост' })
  @HttpPost()
  create(@Body() dto: CreatePostDto) {
    return this.postService.create(dto);
  }

  @ApiOperation({ summary: 'Обновить пост' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postService.update(+id, dto);
  }

  @ApiOperation({ summary: 'Удалить пост' })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.postService.delete(+id);
  }
}