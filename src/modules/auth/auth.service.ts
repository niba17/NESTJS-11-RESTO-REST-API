import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; // Pastikan path ini benar
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, pass: string) {
    const user = await this.usersService.findOne(username);

    // Gunakan optional chaining atau pengecekan eksplisit
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
    const user = await this.usersService.findOne(userId);
    if (user) {
      const result = { ...user };
      // @ts-expect-error: password might be private but we need to remove it
      delete result.password;
      return result;
    }
    return null;
  }
}
