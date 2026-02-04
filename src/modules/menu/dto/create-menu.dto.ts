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
import { Category } from '../entities/menu.entity'; // Import Enum asli

export class CreateMenuDto {
  @IsNotEmpty({ message: 'Nama menu jangan kosong, Bos!' })
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Harga harus diisi, Bos!' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Harga harus berupa angka ya!' })
  @Min(0, { message: 'Harga minimal 0, Bos!' })
  price: number;

  @IsNotEmpty({ message: 'Kategori wajib dipilih, Bos!' })
  @IsEnum(Category, { message: 'Kategori cuma bisa FOOD atau DRINK' })
  category: Category;

  @IsNotEmpty({ message: 'Stok awal jangan lupa diisi, Bos!' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Stok harus berupa angka!' })
  @Min(0, { message: 'Stok minimal 0' })
  stock: number;
}
