import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { UsersRepository } from './users.repository'; // Pakai Repo kita
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(username: string, pass: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(pass, 10);
    return this.usersRepository.save({
      username,
      password: hashedPassword,
      role: Role.USER, // Default pendaftar baru adalah USER biasa
    });
  }

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

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findOneWithPassword(username: string): Promise<User | null> {
    return this.usersRepository.findByUsernameWithPassword(username);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async updateRole(id: string, role: Role): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan, Bos!`);
    }

    user.role = role;
    return this.usersRepository.save(user);
  }
}
