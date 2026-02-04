import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { IAuthService } from './interfaces/auth-service.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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
