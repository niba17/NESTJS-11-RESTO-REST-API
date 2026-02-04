import { IsOptional, IsString } from 'class-validator';

export class GetMenuQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
