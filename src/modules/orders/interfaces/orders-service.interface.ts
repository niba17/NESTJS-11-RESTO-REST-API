import { User } from 'src/modules/users/entities/user.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderStatus } from '../enums/order-status.enum'; // Import ini
import { Order } from '../entities/order.entity';

export interface IOrdersService {
  create(createOrderDto: CreateOrderDto, user: User): Promise<Order>;
  findAll(): Promise<Order[]>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>; // Tambah baris ini
}
