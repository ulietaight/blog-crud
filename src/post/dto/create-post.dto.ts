import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Заголовок поста' })
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Текст описания' })
  @IsNotEmpty()
  description!: string;
}