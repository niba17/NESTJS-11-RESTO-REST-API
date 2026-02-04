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

  async updateRole(
    id: string,
    role: Role,
  ): Promise<{ message: string; user: User }> {
    const user = await this.findById(id); // Otomatis throw error jika tidak ada

    user.role = role;
    const updatedUser = await this.usersRepository.save(user);

    return {
      message: `Role user ${user.username} berhasil diubah menjadi ${role}, Bos!`,
      user: updatedUser,
    };
  }
}
