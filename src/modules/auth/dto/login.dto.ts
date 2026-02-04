import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Username jangan kosong, Bos!' })
  @IsString()
  username!: string;

  @IsNotEmpty({ message: 'Password wajib diisi, Bos!' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter, Bos!' })
  password!: string;
}
