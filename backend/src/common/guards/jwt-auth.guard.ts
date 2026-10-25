import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Inject,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { verifyToken } from '../../middleware/auth';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private reflector: Reflector;
  private db: DatabaseService;

  constructor(
    @Optional() @Inject(Reflector) reflector?: Reflector,
    @Optional() @Inject(DatabaseService) db?: DatabaseService
  ) {
    this.reflector = reflector || new Reflector();
    this.db = db || new DatabaseService();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const reflector = this.reflector || new Reflector();
    const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException('Authentication token is required');
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    const userRes = await this.db.query(
      `SELECT a.id, a.email, a.status, r.name as role, p.full_name, p.is_verified
       FROM accounts a
       LEFT JOIN roles r ON a.role_id = r.id
       LEFT JOIN profiles p ON a.id = p.id
       WHERE a.id = $1`,
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      if (isPublic) return true;
      throw new UnauthorizedException('User account not found');
    }

    const row = userRes.rows[0];

    if (row.status === 'banned') {
      throw new ForbiddenException('This account has been banned.');
    }

    if (row.status === 'suspended') {
      throw new ForbiddenException('This account is currently suspended.');
    }

    request.user = {
      id: row.id,
      email: row.email,
      role: row.role || 'tourist',
      fullName: row.full_name,
      status: row.status,
      isVerified: row.is_verified,
    };

    return true;
  }
}
