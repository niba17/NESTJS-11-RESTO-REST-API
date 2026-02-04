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
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { fileUploadConfig } from './config/multer.config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  // Tambahkan as MulterOptions jika ESLint masih cerewet
  @UseInterceptors(FileInterceptor('image', fileUploadConfig as MulterOptions))
  async create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() createMenuDto: CreateMenuDto,
  ) {
    return this.menuService.create(createMenuDto, file);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('image', fileUploadConfig as MulterOptions))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menuService.update(id, updateMenuDto, file);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.menuService.findAll(search, category);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.menuService.remove(id);
    return { message: 'Menu deleted successfully' };
  }
}
