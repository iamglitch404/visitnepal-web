import { Router, Response } from 'express';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/transport - Search transport routes
router.get('/', async (req, res: Response) => {
  try {
    const { from, to, type } = req.query;

    let sql = `SELECT * FROM transport_routes WHERE 1=1`;
    const params: any[] = [];

    if (from) {
      params.push(`%${from}%`);
      sql += ` AND LOWER(from_location) LIKE LOWER($${params.length})`;
    }

    if (to) {
      params.push(`%${to}%`);
      sql += ` AND LOWER(to_location) LIKE LOWER($${params.length})`;
    }

    if (type) {
      params.push(type);
      sql += ` AND LOWER(vehicle_type) = LOWER($${params.length})`;
    }

    sql += ` ORDER BY price ASC`;

    const result = await query(sql, params);

    // Format output with 'destinations' array for backwards compatibility with TransportScreen filter
    const formatted = result.rows.map((row) => ({
      ...row,
      destinations: [row.from_location, row.to_location],
    }));

    return sendSuccess(res, formatted);
  } catch (err: any) {
    console.error('Fetch transport error:', err);
    return sendError(res, err.message || 'Failed to fetch transport routes', 'SERVER_ERROR', 500);
  }
});

// POST /api/transport - Add transport route (Provider/Admin)
router.post('/', authRequired, requireRole('transport_provider', 'business_owner', 'admin', 'super_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { vehicle_name, vehicle_type, from_location, to_location, departure_time, arrival_time, price, total_seats = 20, amenities = [] } = req.body;

    if (!vehicle_name || !from_location || !to_location || !price) {
      return sendError(res, 'Vehicle name, route locations, and price are required');
    }

    const routeRes = await query(
      `INSERT INTO transport_routes (vehicle_name, vehicle_type, from_location, to_location, departure_time, arrival_time, price, total_seats, available_seats, amenities)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9)
       RETURNING *`,
      [vehicle_name, vehicle_type || 'Tourist Bus', from_location, to_location, departure_time || '07:00 AM', arrival_time, price, total_seats, amenities]
    );

    return sendSuccess(res, routeRes.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
