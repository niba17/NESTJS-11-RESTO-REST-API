import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Menu } from '../../menu/entities/menu.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relasi ke Order (Induk)
  // onDelete: 'CASCADE' -> Kalau Order dihapus, item ini ikut hilang
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // Relasi ke Menu (Barang)
  @ManyToOne(() => Menu)
  @JoinColumn({ name: 'menu_id' })
  menu: Menu;

  @Column()
  quantity: number;

  // PENTING: Kita simpan harga SAAT INI.
  // Jadi kalau besok harga menu naik, data history order ini harganya tetap (tidak berubah).
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
