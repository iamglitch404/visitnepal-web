import { Router, Response } from 'express';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/reviews - Get reviews for an entity
router.get('/', async (req, res: Response) => {
  try {
    const { entity_type, entity_id } = req.query;

    let sql = `
      SELECT r.*, p.full_name as author_name, p.avatar_url as author_avatar
      FROM reviews r
      JOIN profiles p ON r.author_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (entity_type) {
      params.push(entity_type);
      sql += ` AND r.entity_type = $${params.length}`;
    }

    if (entity_id) {
      params.push(entity_id);
      sql += ` AND r.entity_id = $${params.length}`;
    }

    sql += ` ORDER BY r.created_at DESC`;

    const result = await query(sql, params);
    return sendSuccess(res, result.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/reviews - Submit review
router.post('/', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { entity_type, entity_id, rating, content } = req.body;

    if (!entity_type || !entity_id || !rating || !content) {
      return sendError(res, 'entity_type, entity_id, rating, and content are required');
    }

    const reviewRes = await query(
      `INSERT INTO reviews (author_id, entity_type, entity_id, rating, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, entity_type, entity_id, Math.min(5, Math.max(1, rating)), content]
    );

    return sendSuccess(res, reviewRes.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/reviews/:id/response - Business reply to review
router.post('/:id/response', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      return sendError(res, 'Response content is required');
    }

    const updateRes = await query(
      `UPDATE reviews SET response = $1 WHERE id = $2 RETURNING *`,
      [response, id]
    );

    if (updateRes.rows.length === 0) {
      return sendError(res, 'Review not found', 'NOT_FOUND', 404);
    }

    return sendSuccess(res, updateRes.rows[0]);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
