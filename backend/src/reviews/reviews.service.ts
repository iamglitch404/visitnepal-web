import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../middleware/auth';

@Injectable()
export class ReviewsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(query: { entity_type?: string; entity_id?: string }) {
    const { entity_type, entity_id } = query;

    let sql = `
      SELECT r.*, p.full_name as author_name, p.avatar_url as author_avatar
      FROM reviews r
      JOIN profiles p ON r.author_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (entity_type) {
      params.push(entity_type);
      sql += ` AND r.entity_type = $${params.length}`;
    }

    if (entity_id) {
      params.push(entity_id);
      sql += ` AND r.entity_id = $${params.length}`;
    }

    sql += ` ORDER BY r.created_at DESC`;
    const result = await this.db.query(sql, params);
    return result.rows;
  }

  async create(user: AuthUser, body: any) {
    const { entity_type, entity_id, rating, content } = body;

    if (!entity_type || !entity_id || !rating || !content) {
      throw new BadRequestException('entity_type, entity_id, rating, and content are required');
    }

    const reviewRes = await this.db.query(
      `INSERT INTO reviews (author_id, entity_type, entity_id, rating, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user.id, entity_type, entity_id, Math.min(5, Math.max(1, rating)), content]
    );

    return reviewRes.rows[0];
  }

  async respond(id: string, user: AuthUser, body: any) {
    const { response } = body;

    if (!response) {
      throw new BadRequestException('Response content is required');
    }

    const updateRes = await this.db.query(
      `UPDATE reviews SET response = $1 WHERE id = $2 RETURNING *`,
      [response, id]
    );

    if (updateRes.rows.length === 0) {
      throw new NotFoundException('Review not found');
    }

    return updateRes.rows[0];
  }
}
