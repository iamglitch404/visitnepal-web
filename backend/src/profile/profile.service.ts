import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../middleware/auth';

@Injectable()
export class ProfileService {
  constructor(private readonly db: DatabaseService) {}

  async getProfile(user: AuthUser) {
    const result = await this.db.query(
      `SELECT p.*, a.email, a.status, r.name as role
       FROM profiles p
       JOIN accounts a ON p.id = a.id
       LEFT JOIN roles r ON a.role_id = r.id
       WHERE p.id = $1`,
      [user.id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Profile not found');
    }

    return result.rows[0];
  }

  async updateProfile(user: AuthUser, body: any) {
    const { full_name, bio, avatar_url, cover_url, title } = body;

    const updateRes = await this.db.query(
      `UPDATE profiles SET
        full_name = COALESCE($1, full_name),
        bio = COALESCE($2, bio),
        avatar_url = COALESCE($3, avatar_url),
        cover_url = COALESCE($4, cover_url),
        title = COALESCE($5, title),
        updated_at = now()
       WHERE id = $6
       RETURNING *`,
      [full_name, bio, avatar_url, cover_url, title, user.id]
    );

    if (updateRes.rows.length === 0) {
      throw new NotFoundException('Profile not found');
    }

    return updateRes.rows[0];
  }
}
