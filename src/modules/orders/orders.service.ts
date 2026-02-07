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
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService implements IOrdersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ordersRepository: OrdersRepository,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    user: User,
  ): Promise<{ message: string; order: Order }> {
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
          throw new NotFoundException(`Menu ID ${itemDto.menuId} tidak ada!`);

        if (menu.stock < itemDto.quantity) {
          throw new BadRequestException(
            `Stok ${menu.name} habis, sisa: ${menu.stock}`,
          );
        }

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

      // Kembalikan pesan sukses dan data order
      return {
        message: 'Order berhasil dibuat, silakan tunggu hidangan Anda, Bos!',
        order: savedOrder,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId: string,
  ): Promise<{ message: string; order: Order }> {
    const order = await this.ordersRepository.findById(id);

    // 1. Validasi: Apakah order ada?
    if (!order) throw new NotFoundException(`Order ${id} tidak ditemukan!`);

    // 2. Validasi: Apakah ini milik user tersebut?
    if (order.user.id !== userId)
      throw new BadRequestException(
        'Bos tidak berhak merubah pesanan orang lain!',
      );

    // 3. Validasi: Apakah status masih PENDING?
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Pesanan yang sudah diproses tidak bisa diubah lagi, Bos!',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // A. RESTORE STOK LAMA
      for (const oldItem of order.items) {
        const menu = await queryRunner.manager.findOne(Menu, {
          where: { id: oldItem.menu.id },
          lock: { mode: 'pessimistic_write' },
        });
        if (menu) {
          menu.stock += oldItem.quantity; // Kembalikan stok
          await queryRunner.manager.save(menu);
        }
      }

      // B. HAPUS ITEM LAMA
      await queryRunner.manager.delete(OrderItem, { order: { id: order.id } });

      // C. PROSES ITEM BARU (Mirip logika create)
      let totalAmount = 0;
      const newOrderItems: OrderItem[] = [];

      if (updateOrderDto.items) {
        for (const itemDto of updateOrderDto.items) {
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
              `Stok ${menu.name} tidak cukup untuk perubahan ini, sisa: ${menu.stock}`,
            );
          }

          // Kurangi stok baru
          menu.stock -= itemDto.quantity;
          await queryRunner.manager.save(menu);

          const orderItem = new OrderItem();
          orderItem.menu = menu;
          orderItem.quantity = itemDto.quantity;
          orderItem.price = menu.price;
          newOrderItems.push(orderItem);

          totalAmount += Number(menu.price) * itemDto.quantity;
        }
      }

      // D. UPDATE DATA ORDER
      order.items = newOrderItems;
      order.totalAmount = totalAmount;

      const updatedOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return {
        message:
          'Pesanan berhasil diubah, stok sudah disesuaikan secara otomatis, Bos!',
        order: updatedOrder,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
  ): Promise<{ message: string; order: Order }> {
    const order = await this.findOne(id);
    order.status = status;
    const updatedOrder = await this.ordersRepository.save(order);

    return {
      message: `Status pesanan berhasil diubah menjadi ${status}, Bos!`,
      order: updatedOrder,
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException(`Order ${id} tidak ketemu, Bos!`);
    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.findAll();
  }

  async findMyOrders(userId: string): Promise<Order[]> {
    return this.ordersRepository.findByUser(userId);
  }
}
