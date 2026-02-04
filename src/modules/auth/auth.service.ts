import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { IAuthService } from './interfaces/auth-service.interface';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string; user: User }> {
    const existingUser = await this.usersService.findOneByUsername(
      registerDto.username,
    );
    if (existingUser) {
      throw new ConflictException('Username sudah dipakai orang lain, Bos!');
    }

    const user = await this.usersService.create(
      registerDto.username,
      registerDto.password,
    );
    return {
      message: 'Registrasi berhasil, selamat datang di tim, Bos!',
      user,
    };
  }

  async login(
    username: string,
    pass: string,
  ): Promise<{ message: string; access_token: string }> {
    const user = await this.usersService.findOneWithPassword(username);

    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(pass, user.password))
    ) {
      throw new UnauthorizedException('Kredensial salah, bos!');
    }

    const payload = { username: user.username, sub: user.id, role: user.role };

    return {
      message: 'Login sukses, selamat bekerja Bos!',
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: string): Promise<User> {
    return this.usersService.findById(userId); // Logika NotFound sudah ada di UsersService.findById
  }
}
