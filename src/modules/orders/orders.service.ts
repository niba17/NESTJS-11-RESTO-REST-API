import { Injectable } from '@nestjs/common';
import { IOrdersService } from './interfaces/orders-service.interface'; // Import Interface
import { OrdersRepository } from './orders.repository'; // Import Repository Baru
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService implements IOrdersService {
  constructor(
    // Kita tidak butuh @InjectRepository atau DataSource lagi di sini!
    // Kita cuma butuh Custom Repository kita.
    private readonly ordersRepository: OrdersRepository,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    // Service cuma delegasi tugas: "Eh Repo, tolong urus transaksi ini"
    return this.ordersRepository.createOrderWithTransaction(
      createOrderDto,
      user,
    );
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.ordersRepository.updateStatus(id, status);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.findAllOrders();
  }

  // Tambahkan ini:
  async findMyOrders(userId: string): Promise<Order[]> {
    return this.ordersRepository.findOrdersByUser(userId);
  }
}
