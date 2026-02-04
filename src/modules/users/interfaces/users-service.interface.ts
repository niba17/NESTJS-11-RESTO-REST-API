import { User } from '../entities/user.entity';
import { Role } from '../../../common/enums/role.enum';

export interface IUsersService {
  create(username: string, pass: string): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findOne(username: string): Promise<User | null>;
  findOneWithPassword(username: string): Promise<User | null>;
  updateRole(id: string, role: Role): Promise<User>;
}
