import { Router, Response } from 'express';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/activities - List published activities with schedules
router.get('/', async (req, res: Response) => {
  try {
    const { category, search } = req.query;

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

    const result = await query(sql, params);

    // If database is empty, provide essential starter activities
    if (result.rows.length === 0) {
      const sampleActivities = [
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
        {
          id: 'act-safari-1',
          name: 'Chitwan Deep Jungle Safari',
          location: 'Chitwan National Park',
          category: 'Nature',
          price: 65.0,
          currency: 'USD',
          rating: 4.9,
          duration: 'Full Day',
          image_url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=600&q=80',
          description: 'Encounter One-Horned Rhinos, Bengal Tigers, Gharials, and over 500 species of migratory birds with expert jungle naturalists.',
          activity_images: [{ image_url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=600&q=80' }],
          activity_features: [{ name: 'Open 4WD Jeep' }, { name: 'Licensed Park Naturalist' }, { name: 'Canoe Ride on Rapti River' }],
          schedules: [],
        },
        {
          id: 'act-bungee-1',
          name: 'The Last Resort Bungee Jump (160m)',
          location: 'Bhotekoshi',
          category: 'Extreme',
          price: 90.0,
          currency: 'USD',
          rating: 5.0,
          duration: '3 hours',
          image_url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80',
          description: 'Jump off a 160m high suspension bridge above the raging Bhotekoshi river gorge near the Tibet border. Designed to highest Swiss safety standards.',
          activity_images: [{ image_url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80' }],
          activity_features: [{ name: 'Highest Jump in Nepal' }, { name: 'Swiss Engineered Harness' }, { name: 'Jump Certificate & T-shirt' }],
          schedules: [],
        },
      ];
      return sendSuccess(res, sampleActivities);
    }

    return sendSuccess(res, result.rows);
  } catch (err: any) {
    console.error('Fetch activities error:', err);
    return sendError(res, err.message || 'Failed to fetch activities', 'SERVER_ERROR', 500);
  }
});

// POST /api/activities - Add activity (Business/Activity Provider/Admin)
router.post('/', authRequired, requireRole('activity_provider', 'business_owner', 'admin', 'super_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, destination_id, description, duration, price, currency = 'USD', category, image_url } = req.body;

    if (!name || !price) {
      return sendError(res, 'Activity name and price are required');
    }

    const actRes = await query(
      `INSERT INTO activities (destination_id, name, description, duration, price, currency, category, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'published')
       RETURNING *`,
      [destination_id || null, name, description, duration, price, currency, category || 'Extreme']
    );

    return sendSuccess(res, actRes.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
