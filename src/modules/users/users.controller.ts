import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('User Management')
@ApiBearerAuth() // Memerlukan Token di Swagger
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all users list' })
  @ApiResponse({
    status: 200,
    description: 'Return list of all users',
    type: [User],
  })
  @ApiResponse({ status: 403, description: 'Forbidden: Super Admin only' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Return user data', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id/role')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    schema: {
      example: {
        message: 'User bos_muda role has been successfully updated to ADMIN',
        user: { id: 'uuid', username: 'bos_muda', role: 'ADMIN' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation Error',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        errors: [{ field: 'role', errors: ['Invalid role type'] }],
      },
    },
  })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(id, updateRoleDto.role);
  }
}
