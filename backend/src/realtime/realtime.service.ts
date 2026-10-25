import { Injectable, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../middleware/auth';
import { getMissedEvents, getRealtimeMetrics } from '../services/realtime.service';

@Injectable()
export class RealtimeService {
  constructor(private readonly db: DatabaseService) {}

  async resync(user: AuthUser, since?: string) {
    const userId = user.id;
    const role = user.role;

    let businessId: string | undefined;
    const bizRes = await this.db.query(`SELECT id FROM businesses WHERE owner_id = $1 LIMIT 1`, [userId]);
    if (bizRes.rows.length > 0) {
      businessId = bizRes.rows[0].id;
    }

    return getMissedEvents(userId, role, businessId, since);
  }

  getMetrics(user: AuthUser) {
    if (!['admin', 'super_admin'].includes(user.role)) {
      throw new ForbiddenException('Unauthorized to view realtime metrics');
    }

    return getRealtimeMetrics();
  }
}
