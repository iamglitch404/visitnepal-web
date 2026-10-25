import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ProvidersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(query: { type?: string; search?: string }) {
    const { type, search } = query;

    let sql = `
      SELECT 
        a.id,
        COALESCE(r.name, 'guide') as type,
        p.full_name,
        p.avatar_url,
        p.bio,
        p.title,
        p.is_verified,
        COALESCE(p.rating, 4.9) as rating,
        COALESCE(gp.daily_rate, 35.00) as price_per_day,
        COALESCE(gp.daily_rate, 35.00) as price,
        COALESCE(gp.specialty, 'Mountain Trekking') as specialty,
        gp.status as guide_status,
        json_build_object(
          'id', a.id,
          'full_name', p.full_name,
          'avatar_url', p.avatar_url,
          'role', r.name,
          'is_verified', p.is_verified
        ) as profile,
        json_build_object(
          'id', a.id,
          'full_name', p.full_name,
          'avatar_url', p.avatar_url,
          'languages', json_build_array(json_build_object('name', 'English'), json_build_object('name', 'Nepali'))
        ) as profiles,
        json_build_array(
          json_build_object('name', 'English'),
          json_build_object('name', 'Nepali')
        ) as languages,
        json_build_array(
          json_build_object('rating_value', COALESCE(p.rating, 5.0))
        ) as ratings,
        5 as experience_seasons
      FROM accounts a
      JOIN roles r ON a.role_id = r.id
      LEFT JOIN profiles p ON a.id = p.id
      LEFT JOIN guide_profiles gp ON a.id = gp.id
      WHERE a.status = 'active'
    `;
    const params: any[] = [];

    if (type) {
      params.push(type);
      sql += ` AND LOWER(r.name) = LOWER($${params.length})`;
    } else {
      sql += ` AND r.name IN ('guide', 'butler', 'trekking_agency')`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (LOWER(p.full_name) LIKE LOWER($${params.length}) OR LOWER(gp.specialty) LIKE LOWER($${params.length}))`;
    }

    sql += ` ORDER BY p.rating DESC, p.full_name ASC`;
    const result = await this.db.query(sql, params);

    if (result.rows.length === 0) {
      return [
        {
          id: 'guide-sample-1',
          type: type || 'guide',
          full_name: 'Nima Sherpa',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
          bio: 'Senior IFMGA certified high-altitude mountaineer with 12 summits of Everest. Expert in safety, glacier travel, and acclimatization.',
          specialty: 'High-Altitude Mountaineering',
          price_per_day: 45.00,
          price: 45.00,
          rating: 5.0,
          is_verified: true,
          profile: { full_name: 'Nima Sherpa', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop', role: 'Senior Guide', is_verified: true },
          profiles: { full_name: 'Nima Sherpa', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
          languages: [{ name: 'English' }, { name: 'Nepali' }, { name: 'Sherpa' }],
          ratings: [{ rating_value: 5.0 }],
          experience_seasons: 14,
        },
      ];
    }

    return result.rows;
  }

  async updateMe(userId: string, body: any) {
    const { daily_rate, specialty, bio } = body;

    if (daily_rate !== undefined || specialty !== undefined) {
      await this.db.query(
        `INSERT INTO guide_profiles (id, daily_rate, specialty, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (id) DO UPDATE SET
           daily_rate = COALESCE($2, guide_profiles.daily_rate),
           specialty = COALESCE($3, guide_profiles.specialty)`,
        [userId, daily_rate || 35.0, specialty || 'General Guiding']
      );
    }

    if (bio !== undefined) {
      await this.db.query(`UPDATE profiles SET bio = $1 WHERE id = $2`, [bio, userId]);
    }

    return { message: 'Provider profile updated successfully' };
  }
}
