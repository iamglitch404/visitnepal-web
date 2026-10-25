import { Router, Response } from 'express';
import { query, withTransaction } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/trips - List user's planned trips
router.get('/', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const tripsRes = await query(
      `SELECT t.*, 
        d.name as destination_name, 
        d.image_url as destination_image,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', id,
              'day_number', day_number,
              'date', date,
              'items', COALESCE((SELECT json_agg(i.*) FROM itinerary_items i WHERE i.day_id = itinerary_days.id), '[]'::json)
            ) ORDER BY day_number ASC
          ) FROM itinerary_days WHERE trip_id = t.id),
          '[]'::json
        ) as days
       FROM trips t
       LEFT JOIN destinations d ON t.destination_id = d.id
       WHERE t.profile_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );

    return sendSuccess(res, tripsRes.rows);
  } catch (err: any) {
    console.error('Fetch trips error:', err);
    return sendError(res, err.message || 'Failed to fetch trips', 'SERVER_ERROR', 500);
  }
});

// POST /api/trips - Create new customized trip with itinerary days
router.post('/', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, destination_id, start_date, end_date, budget_limit, stops = [] } = req.body;

    if (!title) {
      return sendError(res, 'Trip title is required');
    }

    const trip = await withTransaction(async (client) => {
      const tripInsert = await client.query(
        `INSERT INTO trips (profile_id, destination_id, title, start_date, end_date, budget_limit, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'planned')
         RETURNING *`,
        [userId, destination_id || null, title, start_date || null, end_date || null, budget_limit || null]
      );
      const newTrip = tripInsert.rows[0];

      // Add stops as itinerary days
      if (Array.isArray(stops) && stops.length > 0) {
        let dayNum = 1;
        for (const stop of stops) {
          const daysCount = stop.days || 1;
          for (let d = 0; d < daysCount; d++) {
            const dayInsert = await client.query(
              `INSERT INTO itinerary_days (trip_id, day_number)
               VALUES ($1, $2)
               RETURNING id`,
              [newTrip.id, dayNum]
            );
            const dayId = dayInsert.rows[0].id;

            // Add activity item if available
            if (stop.destination?.name || stop.destination_name) {
              await client.query(
                `INSERT INTO itinerary_items (day_id, activity, location)
                 VALUES ($1, $2, $3)`,
                [dayId, `Explore ${stop.destination?.name || stop.destination_name}`, stop.destination?.location || 'Nepal']
              );
            }
            dayNum++;
          }
        }
      }

      return newTrip;
    });

    return sendSuccess(res, trip, 201);
  } catch (err: any) {
    console.error('Create trip error:', err);
    return sendError(res, err.message || 'Failed to create trip', 'SERVER_ERROR', 500);
  }
});

// DELETE /api/trips/:id
router.delete('/:id', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await query(`DELETE FROM trips WHERE id = $1 AND profile_id = $2`, [id, userId]);
    return sendSuccess(res, { message: 'Trip deleted successfully' });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
