import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: Role,
    example: Role.ADMIN,
    description: 'The new role to be assigned to the user',
  })
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(Role, { message: 'Invalid role type' })
  role: Role;
}
