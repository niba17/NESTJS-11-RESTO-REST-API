import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Role } from '../../../common/enums/role.enum';
import { Order } from 'src/modules/orders/entities/order.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ select: false }) // 1. TypeORM tidak akan mengambil kolom ini secara default
  @Exclude() // 2. ClassSerializer tidak akan menyertakan ini di JSON response
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
