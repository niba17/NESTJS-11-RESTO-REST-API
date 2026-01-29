import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Fungsi ini otomatis jalan saat aplikasi start
  async onModuleInit() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    const adminExists = await this.usersRepository.findOne({
      where: { role: Role.SUPER_ADMIN },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = this.usersRepository.create({
        username: 'superadmin',
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
      });
      await this.usersRepository.save(admin);
      console.log('✅ Akun Super Admin berhasil dibuat: superadmin / admin123');
    }
  }

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }
}
