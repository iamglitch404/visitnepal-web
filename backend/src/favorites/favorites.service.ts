import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../middleware/auth';

@Injectable()
export class FavoritesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(user: AuthUser, query: { type?: string }) {
    const { type } = query;
    let sql = `SELECT * FROM favorites WHERE user_id = $1`;
    const params: any[] = [user.id];

    if (type) {
      params.push(type);
      sql += ` AND entity_type = $2`;
    }

    const result = await this.db.query(sql, params);
    return result.rows;
  }

  async toggle(user: AuthUser, body: any) {
    const { entity_type, entity_id } = body;

    if (!entity_type || !entity_id) {
      throw new BadRequestException('entity_type and entity_id are required');
    }

    const existing = await this.db.query(
      `SELECT id FROM favorites WHERE user_id = $1 AND entity_type = $2 AND entity_id = $3`,
      [user.id, entity_type, entity_id]
    );

    if (existing.rows.length > 0) {
      await this.db.query(`DELETE FROM favorites WHERE id = $1`, [existing.rows[0].id]);
      return { favorited: false, message: 'Removed from favorites' };
    } else {
      await this.db.query(
        `INSERT INTO favorites (user_id, entity_type, entity_id) VALUES ($1, $2, $3)`,
        [user.id, entity_type, entity_id]
      );
      return { favorited: true, message: 'Added to favorites' };
    }
  }
}
