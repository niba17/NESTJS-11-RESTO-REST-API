import { User } from '../../users/entities/user.entity';
import { RegisterDto } from '../dto/register.dto';

export interface IAuthService {
  register(registerDto: RegisterDto): Promise<{ message: string; user: User }>;
  login(
    username: string,
    pass: string,
  ): Promise<{ message: string; access_token: string }>;
  getProfile(userId: string): Promise<User>;
}
