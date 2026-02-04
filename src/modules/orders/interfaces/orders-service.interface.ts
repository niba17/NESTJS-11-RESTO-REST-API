import { User } from 'src/modules/users/entities/user.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderStatus } from '../enums/order-status.enum';
import { Order } from '../entities/order.entity';

export interface IOrdersService {
  create(
    createOrderDto: CreateOrderDto,
    user: User,
  ): Promise<{ message: string; order: Order }>;
  updateStatus(
    id: string,
    status: OrderStatus,
  ): Promise<{ message: string; order: Order }>;
  findAll(): Promise<Order[]>;
  findOne(id: string): Promise<Order>;
  findMyOrders(userId: string): Promise<Order[]>;
}
