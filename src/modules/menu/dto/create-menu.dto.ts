import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer'; // 1. Tambah import ini

export class CreateMenuDto {
  @IsNotEmpty({ message: 'Name field required' })
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Price field required' })
  @Type(() => Number) // 2. Paksa konversi string ke number
  @IsNumber({}, { message: 'Price field must be a number' })
  @Min(0, { message: 'min price is 0' })
  price: number;

  @IsNotEmpty()
  @IsEnum(['FOOD', 'DRINK'])
  category: string;

  @IsNotEmpty({ message: 'Stock field required' })
  @Type(() => Number) // 3. Paksa konversi string ke number
  @IsNumber({}, { message: 'Stok field must be a number' })
  @Min(0, { message: 'Stock value must be at least 0' })
  stock: number;
}
