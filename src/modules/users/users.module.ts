import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository'; // Import ini

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UsersRepository], // Tambah UsersRepository
  exports: [UsersService, UsersRepository], // Export keduanya
})
export class UsersModule {}
