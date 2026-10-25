import { Router, Response } from 'express';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications - List user's notifications
router.get('/', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await query(
      `SELECT * FROM notifications WHERE recipient_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );
    return sendSuccess(res, result.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/notifications/unread-count - Real badge count
router.get('/unread-count', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await query(
      `SELECT COUNT(*) as count FROM notifications WHERE recipient_id = $1 AND read = false`,
      [userId]
    );
    const count = parseInt(result.rows[0].count) || 0;
    return sendSuccess(res, { count });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PUT /api/notifications/:id/read - Mark one notification as read
router.put('/:id/read', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    await query(`UPDATE notifications SET read = true WHERE id = $1 AND recipient_id = $2`, [id, userId]);
    return sendSuccess(res, { message: 'Marked as read' });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await query(`UPDATE notifications SET read = true WHERE recipient_id = $1`, [userId]);
    return sendSuccess(res, { message: 'All notifications marked as read' });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
