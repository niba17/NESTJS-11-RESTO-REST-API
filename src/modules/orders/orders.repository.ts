import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Menu } from '../menu/entities/menu.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersRepository {
  constructor(private readonly dataSource: DataSource) {}

  async createOrderWithTransaction(
    createOrderDto: CreateOrderDto,
    user: User,
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const item of createOrderDto.items) {
        const menu = await queryRunner.manager.findOne(Menu, {
          where: { id: item.menuId },
        });

        if (!menu) {
          throw new NotFoundException(
            `Menu dengan ID ${item.menuId} tidak ditemukan, Bos!`,
          );
        }

        if (menu.stock < item.quantity) {
          throw new BadRequestException(
            `Stok ${menu.name} tidak cukup. Sisa: ${menu.stock}`,
          );
        }

        // Logic kurangi stok & snapshot harga
        menu.stock -= item.quantity;
        await queryRunner.manager.save(menu);

        const orderItem = new OrderItem();
        orderItem.menu = menu;
        orderItem.quantity = item.quantity;
        orderItem.price = menu.price;

        totalAmount += menu.price * item.quantity;
        orderItems.push(orderItem);
      }

      const order = new Order();
      order.user = user;
      order.items = orderItems;
      order.totalAmount = totalAmount;

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

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.dataSource
      .getRepository(Order)
      .findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order dengan ID ${id} tidak ditemukan.`);
    }

    order.status = status;
    return this.dataSource.getRepository(Order).save(order);
  }

  // Method bantuan untuk query biasa
  async findAllOrders(): Promise<Order[]> {
    // Kita pakai manager agar konsisten, atau bisa inject Repository<Order> standar juga
    return this.dataSource.getRepository(Order).find({
      relations: ['items', 'items.menu', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOrdersByUser(userId: string): Promise<Order[]> {
    return this.dataSource.getRepository(Order).find({
      where: { user: { id: userId } }, // Filter berdasarkan ID User
      relations: ['items', 'items.menu'],
      order: { createdAt: 'DESC' },
    });
  }
}
