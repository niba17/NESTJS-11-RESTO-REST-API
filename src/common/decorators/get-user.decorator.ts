import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../modules/users/entities/user.entity'; // 1. Import Entity User

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // 2. Kita definisikan bahwa Request ini PASTI punya properti user bertipe User
    const request = ctx.switchToHttp().getRequest<{ user: User }>();

    // 3. Sekarang ESLint tahu bahwa .user itu aman dan ada isinya
    return request.user;
  },
);
