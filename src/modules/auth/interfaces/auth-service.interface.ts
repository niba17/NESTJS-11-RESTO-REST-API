export interface IAuthService {
  login(username: string, pass: string): Promise<{ access_token: string }>;
  getProfile(userId: string): Promise<any>;
}
