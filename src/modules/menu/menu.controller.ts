import * as fs from 'fs';
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import 'multer';

import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/menu',
        filename: (
          req: Request,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const name = Date.now().toString();
          const ext = extname(file.originalname);
          cb(null, `${name}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(
            new BadRequestException('Only jpg, jpeg, png & webp allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() createMenuDto: CreateMenuDto,
  ): Promise<any> {
    const filename = file?.filename ? String(file.filename) : '';
    const imagePath = filename ? `/uploads/menu/${filename}` : '';
    return this.menuService.create(createMenuDto, imagePath);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/menu',
        filename: (req, file, cb) => {
          const name = Date.now().toString();
          const ext = extname(file.originalname);
          cb(null, `${name}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(
            new BadRequestException('Only jpg, jpeg, png & webp allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    let imagePath: string | undefined = undefined;

    // --- LOGIKA ANTI DUPLIKASI ---
    if (file) {
      // Jika file ada tapi ukurannya 0 (file hantu dari browser/postman)
      if (file.size === 0) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        imagePath = undefined;
      } else {
        imagePath = `/uploads/menu/${file.filename}`;
      }
    }

    return this.menuService.update(id, updateMenuDto, imagePath);
  }

  @Get()
  async findAll() {
    return this.menuService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard) // Harus login dulu
  async remove(@Param('id') id: string) {
    await this.menuService.remove(id);
    return {
      message: `Menu deleted successfully`,
    };
  }
}
