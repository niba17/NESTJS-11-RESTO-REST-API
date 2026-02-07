import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'bos_muda',
    description: 'Username for the new account',
    minLength: 4,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Username is required!' })
  @IsString()
  @MinLength(4, { message: 'Username min character is 4' })
  @MaxLength(20)
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password for the new account (min 6 characters)',
    minLength: 6,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(6, { message: 'Password min character is 6' })
  @MaxLength(20)
  password: string;
}
