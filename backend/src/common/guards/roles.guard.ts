import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private reflector: Reflector;

  constructor(@Optional() @Inject(Reflector) reflector?: Reflector) {
    this.reflector = reflector || new Reflector();
  }

  canActivate(context: ExecutionContext): boolean {
    const reflector = this.reflector || new Reflector();
    const requiredRoles = reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User authentication context is missing');
    }

    if (user.role === 'super_admin') {
      return true;
    }

    const normalizedUserRole = user.role === 'traveler' ? 'tourist' : user.role;
    const normalizedAllowed = requiredRoles.map((r) => (r === 'traveler' ? 'tourist' : r));

    const hasRole = normalizedAllowed.includes(normalizedUserRole);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Requires one of roles: [${requiredRoles.join(', ')}]`
      );
    }

    return true;
  }
}
