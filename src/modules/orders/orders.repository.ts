import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersRepository {
  private repository: Repository<Order>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.menu'],
    });
  }

  async findAll(): Promise<Order[]> {
    return this.repository.find({
      relations: ['user', 'items', 'items.menu'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.menu'],
      order: { createdAt: 'DESC' },
    });
  }

  // Operasi simpan sederhana
  async save(order: Order): Promise<Order> {
    return this.repository.save(order);
  }
}
