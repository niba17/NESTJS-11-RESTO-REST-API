import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm'; // Hapus 'Repository' karena tidak dipakai
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Menu } from '../menu/entities/menu.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from './enums/order-status.enum'; // FIX: Sesuaikan path (pakai ./ bukan ../)

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

      for (const itemDto of createOrderDto.items) {
        const menu = await queryRunner.manager.findOne(Menu, {
          where: { id: itemDto.menuId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!menu)
          throw new NotFoundException(
            `Menu ${itemDto.menuId} tidak ditemukan!`,
          );
        if (menu.stock < itemDto.quantity) {
          throw new BadRequestException(
            `Stok ${menu.name} tidak cukup (Sisa: ${menu.stock})`,
          );
        }

        // Update Stok
        menu.stock -= itemDto.quantity;
        await queryRunner.manager.save(menu);

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
      // Rollback jika ada yang gagal
      await queryRunner.rollbackTransaction();
      throw err; // Lempar kembali error aslinya
    } finally {
      // Pastikan koneksi dilepas kembali ke pool
      await queryRunner.release();
    }
  }

  async findAllOrders(): Promise<Order[]> {
    return this.dataSource.getRepository(Order).find({
      relations: ['user', 'items', 'items.menu'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOrdersByUser(userId: string): Promise<Order[]> {
    return this.dataSource.getRepository(Order).find({
      where: { user: { id: userId } },
      relations: ['items', 'items.menu'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const repo = this.dataSource.getRepository(Order);
    const order = await repo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan!');

    order.status = status;
    return repo.save(order);
  }
}
