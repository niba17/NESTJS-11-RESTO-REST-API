import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { UsersRepository } from './users.repository';
import { IUsersService } from './interfaces/users-service.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit, IUsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    const adminExists = await this.usersRepository.findSuperAdmin();
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.usersRepository.save({
        username: 'superadmin',
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
      });
      console.log('✅ Akun Super Admin berhasil dibuat: superadmin / admin123');
    }
  }

  async create(username: string, pass: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(pass, 10);
    return this.usersRepository.save({
      username,
      password: hashedPassword,
      role: Role.USER,
    });
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan, Bos!`);
    }
    return user;
  }

  async findOneWithPassword(username: string): Promise<User | null> {
    return this.usersRepository.findByUsernameWithPassword(username);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async updateRole(id: string, role: Role): Promise<User> {
    const user = await this.findById(id); // Sudah menghandle throw NotFoundException
    user.role = role;
    return this.usersRepository.save(user);
  }
}
