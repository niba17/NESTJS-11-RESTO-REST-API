import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Menu } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuRepository } from './menu.repository';
import { IMenuService } from './interfaces/menu-service.interface';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class MenuService implements IMenuService {
  private readonly uploadPath = '/uploads/menu/';

  constructor(private readonly menuRepository: MenuRepository) {}

  async create(
    createMenuDto: CreateMenuDto,
    file?: Express.Multer.File,
  ): Promise<Menu> {
    const existingMenu = await this.menuRepository.findByName(
      createMenuDto.name,
    );
    if (existingMenu) {
      this.handleGhostFile(file); // Hapus file yang terlanjur terupload jika gagal validasi
      throw new ConflictException('Nama menu ini sudah ada, Bos!');
    }

    const imagePath = this.processFilePath(file);

    return this.menuRepository.save({
      ...createMenuDto,
      image: imagePath,
    });
  }

  async update(
    id: string,
    updateMenuDto: UpdateMenuDto,
    file?: Express.Multer.File,
  ): Promise<Menu> {
    const menu = await this.findOne(id);
    const newImagePath = this.processFilePath(file);

    // Jika ada upload gambar baru yang valid
    if (newImagePath) {
      this.removeImageFile(menu.image);
      menu.image = newImagePath;
    }
    // Jika user eksplisit minta hapus gambar (image: null/empty string)
    else if (updateMenuDto.image === null || updateMenuDto.image === '') {
      this.removeImageFile(menu.image);
      menu.image = null;
    }

    const dataToUpdate = { ...updateMenuDto };
    delete dataToUpdate.image;
    Object.assign(menu, dataToUpdate);

    return this.menuRepository.save(menu);
  }

  async findAll(search?: string, category?: string): Promise<Menu[]> {
    return this.menuRepository.findAll(search, category);
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuRepository.findById(id);
    if (!menu) throw new NotFoundException(`Menu ID ${id} tidak ketemu, Bos!`);
    return menu;
  }

  async remove(id: string): Promise<void> {
    const menu = await this.findOne(id);
    this.removeImageFile(menu.image);
    await this.menuRepository.delete(menu);
  }

  // --- PRIVATE HELPERS (Logic Bisnis File) ---

  private processFilePath(file?: Express.Multer.File): string | undefined {
    if (!file) return undefined;

    // Logika Anti-Duplikasi/File Hantu (size 0)
    if (file.size === 0) {
      this.handleGhostFile(file);
      return undefined;
    }

    return `${this.uploadPath}${file.filename}`;
  }

  private handleGhostFile(file?: Express.Multer.File) {
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }

  private removeImageFile(path: string | null) {
    if (path) {
      const fullPath = join(process.cwd(), path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
  }
}
