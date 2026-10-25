import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Unauthorized: No active user session');
    }

    if (['admin', 'super_admin'].includes(user.role)) {
      return true;
    }

    // Resolve user's associated business ID
    const targetBusinessId = request.params.businessId || request.body.businessId || request.body.business_id;

    const bizRes = await this.db.query(
      `SELECT id FROM businesses WHERE owner_id = $1
       UNION
       SELECT business_id as id FROM business_staff WHERE user_id = $1 LIMIT 1`,
      [user.id]
    );

    if (bizRes.rows.length === 0) {
      throw new ForbiddenException('Unauthorized: User is not associated with any registered business');
    }

    const ownedBizId = bizRes.rows[0].id;
    request.businessId = ownedBizId;

    if (targetBusinessId && targetBusinessId !== ownedBizId) {
      throw new ForbiddenException('Forbidden: Cross-tenant data access is strictly prohibited');
    }

    return true;
  }
}
