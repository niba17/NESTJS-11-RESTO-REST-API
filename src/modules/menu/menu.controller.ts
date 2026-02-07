import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseGuards,
  Patch,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UseMenuImageUpload } from './decorators/menu-upload.decorator';
import { GetMenuQueryDto } from './dto/get-menu-query.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('menu') // 2. (Opsional) Biar rutenya rapi dikelompokkan
@ApiBearerAuth() // 3. INI KUNCINYA, BOS!
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @UseMenuImageUpload()
  @ApiConsumes('multipart/form-data') // Memberitahu Swagger ini upload file
  @ApiOperation({ summary: 'Create new menu with image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Menu image file',
        }, // Sesuaikan jadi 'image'
        name: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'string', enum: ['FOOD', 'DRINK'] },
        stock: { type: 'number' },
        description: { type: 'string' },
      },
    },
  })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMenuDto: CreateMenuDto,
  ) {
    return this.menuService.create(createMenuDto, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all menus',
    description:
      'Get a list of all menus with optional filters for name searching and category selection',
  })
  @ApiResponse({
    status: 200,
    description: 'List of menus retrieved successfully',
  })
  async findAll(@Query() query: GetMenuQueryDto) {
    return this.menuService.findAll(query.search, query.category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu details by ID' })
  @ApiResponse({ status: 200, description: 'Menu details found' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @UseMenuImageUpload()
  @ApiConsumes('multipart/form-data') // WAJIB agar Swagger bisa upload file saat update
  @ApiOperation({ summary: 'Update menu details or image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Menu image file',
        }, // Sesuaikan jadi 'image'
        name: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'string', enum: ['FOOD', 'DRINK'] },
        stock: { type: 'number' },
        description: { type: 'string' },
        isAvailable: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Menu updated successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menuService.update(id, updateMenuDto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a menu item' })
  @ApiResponse({
    status: 200,
    description: 'Menu and its image deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuService.remove(id);
  }
}
