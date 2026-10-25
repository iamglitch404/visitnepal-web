import { Router, Response } from 'express';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/favorites - List user's favorites
router.get('/', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { type } = req.query;

    let sql = `SELECT * FROM favorites WHERE user_id = $1`;
    const params: any[] = [userId];

    if (type) {
      params.push(type);
      sql += ` AND entity_type = $2`;
    }

    const result = await query(sql, params);
    return sendSuccess(res, result.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/favorites/toggle - Add or remove favorite
router.post('/toggle', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { entity_type, entity_id } = req.body;

    if (!entity_type || !entity_id) {
      return sendError(res, 'entity_type and entity_id are required');
    }

    const existing = await query(
      `SELECT id FROM favorites WHERE user_id = $1 AND entity_type = $2 AND entity_id = $3`,
      [userId, entity_type, entity_id]
    );

    if (existing.rows.length > 0) {
      await query(`DELETE FROM favorites WHERE id = $1`, [existing.rows[0].id]);
      return sendSuccess(res, { favorited: false, message: 'Removed from favorites' });
    } else {
      await query(
        `INSERT INTO favorites (user_id, entity_type, entity_id) VALUES ($1, $2, $3)`,
        [userId, entity_type, entity_id]
      );
      return sendSuccess(res, { favorited: true, message: 'Added to favorites' });
    }
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
