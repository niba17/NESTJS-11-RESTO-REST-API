import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger'; // Tambah ini
import { Role } from '../../../common/enums/role.enum';
import { Order } from 'src/modules/orders/entities/order.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @ApiProperty({ example: 'uuid-string-123' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'bos_muda' })
  @Column({ unique: true })
  username: string;

  @Exclude() // Tetap tersembunyi dari Swagger dan Response
  @Column({ select: false })
  password: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  // Orders tidak kita beri ApiProperty agar tidak looping di dokumentasi
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
