import { Router, Response } from 'express';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { emitRealtimeEvent, EVENT_TYPES } from '../services/realtime.service';

const router = Router();

// All routes require admin or super_admin
router.use(authRequired, requireRole('admin', 'super_admin'));

// GET /api/admin/metrics - Real aggregate metrics directly from database
router.get('/metrics', async (_req, res: Response) => {
  try {
    const userMetrics = await query(
      `SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE status = 'active') as active_users,
        COUNT(*) FILTER (WHERE status = 'banned') as banned_users
       FROM accounts`
    );

    const bizMetrics = await query(
      `SELECT 
        COUNT(*) as total_businesses,
        COUNT(*) FILTER (WHERE is_verified = true) as verified_businesses,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_verifications
       FROM businesses`
    );

    const bookingMetrics = await query(
      `SELECT 
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
        COUNT(*) FILTER (WHERE status IN ('pending', 'pending_payment')) as pending_bookings,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'confirmed'), 0) as total_volume
       FROM bookings`
    );

    const permitMetrics = await query(
      `SELECT 
        COUNT(*) as total_permits,
        COUNT(*) FILTER (WHERE status = 'under_review') as pending_permits,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_permits
       FROM permit_applications`
    );

    const u = userMetrics.rows[0];
    const b = bizMetrics.rows[0];
    const bk = bookingMetrics.rows[0];
    const p = permitMetrics.rows[0];

    return sendSuccess(res, {
      total_users: parseInt(u.total_users) || 0,
      active_users: parseInt(u.active_users) || 0,
      banned_users: parseInt(u.banned_users) || 0,
      total_businesses: parseInt(b.total_businesses) || 0,
      verified_businesses: parseInt(b.verified_businesses) || 0,
      pending_verifications: parseInt(b.pending_verifications) || 0,
      total_bookings: parseInt(bk.total_bookings) || 0,
      confirmed_bookings: parseInt(bk.confirmed_bookings) || 0,
      pending_bookings: parseInt(bk.pending_bookings) || 0,
      total_volume: parseFloat(bk.total_volume) || 0.0,
      total_permits: parseInt(p.total_permits) || 0,
      pending_permits: parseInt(p.pending_permits) || 0,
      approved_permits: parseInt(p.approved_permits) || 0,
    });
  } catch (err: any) {
    console.error('Admin metrics error:', err);
    return sendError(res, err.message || 'Failed to fetch admin metrics', 'SERVER_ERROR', 500);
  }
});

