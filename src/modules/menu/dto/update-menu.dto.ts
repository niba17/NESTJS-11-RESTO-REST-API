import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMenuDto } from './create-menu.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer'; // Tambahkan TransformFnParams

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    // Kita konversi secara eksplisit agar tipe datanya jelas
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value as unknown; // Cast ke unknown untuk memuaskan ESLint
  })
  @IsBoolean({ message: 'isAvailable must be a boolean value' })
  isAvailable?: boolean;

  @ApiProperty({
    required: false,
    description: 'Send empty string to remove image',
  })
  @IsOptional()
  image?: string;
}
