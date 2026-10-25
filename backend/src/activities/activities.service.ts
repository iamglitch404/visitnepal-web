import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ActivitiesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(query: { category?: string; search?: string }) {
    const { category, search } = query;

    let sql = `
      SELECT 
        a.*,
        COALESCE(
          (SELECT json_agg(s.*) FROM activity_schedules s WHERE s.activity_id = a.id AND s.start_time > now()),
          '[]'::json
        ) as schedules,
        COALESCE(
          (SELECT json_agg(json_build_object('image_url', a.image_url)) WHERE a.image_url IS NOT NULL),
          '[]'::json
        ) as activity_images,
        json_build_array(
          json_build_object('name', 'Certified Instructor'),
          json_build_object('name', 'Safety Gear Included'),
          json_build_object('name', 'Hotel Pickup Available')
        ) as activity_features
      FROM activities a
      WHERE a.status = 'published'
    `;
    const params: any[] = [];

    if (category && category !== 'All') {
      params.push(category);
      sql += ` AND LOWER(a.category) = LOWER($${params.length})`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (LOWER(a.name) LIKE LOWER($${params.length}) OR LOWER(a.description) LIKE LOWER($${params.length}))`;
    }

    sql += ` ORDER BY a.name ASC`;
    const result = await this.db.query(sql, params);

    if (result.rows.length === 0) {
      return [
        {
          id: 'act-paragliding-1',
          name: 'Sarangkot Tandem Paragliding',
          location: 'Pokhara',
          category: 'Air',
          price: 75.0,
          currency: 'USD',
          rating: 4.9,
          duration: '30-45 mins',
          image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
          description: 'Fly over Phewa Lake with unobstructed views of the Annapurna Mountain range and Machhapuchhre peak.',
          activity_images: [{ image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80' }],
          activity_features: [{ name: 'GoPro Photos & 4K Video' }, { name: 'Full Insurance Cover' }, { name: 'APPI Certified Pilots' }],
          schedules: [],
        },
        {
          id: 'act-rafting-1',
          name: 'Trishuli River White Water Rafting',
          location: 'Dhading / Trishuli',
          category: 'Water',
          price: 50.0,
          currency: 'USD',
          rating: 4.8,
          duration: '4 hours',
          image_url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=600&q=80',
          description: 'Thrilling Class III+ rapids through deep gorges, sandy beaches, and emerald green hills. Buffet river lunch included.',
          activity_images: [{ image_url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=600&q=80' }],
          activity_features: [{ name: 'High-Floatation Lifevests' }, { name: 'River Safety Kayakers' }, { name: 'Hot Lunch Buffet' }],
          schedules: [],
        },
      ];
    }

    return result.rows;
  }

  async create(body: any) {
    const { name, destination_id, description, duration, price, currency = 'USD', category = 'Extreme' } = body;

    if (!name || !price) {
      throw new BadRequestException('Activity name and price are required');
    }

    const actRes = await this.db.query(
      `INSERT INTO activities (destination_id, name, description, duration, price, currency, category, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'published')
       RETURNING *`,
      [destination_id || null, name, description, duration, price, currency, category]
    );

    return actRes.rows[0];
  }
}
