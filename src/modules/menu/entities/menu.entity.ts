import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Category {
  FOOD = 'FOOD',
  DRINK = 'DRINK',
}

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    // Tambahkan ini biar pas ditarik otomatis jadi number
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price: number;

  @Column({
    type: 'enum',
    enum: ['FOOD', 'DRINK'],
    default: 'FOOD',
  })
  category: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ type: 'text', nullable: true })
  image: string | null; // Tambahkan | null di sini

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
