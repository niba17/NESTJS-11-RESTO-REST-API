import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { IUserPayload } from 'src/common/interfaces/user-payload.interface';
import { User } from '../users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    // Kita bisa buat schema manual di sini agar Swagger lebih informatif
    schema: {
      example: {
        message: 'Registrasi success, welcome to the team',
        user: { id: 'uuid', username: 'bos_muda', role: 'USER' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation Error Response',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        error: 'Bad Request',
        errors: [
          {
            field: 'username',
            errors: ['Username is required!', 'Username min character is 4'],
          },
          {
            field: 'password',
            errors: ['Password is required!', 'Password min character is 6'],
          },
        ],
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Login success, returns token',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get currently logged-in user profile' }) // Bahasa Inggris sesuai request, Bos!
  @ApiResponse({
    status: 200,
    description: 'Profile data retrieved successfully',
    type: User,
  })
  async getProfile(@GetUser() user: IUserPayload) {
    return this.authService.getProfile(user.userId);
  }
}
