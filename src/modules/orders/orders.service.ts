import { Injectable, NotFoundException } from '@nestjs/common';
import { IOrdersService } from './interfaces/orders-service.interface'; // Import Interface
import { OrdersRepository } from './orders.repository'; // Import Repository Baru
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService implements IOrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    return this.ordersRepository.createOrderWithTransaction(
      createOrderDto,
      user,
    );
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findById(id);
    if (!order)
      throw new NotFoundException(`Pesanan dengan ID ${id} tidak ketemu, Bos!`);
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.ordersRepository.updateStatus(id, status);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.findAllOrders();
  }

  async findMyOrders(userId: string): Promise<Order[]> {
    return this.ordersRepository.findOrdersByUser(userId);
  }
}
