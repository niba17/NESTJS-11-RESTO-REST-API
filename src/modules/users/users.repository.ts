import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class UsersRepository {
  private repository: Repository<User>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(User);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findSuperAdmin(): Promise<User | null> {
    return this.repository.findOne({ where: { role: Role.SUPER_ADMIN } });
  }

  async save(user: Partial<User>): Promise<User> {
    const newUser = this.repository.create(user);
    return this.repository.save(newUser);
  }

  async findByUsernameWithPassword(username: string): Promise<User | null> {
    return this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .addSelect('user.password') // <--- INI KUNCINYA, BOS! Memaksa ambil kolom yang disembunyikan
      .where('user.username = :username', { username })
      .getOne();
  }
}
