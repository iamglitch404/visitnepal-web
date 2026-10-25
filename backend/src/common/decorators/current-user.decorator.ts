import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../../middleware/auth';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
