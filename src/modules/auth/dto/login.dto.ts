import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'bos_admin',
    description: 'Username for login',
  })
  @IsNotEmpty({ message: 'Username is required!' })
  @IsString()
  username!: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password for login',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(6, { message: 'Password min character is 6' })
  password!: string;
}
