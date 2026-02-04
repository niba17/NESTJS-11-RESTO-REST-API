import { User } from '../entities/user.entity';
import { Role } from '../../../common/enums/role.enum';

export interface IUsersService {
  create(username: string, pass: string): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User>;
  findOneByUsername(username: string): Promise<User | null>;
  findOneWithPassword(username: string): Promise<User | null>;
  // Standarisasi return type di sini, Bos!
  updateRole(id: string, role: Role): Promise<{ message: string; user: User }>;
}
