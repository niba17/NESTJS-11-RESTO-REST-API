import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Category } from '../entities/menu.entity';

export class CreateMenuDto {
  @ApiProperty({ example: 'Grilled Squid' })
  @IsNotEmpty({ message: 'Menu name is required' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Delicious grilled squid', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 45000 })
  @IsNotEmpty({ message: 'Price is required' })
  @Type(() => Number) // Menjamin string "45000" jadi number 45000
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Minimum price is 0' })
  price: number;

  @ApiProperty({ enum: Category, example: Category.FOOD })
  @IsNotEmpty({ message: 'Category is required' })
  @IsEnum(Category, { message: 'Category must be either FOOD or DRINK' })
  category: Category;

  @ApiProperty({ example: 25 })
  @IsNotEmpty({ message: 'Initial stock is required' })
  @Type(() => Number) // Menjamin string "25" jadi number 25
  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0, { message: 'Minimum stock is 0' })
  stock: number;
}
