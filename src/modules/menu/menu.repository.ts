import { Injectable } from '@nestjs/common'; // Fix: Gunakan @nestjs/common
import { DataSource, Repository, ILike, FindManyOptions } from 'typeorm'; // Tambah FindManyOptions
import { Menu } from './entities/menu.entity';

@Injectable()
export class MenuRepository {
  private repository: Repository<Menu>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Menu);
  }

  async findAll(search?: string, category?: string): Promise<Menu[]> {
    // Pakai tipe data resmi dari TypeORM agar ESLint tidak marah
    const queryOptions: FindManyOptions<Menu> = {
      where: {},
      order: { createdAt: 'DESC' },
    };

    if (search) {
      // TypeScript sekarang tahu kalau 'where' adalah bagian dari Menu
      queryOptions.where = {
        ...queryOptions.where,
        name: ILike(`%${search}%`),
      };
    }

    if (category) {
      queryOptions.where = {
        ...queryOptions.where,
        category: category,
      };
    }

    return this.repository.find(queryOptions);
  }

  async findById(id: string): Promise<Menu | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Menu | null> {
    return this.repository.findOne({ where: { name } });
  }

  async save(menu: Partial<Menu>): Promise<Menu> {
    const newMenu = this.repository.create(menu);
    return this.repository.save(newMenu);
  }

  async delete(menu: Menu): Promise<void> {
    await this.repository.remove(menu);
  }
}
