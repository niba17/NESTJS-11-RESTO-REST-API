import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Username harus diisi, Bos!' })
  @IsString()
  @MinLength(4, { message: 'Username minimal 4 karakter, Bos!' })
  @MaxLength(20)
  username: string;

  @IsNotEmpty({ message: 'Password jangan dikosongkan, Bos!' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter demi keamanan, Bos!' })
  @MaxLength(20)
  password: string;
}
