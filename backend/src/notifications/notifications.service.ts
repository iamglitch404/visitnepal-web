import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../middleware/auth';

@Injectable()
export class NotificationsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(user: AuthUser) {
    const result = await this.db.query(
      `SELECT * FROM notifications WHERE recipient_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [user.id]
    );
    return result.rows;
  }

  async getUnreadCount(user: AuthUser) {
    const result = await this.db.query(
      `SELECT COUNT(*) as count FROM notifications WHERE recipient_id = $1 AND read = false`,
      [user.id]
    );
    const count = parseInt(result.rows[0].count) || 0;
    return { count };
  }

  async markAsRead(id: string, user: AuthUser) {
    await this.db.query(
      `UPDATE notifications SET read = true WHERE id = $1 AND recipient_id = $2`,
      [id, user.id]
    );
    return { message: 'Marked as read' };
  }

  async markAllAsRead(user: AuthUser) {
    await this.db.query(
      `UPDATE notifications SET read = true WHERE recipient_id = $1`,
      [user.id]
    );
    return { message: 'All notifications marked as read' };
  }
}