// GET /api/admin/users - User management with search and filters
router.get('/users', async (req, res: Response) => {
  try {
    const { search, role, status } = req.query;

    let sql = `
      SELECT a.id, a.email, a.status, a.created_at, r.name as role, p.full_name, p.avatar_url, p.is_verified
      FROM accounts a
      LEFT JOIN roles r ON a.role_id = r.id
      LEFT JOIN profiles p ON a.id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (LOWER(a.email) LIKE LOWER($${params.length}) OR LOWER(p.full_name) LIKE LOWER($${params.length}))`;
    }

    if (role && role !== 'All') {
      params.push(role);
      sql += ` AND r.name = $${params.length}`;
    }

    if (status && status !== 'All') {
      params.push(status);
      sql += ` AND a.status = $${params.length}`;
    }

    sql += ` ORDER BY a.created_at DESC LIMIT 100`;

    const result = await query(sql, params);
    return sendSuccess(res, result.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PUT /api/admin/users/:id/status - Moderate user account
router.put('/users/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, reason } = req.body;
    const actorId = req.user!.id;

    if (!['active', 'suspended', 'banned'].includes(status)) {
      return sendError(res, 'Invalid account status', 'BAD_REQUEST', 400);
    }

    await query(`UPDATE accounts SET status = $1 WHERE id = $2`, [status, id]);

    // Record audit log
    await query(
      `INSERT INTO audit_logs (action_name, entity_name, entity_id, actor_id, payload)
       VALUES ('user_status_change', 'accounts', $1, $2, $3)`,
      [id, actorId, JSON.stringify({ status, reason: reason || 'Admin moderation' })]
    );

    // Emit Realtime Event
    await emitRealtimeEvent({
      event: EVENT_TYPES.USER_STATUS_UPDATED,
      entity: 'user',
      entityId: id,
      action: 'status_updated',
      scope: { userId: id },
      metadata: { status, reason: reason || 'Admin moderation' },
    });

    return sendSuccess(res, { message: `User status successfully updated to ${status}` });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/admin/businesses - Business verification queue & directory
router.get('/businesses', async (req, res: Response) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT b.*, a.email as owner_email, p.full_name as owner_name,
        COALESCE(
          (SELECT json_agg(d.*) FROM documents d WHERE d.business_id = b.id),
          '[]'::json
        ) as documents
      FROM businesses b
      JOIN accounts a ON b.owner_id = a.id
      LEFT JOIN profiles p ON a.id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'All') {
      params.push(status);
      sql += ` AND b.status = $${params.length}`;
    }

    sql += ` ORDER BY b.created_at DESC`;

    const result = await query(sql, params);
    return sendSuccess(res, result.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PUT /api/admin/businesses/:id/verify - Approve / Reject business
router.put('/businesses/:id/verify', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, rejection_reason } = req.body;
    const actorId = req.user!.id;

    if (!['approved', 'rejected', 'suspended', 'pending'].includes(status)) {
      return sendError(res, 'Invalid verification status', 'BAD_REQUEST', 400);
    }

    const isVerified = status === 'approved';

    const updateRes = await query(
      `UPDATE businesses SET
        status = $1,
        is_verified = $2,
        rejection_reason = $3,
        updated_at = now()
       WHERE id = $4
       RETURNING *`,
      [status, isVerified, rejection_reason || null, id]
    );

    if (updateRes.rows.length === 0) {
      return sendError(res, 'Business not found', 'NOT_FOUND', 404);
    }

    const biz = updateRes.rows[0];

    // Notify owner
    const message = isVerified
      ? `Congratulations! Your business "${biz.name}" has been officially verified on VisitNepal.`
      : `Your business verification update: ${status}. Reason: ${rejection_reason || 'Please review your document submissions.'}`;

    await query(
      `INSERT INTO notifications (recipient_id, type, title, message, related_entity_id)
       VALUES ($1, 'business_verification', 'Business Verification Update', $2, $3)`,
      [biz.owner_id, message, id]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (action_name, entity_name, entity_id, actor_id, payload)
       VALUES ('business_verification', 'businesses', $1, $2, $3)`,
      [id, actorId, JSON.stringify({ status, is_verified: isVerified })]
    );

    // Emit Realtime Events (Strictly after DB commit)
    await emitRealtimeEvent({
      event: EVENT_TYPES.BUSINESS_STATUS_UPDATED,
      entity: 'business',
      entityId: id,
      action: status,
      scope: {
        businessId: id,
        userId: biz.owner_id,
        isPublic: isVerified,
      },
      metadata: {
        status,
        is_verified: isVerified,
        business_name: biz.name,
        rejection_reason: rejection_reason || null,
      },
    });

    await emitRealtimeEvent({
      event: EVENT_TYPES.BUSINESS_VERIFICATION_UPDATED,
      entity: 'business',
      entityId: id,
      action: isVerified ? 'verified' : 'rejected',
      scope: {
        businessId: id,
        userId: biz.owner_id,
        isPublic: false,
      },
      metadata: { is_verified: isVerified, status },
    });

    await emitRealtimeEvent({
      event: EVENT_TYPES.NOTIFICATION_CREATED,
      entity: 'notification',
      entityId: `notif-biz-${id}`,
      action: 'created',
      scope: { userId: biz.owner_id },
      metadata: {
        title: 'Business Verification Update',
        message,
        relatedEntityId: id,
      },
    });

    return sendSuccess(res, biz);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', async (_req, res: Response) => {
  try {
    const logs = await query(
      `SELECT al.*, a.email as actor_email, p.full_name as actor_name
       FROM audit_logs al
       LEFT JOIN accounts a ON al.actor_id = a.id
       LEFT JOIN profiles p ON a.id = p.id
       ORDER BY al.created_at DESC
       LIMIT 100`
    );
    return sendSuccess(res, logs.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
