import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class UpdateUserRoleDto {
  @IsNotEmpty()
  @IsEnum(Role, {
    message: 'Role harus berupa USER, ADMIN, atau SUPER_ADMIN ya, Bos!',
  })
  role: Role;
}
