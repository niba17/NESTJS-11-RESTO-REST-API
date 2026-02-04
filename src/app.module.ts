import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { User } from './modules/users/entities/user.entity';
import { Menu } from './modules/menu/entities/menu.entity';
import { AuthModule } from './modules/auth/auth.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'password',
      database: process.env.DB_NAME || 'resto_db',

      // --- PERBAIKAN DI SINI ---
      // Ganti [User, Menu] menjadi pola auto-scan agar semua .entity.ts terbaca
      entities: [__dirname + '/**/*.entity{.ts,.js}'],

      synchronize: true, // Pastikan ini true agar tabel otomatis dibuat di pgAdmin
    }),
    AuthModule,
    UsersModule,
    MenuModule,
    OrdersModule,
  ],
})
export class AppModule {}
