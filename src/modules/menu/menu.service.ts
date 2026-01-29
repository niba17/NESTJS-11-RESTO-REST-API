import * as fs from 'fs';
import { join } from 'path';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async create(createMenuDto: CreateMenuDto, imagePath: string): Promise<Menu> {
    // 1. Cek duplikasi nama (Validasi tambahan kita)
    const existingMenu = await this.menuRepository.findOne({
      where: { name: createMenuDto.name },
    });

    if (existingMenu) {
      throw new ConflictException('Name has been used');
    }

    // 2. Buat instance menu baru secara eksplisit
    const newMenu = this.menuRepository.create({
      ...createMenuDto,
      image: imagePath, // Memasukkan path file gambar
    });

    // 3. Simpan ke database
    return await this.menuRepository.save(newMenu);
  }

  async update(
    id: string,
    updateMenuDto: UpdateMenuDto,
    imagePath?: string,
  ): Promise<Menu> {
    const menu = await this.findOne(id);

    // 1. KONDISI: Ada upload file baru (Ganti Gambar)
    if (imagePath) {
      if (menu.image) {
        const oldPath = join(process.cwd(), menu.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      menu.image = imagePath;
    }
    // 2. KONDISI: Explicitly minta hapus
    else if (
      Object.prototype.hasOwnProperty.call(updateMenuDto, 'image') &&
      (updateMenuDto.image === '' || updateMenuDto.image === null)
    ) {
      if (menu.image) {
        const oldPath = join(process.cwd(), menu.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      menu.image = null;
    }

    // --- PERBAIKAN DI SINI ---
    // Buat salinan data untuk di-update
    const dataToUpdate = { ...updateMenuDto };

    // Hapus properti image dari objek dataToUpdate agar tidak menimpa menu.image
    // yang sudah kita set secara manual di atas (dan tidak memicu error unused vars)
    delete dataToUpdate.image;

    // Update field lainnya secara otomatis
    Object.assign(menu, dataToUpdate);

    return await this.menuRepository.save(menu);
  }

  async findAll(): Promise<Menu[]> {
    return this.menuRepository.find();
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) throw new NotFoundException(`Menu not found`);
    return menu;
  }

  async remove(id: string): Promise<void> {
    const menu = await this.menuRepository.findOne({ where: { id } });

    if (!menu) {
      throw new NotFoundException(`Menu not found`);
    }

    // 1. Hapus file gambarnya dulu kalau ada
    if (menu.image) {
      const filePath = join(process.cwd(), menu.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Hapus file secara fisik
      }
    }

    // 2. Baru hapus data dari database
    await this.menuRepository.remove(menu);
  }
}
