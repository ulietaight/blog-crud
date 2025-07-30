import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Новый заголовок' })
  title?: string;

  @ApiPropertyOptional({ example: 'Новое описание' })
  description?: string;
}