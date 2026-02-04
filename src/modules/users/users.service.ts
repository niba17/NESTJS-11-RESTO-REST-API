import { Injectable, OnModuleInit } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { UsersRepository } from './users.repository'; // Pakai Repo kita
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
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

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findOneWithPassword(username: string): Promise<User | null> {
    return this.usersRepository.findByUsernameWithPassword(username);
  }
}
