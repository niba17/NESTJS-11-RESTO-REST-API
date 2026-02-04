import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IOrdersService } from './interfaces/orders-service.interface';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Menu } from '../menu/entities/menu.entity';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService implements IOrdersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ordersRepository: OrdersRepository,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of createOrderDto.items) {
        // Logika Bisnis: Cek Stok & Lock Row
        const menu = await queryRunner.manager.findOne(Menu, {
          where: { id: itemDto.menuId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!menu)
          throw new NotFoundException(`Menu ID ${itemDto.menuId} tidak ada!`);

        if (menu.stock < itemDto.quantity) {
          throw new BadRequestException(
            `Stok ${menu.name} habis, sisa: ${menu.stock}`,
          );
        }

        // Logika Bisnis: Kurangi Stok
        menu.stock -= itemDto.quantity;
        await queryRunner.manager.save(menu);

        // Buat detail item
        const orderItem = new OrderItem();
        orderItem.menu = menu;
        orderItem.quantity = itemDto.quantity;
        orderItem.price = menu.price;
        orderItems.push(orderItem);

        totalAmount += Number(menu.price) * itemDto.quantity;
      }

      const order = new Order();
      order.user = user;
      order.items = orderItems;
      order.totalAmount = totalAmount;
      order.status = OrderStatus.PENDING;

      const savedOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException(`Order ${id} tidak ketemu, Bos!`);
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.ordersRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.findAll();
  }

  async findMyOrders(userId: string): Promise<Order[]> {
    return this.ordersRepository.findByUser(userId);
  }
}
