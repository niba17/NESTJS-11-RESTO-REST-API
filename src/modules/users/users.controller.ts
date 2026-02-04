import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. Lihat semua user (Hanya Super Admin)
  @Get()
  @Roles(Role.SUPER_ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }

  // 2. Ubah Role User (Hanya Super Admin)
  @Patch(':id/role')
  @Roles(Role.SUPER_ADMIN)
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateUserRoleDto, // Gunakan DTO di sini
  ) {
    // Ambil role dari object DTO
    return this.usersService.updateRole(id, updateRoleDto.role);
  }
}
