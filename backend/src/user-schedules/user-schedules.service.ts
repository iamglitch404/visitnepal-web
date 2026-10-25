import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../middleware/auth';

@Injectable()
export class UserSchedulesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(user: AuthUser) {
    const scheds = await this.db.query(
      `SELECT * FROM user_schedules WHERE user_id = $1 ORDER BY start_time ASC`,
      [user.id]
    );
    return scheds.rows;
  }

  async create(user: AuthUser, body: any) {
    const { trip_id, booking_id, event_type = 'activity', title, start_time, end_time, location = '', notes = '' } = body;

    if (!title || !start_time) {
      throw new BadRequestException('Title and start time are required');
    }

    const ins = await this.db.query(
      `INSERT INTO user_schedules (user_id, trip_id, booking_id, event_type, title, start_time, end_time, location, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [user.id, trip_id || null, booking_id || null, event_type, title, start_time, end_time || null, location, notes]
    );

    return ins.rows[0];
  }

  async delete(id: string, user: AuthUser) {
    await this.db.query(`DELETE FROM user_schedules WHERE id = $1 AND user_id = $2`, [id, user.id]);
    return { deleted: true };
  }
}
