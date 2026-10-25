import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DestinationsService {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  async findAll(query: { search?: string; category?: string; difficulty?: string; budget?: string; status?: string }) {
    const { search, category, difficulty, budget, status = 'published' } = query;
    let sql = `SELECT * FROM destinations WHERE 1=1`;
    const params: any[] = [];

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (category && category !== 'All') {
      params.push(category);
      sql += ` AND LOWER(category) = LOWER($${params.length})`;
    }

    if (difficulty && difficulty !== 'All') {
      params.push(difficulty);
      sql += ` AND LOWER(difficulty) = LOWER($${params.length})`;
    }

    if (budget && budget !== 'All') {
      params.push(budget);
      sql += ` AND budget = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (LOWER(name) LIKE LOWER($${params.length}) OR LOWER(location) LIKE LOWER($${params.length}) OR LOWER(description) LIKE LOWER($${params.length}))`;
    }

    sql += ` ORDER BY rating DESC, name ASC`;
    const result = await this.db.query(sql, params);
    return result.rows;
  }

  async findOne(id: string) {
    const destRes = await this.db.query(`SELECT * FROM destinations WHERE id = $1`, [id]);
    if (destRes.rows.length === 0) {
      throw new NotFoundException('Destination not found');
    }

    const destination = destRes.rows[0];

    const hotelsRes = await this.db.query(
      `SELECT * FROM hotels WHERE LOWER(location) LIKE LOWER($1) AND status = 'published' LIMIT 4`,
      [`%${destination.location.split(',')[0]}%`]
    );

    const activitiesRes = await this.db.query(
      `SELECT * FROM activities WHERE destination_id = $1 AND status = 'published'`,
      [id]
    );

    return {
      ...destination,
      related_hotels: hotelsRes.rows,
      activities: activitiesRes.rows,
    };
  }

  async create(body: any) {
    const {
      name,
      location,
      description,
      image_url,
      category = 'General',
      best_season = 'Year-round',
      difficulty = 'Medium',
      duration = 'N/A',
      budget = '$$',
      highlights = [],
      status = 'published',
    } = body;

    const insertRes = await this.db.query(
      `INSERT INTO destinations 
        (name, location, description, image_url, category, best_season, difficulty, duration, budget, highlights, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [name, location, description, image_url, category, best_season, difficulty, duration, budget, highlights, status]
    );

    return insertRes.rows[0];
  }

  async update(id: string, body: any) {
    const { name, location, description, image_url, category, best_season, difficulty, duration, budget, highlights, status } = body;

    const updateRes = await this.db.query(
      `UPDATE destinations SET
        name = COALESCE($1, name),
        location = COALESCE($2, location),
        description = COALESCE($3, description),
        image_url = COALESCE($4, image_url),
        category = COALESCE($5, category),
        best_season = COALESCE($6, best_season),
        difficulty = COALESCE($7, difficulty),
        duration = COALESCE($8, duration),
        budget = COALESCE($9, budget),
        highlights = COALESCE($10, highlights),
        status = COALESCE($11, status)
       WHERE id = $12
       RETURNING *`,
      [name, location, description, image_url, category, best_season, difficulty, duration, budget, highlights, status, id]
    );

    if (updateRes.rows.length === 0) {
      throw new NotFoundException('Destination not found');
    }

    return updateRes.rows[0];
  }

  async delete(id: string) {
    await this.db.query(`DELETE FROM destinations WHERE id = $1`, [id]);
    return { message: 'Destination deleted successfully' };
  }
}
