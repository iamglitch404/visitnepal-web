import { Router, Response } from 'express';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/hotels - Public list with room types and starting price
router.get('/', async (req, res: Response) => {
  try {
    const { search, location, category } = req.query;

    let sql = `
      SELECT h.*, 
        COALESCE(
          (SELECT json_agg(rt.*) FROM room_types rt WHERE rt.hotel_id = h.id),
          '[]'::json
        ) as room_types,
        COALESCE(
          (SELECT MIN(price_per_night) FROM room_types rt WHERE rt.hotel_id = h.id),
          120.00
        ) as starting_price
      FROM hotels h
      WHERE h.status = 'published'
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (LOWER(h.name) LIKE LOWER($${params.length}) OR LOWER(h.location) LIKE LOWER($${params.length}))`;
    }

    if (location) {
      params.push(`%${location}%`);
      sql += ` AND LOWER(h.location) LIKE LOWER($${params.length})`;
    }

    sql += ` ORDER BY h.rating DESC, h.name ASC`;

    const result = await query(sql, params);
    return sendSuccess(res, result.rows);
  } catch (err: any) {
    console.error('Fetch hotels error:', err);
    return sendError(res, err.message || 'Failed to fetch hotels', 'SERVER_ERROR', 500);
  }
});

// GET /api/hotels/:id - Detail view with all room types
router.get('/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const hotelRes = await query(`SELECT * FROM hotels WHERE id = $1`, [id]);
    if (hotelRes.rows.length === 0) {
      return sendError(res, 'Hotel not found', 'NOT_FOUND', 404);
    }

    const roomsRes = await query(`SELECT * FROM room_types WHERE hotel_id = $1 ORDER BY price_per_night ASC`, [id]);
    return sendSuccess(res, {
      ...hotelRes.rows[0],
      room_types: roomsRes.rows,
    });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/hotels - Add hotel (Business/Hotel Owner/Admin)
router.post('/', authRequired, requireRole('hotel', 'business_owner', 'admin', 'super_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, location, description, image_url, amenities = [], rooms = [] } = req.body;

    if (!name || !location) {
      return sendError(res, 'Hotel name and location are required');
    }

    const hotelRes = await query(
      `INSERT INTO hotels (name, location, description, image_url, amenities, status)
       VALUES ($1, $2, $3, $4, $5, 'published')
       RETURNING *`,
      [name, location, description, image_url, amenities]
    );

    const hotel = hotelRes.rows[0];

    // Insert room types if provided
    if (Array.isArray(rooms) && rooms.length > 0) {
      for (const r of rooms) {
        await query(
          `INSERT INTO room_types (hotel_id, name, description, total_quantity, price_per_night, currency)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [hotel.id, r.name, r.description || '', r.total_quantity || 5, r.price_per_night || 100.0, r.currency || 'USD']
        );
      }
    } else {
      // Default room type
      await query(
        `INSERT INTO room_types (hotel_id, name, description, total_quantity, price_per_night, currency)
         VALUES ($1, 'Deluxe Room', 'Comfortable king-bed room with mountain view', 10, 150.00, 'USD')`,
        [hotel.id]
      );
    }

    return sendSuccess(res, hotel, 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/hotels/:id/rooms - Add room type to hotel
router.post('/:id/rooms', authRequired, requireRole('hotel', 'business_owner', 'admin', 'super_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, total_quantity = 5, price_per_night = 100.0, currency = 'USD' } = req.body;

    if (!name || !price_per_night) {
      return sendError(res, 'Room name and price per night are required');
    }

    const roomRes = await query(
      `INSERT INTO room_types (hotel_id, name, description, total_quantity, price_per_night, currency)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, name, description, total_quantity, price_per_night, currency]
    );

    return sendSuccess(res, roomRes.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
