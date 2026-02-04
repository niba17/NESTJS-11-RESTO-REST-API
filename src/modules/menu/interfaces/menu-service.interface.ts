import { Menu } from '../entities/menu.entity';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';

export interface IMenuService {
  create(createMenuDto: CreateMenuDto, imagePath: string): Promise<Menu>;
  findAll(search?: string, category?: string): Promise<Menu[]>;
  findOne(id: string): Promise<Menu>;
  update(
    id: string,
    updateMenuDto: UpdateMenuDto,
    imagePath?: string,
  ): Promise<Menu>;
  remove(id: string): Promise<void>;
}
