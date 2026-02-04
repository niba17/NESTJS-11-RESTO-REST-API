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

  async register(registerDto: RegisterDto): Promise<User> {
    // 1. Delegasi pengecekan username ke UsersService (Logic Domain)
    const existingUser = await this.usersService.findOne(registerDto.username);
    if (existingUser) {
      throw new ConflictException('Username sudah dipakai orang lain, Bos!');
    }

    // 2. Delegasi pembuatan user ke UsersService (Logic Domain)
    return this.usersService.create(registerDto.username, registerDto.password);
  }

  async login(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    // 1. Ambil user beserta password-nya (Method khusus Repository)
    const user = await this.usersService.findOneWithPassword(username);

    // 2. Validasi Kredensial
    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(pass, user.password))
    ) {
      throw new UnauthorizedException('Kredensial salah, bos!');
    }

    // 3. Generate Token
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }
}
