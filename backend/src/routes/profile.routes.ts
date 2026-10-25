import { Router, Response } from 'express';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/profile
router.get('/', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await query(
      `SELECT p.*, a.email, a.status, r.name as role
       FROM profiles p
       JOIN accounts a ON p.id = a.id
       LEFT JOIN roles r ON a.role_id = r.id
       WHERE p.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Profile not found', 'NOT_FOUND', 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PUT /api/profile
router.put('/', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { full_name, bio, avatar_url, cover_url, title } = req.body;

    const updateRes = await query(
      `UPDATE profiles SET
        full_name = COALESCE($1, full_name),
        bio = COALESCE($2, bio),
        avatar_url = COALESCE($3, avatar_url),
        cover_url = COALESCE($4, cover_url),
        title = COALESCE($5, title),
        updated_at = now()
       WHERE id = $6
       RETURNING *`,
      [full_name, bio, avatar_url, cover_url, title, userId]
    );

    if (updateRes.rows.length === 0) {
      return sendError(res, 'Profile not found', 'NOT_FOUND', 404);
    }

    return sendSuccess(res, updateRes.rows[0]);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
