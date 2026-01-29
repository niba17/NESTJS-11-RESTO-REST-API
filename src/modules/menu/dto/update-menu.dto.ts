import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuDto } from './create-menu.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional() // Tambahkan ini agar bisa menerima instruksi hapus gambar
  image?: string;
}
