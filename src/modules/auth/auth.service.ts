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

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 1. Cek apakah username sudah ada
    const existingUser = await this.usersService.findOne(registerDto.username);
    if (existingUser) {
      throw new ConflictException('Username sudah dipakai orang lain, Bos!');
    }

    // 2. Buat user baru
    const user = await this.usersService.create(
      registerDto.username,
      registerDto.password,
    );

    // 3. Kembalikan data user (tanpa password karena @Exclude sudah aktif)
    return user;
  }

  async login(username: string, pass: string) {
    // 1. Gunakan method baru yang bisa melihat password
    const user = await this.usersService.findOneWithPassword(username);

    // 2. Sekarang user.password sudah ada isinya, bcrypt bisa bekerja
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const payload = {
        username: user.username,
        sub: user.id,
        role: user.role,
      };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }

    throw new UnauthorizedException('Kredensial salah, bos!');
  }

  async getProfile(userId: string) {
    // 4. Langsung kembalikan objek User.
    // ClassSerializerInterceptor akan otomatis membuang password
    // karena ada @Exclude() di Entity User.
    return this.usersService.findById(userId);
  }
}
