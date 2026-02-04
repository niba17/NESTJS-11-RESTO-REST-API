import { Menu } from '../entities/menu.entity';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';

export interface IMenuService {
  create(
    createMenuDto: CreateMenuDto,
    file?: Express.Multer.File,
  ): Promise<Menu>;
  findAll(search?: string, category?: string): Promise<Menu[]>;
  findOne(id: string): Promise<Menu>;
  update(
    id: string,
    updateMenuDto: UpdateMenuDto,
    file?: Express.Multer.File,
  ): Promise<Menu>;
  remove(id: string): Promise<{ message: string }>;
}
