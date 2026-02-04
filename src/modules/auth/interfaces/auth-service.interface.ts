import { RegisterDto } from '../dto/register.dto';

export interface IAuthService {
  login(username: string, pass: string): Promise<{ access_token: string }>;
  register(registerDto: RegisterDto): Promise<any>; // Tambahkan ini
  getProfile(userId: string): Promise<any>;
}
