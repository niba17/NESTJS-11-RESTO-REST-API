import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Category } from '../entities/menu.entity';

export class GetMenuQueryDto {
  @ApiPropertyOptional({
    description: 'Search menu by name',
    example: 'Burger',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter menus by category',
    enum: Category,
    example: Category.FOOD,
  })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;
}
