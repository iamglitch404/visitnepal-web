import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../middleware/auth';

@Injectable()
export class CommunityService {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query(
      `SELECT 
        p.*,
        pr.full_name as author_name,
        pr.avatar_url as author_avatar,
        pr.title as author_title,
        COALESCE(pr.rating, 5.0) as author_rating
       FROM posts p
       JOIN profiles pr ON p.author_id = pr.id
       ORDER BY p.created_at DESC`
    );

    if (result.rows.length === 0) {
      try {
        const fs = require('fs/promises');
        const path = require('path');
        const data = await fs.readFile(path.join(__dirname, '../data/posts.json'), 'utf-8');
        return JSON.parse(data);
      } catch (e) {
        console.error('Failed to read posts.json fallback', e);
        return [];
      }
    }

    return result.rows;
  }

  async create(user: AuthUser, body: any) {
    const { caption, image_url, location, package_name, package_details, package_price } = body;

    if (!caption || !image_url) {
      throw new BadRequestException('Caption and image are required');
    }

    const postRes = await this.db.query(
      `INSERT INTO posts (author_id, caption, image_url, location, package_name, package_details, package_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user.id, caption, image_url, location || null, package_name || null, package_details || null, package_price || null]
    );

    return postRes.rows[0];
  }

  async like(id: string) {
    await this.db.query(`UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1`, [id]);
    return { message: 'Post liked' };
  }
}
