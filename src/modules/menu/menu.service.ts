import * as fs from 'fs';
import { join } from 'path';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Menu } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuRepository } from './menu.repository'; // Import ini

@Injectable()
export class MenuService {
  constructor(private readonly menuRepository: MenuRepository) {} // Inject Repo kita

  async create(createMenuDto: CreateMenuDto, imagePath: string): Promise<Menu> {
    const existingMenu = await this.menuRepository.findByName(
      createMenuDto.name,
    );
    if (existingMenu) throw new ConflictException('Name has been used');

    return this.menuRepository.save({
      ...createMenuDto,
      image: imagePath,
    });
  }

  async findAll(search?: string, category?: string): Promise<Menu[]> {
    return this.menuRepository.findAll(search, category);
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuRepository.findById(id);
    if (!menu) throw new NotFoundException(`Menu not found`);
    return menu;
  }

  async update(
    id: string,
    updateMenuDto: UpdateMenuDto,
    imagePath?: string,
  ): Promise<Menu> {
    const menu = await this.findOne(id);

    if (imagePath) {
      this.removeImageFile(menu.image);
      menu.image = imagePath;
    } else if (updateMenuDto.image === null || updateMenuDto.image === '') {
      this.removeImageFile(menu.image);
      menu.image = null;
    }

    const dataToUpdate = { ...updateMenuDto };
    delete dataToUpdate.image;
    Object.assign(menu, dataToUpdate);

    return this.menuRepository.save(menu);
  }

  async remove(id: string): Promise<void> {
    const menu = await this.findOne(id);
    this.removeImageFile(menu.image);
    await this.menuRepository.delete(menu);
  }

  // Helper private agar kode lebih bersih
  private removeImageFile(path: string | null) {
    if (path) {
      const fullPath = join(process.cwd(), path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
  }
}
