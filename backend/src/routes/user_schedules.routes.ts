import { Router, Response } from 'express';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/user-schedules - Centralized traveler timeline & appointments
// Supports optional ?from=YYYY-MM-DD&to=YYYY-MM-DD for date-range history
router.get('/', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { from, to } = req.query;

    let scheds;
    if (from && to) {
      scheds = await query(
        `SELECT * FROM user_schedules 
         WHERE user_id = $1 
           AND start_time::date >= $2::date 
           AND start_time::date <= $3::date
         ORDER BY start_time ASC`,
        [userId, from, to]
      );
    } else {
      scheds = await query(
        `SELECT * FROM user_schedules WHERE user_id = $1 ORDER BY start_time ASC`,
        [userId]
      );
    }
    return sendSuccess(res, scheds.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/user-schedules - Add event to user's itinerary timeline
router.post('/', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { trip_id, booking_id, event_type, title, start_time, end_time, location, notes } = req.body;

    if (!title || !start_time) {
      return sendError(res, 'Title and start time are required');
    }

    const ins = await query(
      `INSERT INTO user_schedules (user_id, trip_id, booking_id, event_type, title, start_time, end_time, location, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [userId, trip_id || null, booking_id || null, event_type || 'activity', title, start_time, end_time || null, location || '', notes || '']
    );

    return sendSuccess(res, ins.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// DELETE /api/user-schedules/:id
router.delete('/:id', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await query(`DELETE FROM user_schedules WHERE id = $1 AND user_id = $2`, [req.params.id, userId]);
    return sendSuccess(res, { deleted: true });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
