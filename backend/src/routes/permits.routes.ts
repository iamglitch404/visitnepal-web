
import { Router, Response } from 'express';
import { randomUUID } from 'crypto';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { emitRealtimeEvent, EVENT_TYPES } from '../services/realtime.service';

const router = Router();

// GET /api/permits/authorities - Official Issuing Authorities
router.get('/authorities', async (_req, res: Response) => {
  try {
    const result = await query(`SELECT * FROM permit_authorities ORDER BY name ASC`);
    return sendSuccess(res, result.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/permits/types - List all permit types & legal requirements
router.get('/types', async (_req, res: Response) => {
  try {
    const result = await query(`SELECT * FROM permit_types ORDER BY fee ASC`);
    return sendSuccess(res, result.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/permits/types/:id/requirements - List requirements for a permit type
router.get('/types/:id/requirements', async (req, res: Response) => {
  try {
    const result = await query(`SELECT * FROM permit_requirements WHERE permit_type_id = $1`, [req.params.id]);
    return sendSuccess(res, result.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/permits - List permit applications
router.get('/', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let sql = `
      SELECT 
        pa.*,
        pt.name as permit_type_name,
        pt.code as permit_type_code,
        d.name as destination_name,
        p.full_name as applicant_name,
        a.email as applicant_email
      FROM permit_applications pa
      JOIN permit_types pt ON pa.permit_type_id = pt.id
      LEFT JOIN destinations d ON pa.destination_id = d.id
      LEFT JOIN profiles p ON pa.applicant_id = p.id
      LEFT JOIN accounts a ON pa.applicant_id = a.id
    `;
    const params: any[] = [];

    if (!['admin', 'super_admin', 'verification_officer', 'permit_officer'].includes(userRole)) {
      params.push(userId);
      sql += ` WHERE pa.applicant_id = $1`;
    }

    sql += ` ORDER BY pa.created_at DESC`;

    const result = await query(sql, params);
    return sendSuccess(res, result.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/permits - Submit permit application with reference number & verification token
router.post('/', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      permit_type_id,
      permit_type_code = 'TIMS',
      destination_id,
      travel_start_date,
      travel_end_date,
      personal_info = {},
      documents = {},
    } = req.body;

    let typeId = permit_type_id;
    let fee = 20.0;

    const ptRes = typeId 
      ? await query(`SELECT id, fee FROM permit_types WHERE id = $1`, [typeId])
      : await query(`SELECT id, fee FROM permit_types WHERE code = $1 OR name ILIKE $2 LIMIT 1`, [permit_type_code, `%${permit_type_code}%`]);

    if (ptRes.rows.length > 0) {
      typeId = ptRes.rows[0].id;
      fee = Number(ptRes.rows[0].fee);
    } else {
      const anyPt = await query(`SELECT id, fee FROM permit_types LIMIT 1`);
      typeId = anyPt.rows[0]?.id;
      fee = Number(anyPt.rows[0]?.fee || 20.0);
    }

    // Generate official government permit application reference number
    const refDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = randomUUID().substring(0, 4).toUpperCase();
    const referenceNumber = `NP-PERMIT-${refDate}-${randSuffix}`;
    const verificationCode = `VNP-${randomUUID().substring(0, 8).toUpperCase()}`;

    // Calculate expiry (travel_end_date + 14 days grace period, or 30 days default)
    const endDate = travel_end_date ? new Date(travel_end_date) : new Date(Date.now() + 86400000 * 30);
    const expiryDate = new Date(endDate.getTime() + 86400000 * 14);

    const appRes = await query(
      `INSERT INTO permit_applications (
        applicant_id, permit_type_id, destination_id, travel_start_date, travel_end_date,
        personal_info, documents, fee, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'under_review')
       RETURNING *`,
      [
        userId,
        typeId,
        destination_id || null,
        travel_start_date || null,
        travel_end_date || null,
        JSON.stringify({ ...personal_info, reference_number: referenceNumber, verification_code: verificationCode, expires_at: expiryDate.toISOString() }),
        JSON.stringify(documents),
        fee,
      ]
    );

    const permit = appRes.rows[0];

    // Notification for applicant
    await query(
      `INSERT INTO notifications (recipient_id, type, title, message, related_entity_id)
       VALUES ($1, 'permit_submitted', 'Permit Application Submitted', $2, $3)`,
      [userId, `Application #${referenceNumber} received and queued for officer verification.`, permit.id]
    );

    // Emit Realtime Event
    await emitRealtimeEvent({
      event: EVENT_TYPES.PERMIT_SUBMITTED,
      entity: 'permit',
      entityId: permit.id,
      action: 'submitted',
      scope: { applicantId: userId },
      metadata: { reference_number: referenceNumber, fee },
    });

    await emitRealtimeEvent({
      event: EVENT_TYPES.NOTIFICATION_CREATED,
      entity: 'notification',
      entityId: `notif-permit-${permit.id}`,
      action: 'created',
      scope: { userId },
      metadata: {
        title: 'Permit Application Submitted',
        message: `Application #${referenceNumber} received and queued for officer verification.`,
        relatedEntityId: permit.id,
      },
    });

    return sendSuccess(res, {
      ...permit,
      reference_number: referenceNumber,
      verification_code: verificationCode,
      expires_at: expiryDate.toISOString(),
    }, 201);
  } catch (err: any) {
    console.error('Submit permit error:', err);
    return sendError(res, err.message || 'Permit submission failed', 'SERVER_ERROR', 500);
  }
});

// GET /api/permits/:id/digital-permit - Retrieve digital permit credentials
router.get('/:id/digital-permit', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const pRes = await query(
      `SELECT pa.*, pt.name as permit_name, pt.code as permit_code, pt.description as permit_rules,
              p.full_name as traveler_name, p.nationality, d.name as destination_name
       FROM permit_applications pa
       JOIN permit_types pt ON pa.permit_type_id = pt.id
       LEFT JOIN profiles p ON pa.applicant_id = p.id
       LEFT JOIN destinations d ON pa.destination_id = d.id
       WHERE pa.id = $1`,
      [id]
    );

    if (pRes.rows.length === 0) {
      return sendError(res, 'Permit application not found', 'NOT_FOUND', 404);
    }

    const permit = pRes.rows[0];

    // Access authorization check
    if (permit.applicant_id !== userId && !['admin', 'super_admin', 'permit_officer'].includes(userRole)) {
      return sendError(res, 'Unauthorized access to permit details', 'FORBIDDEN', 403);
    }

    let pInfo = permit.personal_info;
    if (typeof pInfo === 'string') {
      try { pInfo = JSON.parse(pInfo); } catch (_) { pInfo = {}; }
    }

    const refNumber = pInfo?.reference_number || `NP-PERMIT-${permit.id.substring(0, 8).toUpperCase()}`;
    const verCode = pInfo?.verification_code || `VNP-${permit.id.substring(0, 6).toUpperCase()}`;
    const expiry = pInfo?.expires_at || new Date(Date.now() + 86400000 * 30).toISOString();

    const digitalPermit = {
      id: permit.id,
      referenceNumber: refNumber,
      verificationCode: verCode,
      status: permit.status,
      permitType: permit.permit_name,
      permitCode: permit.permit_code,
      travelerName: permit.traveler_name || req.user?.fullName || 'Traveler',
      destination: permit.destination_name || 'Nepal Himalayan Range',
      travelStartDate: permit.travel_start_date,
      travelEndDate: permit.travel_end_date,
      expiresAt: expiry,
      isApproved: permit.status === 'approved',
      qrPayload: `https://visitnepal.gov.np/verify-permit/${verCode}`,
      issuingAuthority: 'Department of Immigration & Tourism Board of Nepal',
      terms: 'Carry this digital permit and passport at all National Park checkpoints and TIMS counters.',
    };

    return sendSuccess(res, digitalPermit);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/permits/verify/:refCode - Public checkpost verification (No private documents exposed)
router.get('/verify/:refCode', async (req, res: Response) => {
  try {
    const { refCode } = req.params;

    // Search by reference number or verification code
    const result = await query(
      `SELECT pa.id, pa.status, pa.travel_start_date, pa.travel_end_date, pa.personal_info,
              pt.name as permit_name, pt.code as permit_code, d.name as destination_name,
              p.full_name as traveler_name
       FROM permit_applications pa
       JOIN permit_types pt ON pa.permit_type_id = pt.id
       LEFT JOIN profiles p ON pa.applicant_id = p.id
       LEFT JOIN destinations d ON pa.destination_id = d.id
       WHERE pa.id = $1 OR pa.personal_info::text ILIKE $2 LIMIT 1`,
      [refCode, `%${refCode}%`]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'No permit record found for the provided verification identifier', 'NOT_FOUND', 404);
    }

    const row = result.rows[0];
    let pInfo = row.personal_info;
    if (typeof pInfo === 'string') {
      try { pInfo = JSON.parse(pInfo); } catch (_) { pInfo = {}; }
    }

    // Public verification payload: Only safe checkpost data (NO passport copies or confidential documents)
    return sendSuccess(res, {
      isValid: row.status === 'approved',
      status: row.status,
      permitType: row.permit_name,
      permitCode: row.permit_code,
      travelerName: row.traveler_name || 'Verified Traveler',
      destination: row.destination_name || 'Nepal Protected Trekking Region',
      validFrom: row.travel_start_date,
      validUntil: pInfo?.expires_at || row.travel_end_date,
      verificationReference: refCode,
      issuingAuthority: 'Government of Nepal Tourism & Immigration Board',
    });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PUT /api/permits/:id/resubmit - Applicant supplies additional information requested by officer
router.put('/:id/resubmit', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { additional_documents = {}, updated_info = {} } = req.body;

    const pRes = await query(`SELECT * FROM permit_applications WHERE id = $1 AND applicant_id = $2`, [id, userId]);
    if (pRes.rows.length === 0) {
      return sendError(res, 'Application not found or unauthorized', 'NOT_FOUND', 404);
    }

    const current = pRes.rows[0];
    let curDocs = current.documents;
    if (typeof curDocs === 'string') {
      try { curDocs = JSON.parse(curDocs); } catch (_) { curDocs = {}; }
    }
    let curInfo = current.personal_info;
    if (typeof curInfo === 'string') {
      try { curInfo = JSON.parse(curInfo); } catch (_) { curInfo = {}; }
    }

    const mergedDocs = { ...curDocs, ...additional_documents };
    const mergedInfo = { ...curInfo, ...updated_info };

    const updateRes = await query(
      `UPDATE permit_applications SET
        status = 'under_review',
        documents = $1,
        personal_info = $2,
        updated_at = now()
       WHERE id = $3
       RETURNING *`,
      [JSON.stringify(mergedDocs), JSON.stringify(mergedInfo), id]
    );

    // Record resubmission in audit trail
    await query(
      `INSERT INTO permit_reviews (application_id, officer_id, decision, comments)
       VALUES ($1, $2, 'resubmitted', 'Applicant supplied requested documentation.')`,
      [id, userId]
    );

    return sendSuccess(res, updateRes.rows[0]);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PUT /api/permits/:id/review - Officer review (Approve / Reject / Additional Info)
router.put('/:id/review', authRequired, requireRole('admin', 'super_admin', 'verification_officer', 'permit_officer'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, review_notes } = req.body;
    const reviewerId = req.user!.id;

    if (!['approved', 'rejected', 'under_review', 'additional_information_required'].includes(status)) {
      return sendError(res, 'Invalid permit status', 'BAD_REQUEST', 400);
    }

    const updateRes = await query(
      `UPDATE permit_applications SET
        status = $1,
        review_notes = $2,
        reviewed_by = $3,
        updated_at = now()
       WHERE id = $4
       RETURNING *`,
      [status, review_notes || null, reviewerId, id]
    );

    if (updateRes.rows.length === 0) {
      return sendError(res, 'Application not found', 'NOT_FOUND', 404);
    }

    const application = updateRes.rows[0];

    // Record decision in official audit history
    await query(
      `INSERT INTO permit_reviews (application_id, officer_id, decision, comments)
       VALUES ($1, $2, $3, $4)`,
      [id, reviewerId, status, review_notes || '']
    );

    // Notify applicant
    const statusMsg = status === 'approved' 
      ? 'Congratulations! Your trek permit has been officially verified and approved. Your digital permit card is now ready.'
      : `Your permit application status is now: ${status}. Note: ${review_notes || 'Please check application details.'}`;

    await query(
      `INSERT INTO notifications (recipient_id, type, title, message, related_entity_id)
       VALUES ($1, 'permit_status', 'Permit Application Update', $2, $3)`,
      [application.applicant_id, statusMsg, id]
    );

    // Emit Realtime Events (Strictly after DB commit)
    let permitEvent: string = EVENT_TYPES.PERMIT_UNDER_REVIEW;
    if (status === 'approved') permitEvent = EVENT_TYPES.PERMIT_APPROVED;
    else if (status === 'rejected') permitEvent = EVENT_TYPES.PERMIT_REJECTED;
    else if (status === 'additional_information_required') permitEvent = EVENT_TYPES.PERMIT_ADDITIONAL_INFO_REQUIRED;

    await emitRealtimeEvent({
      event: permitEvent,
      entity: 'permit',
      entityId: id,
      action: status,
      scope: { applicantId: application.applicant_id },
      metadata: { status, review_notes: review_notes || null },
    });

    await emitRealtimeEvent({
      event: EVENT_TYPES.NOTIFICATION_CREATED,
      entity: 'notification',
      entityId: `notif-permit-rev-${id}`,
      action: 'created',
      scope: { userId: application.applicant_id },
      metadata: {
        title: 'Permit Application Update',
        message: statusMsg,
        relatedEntityId: id,
      },
    });

    return sendSuccess(res, application);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/permits/:id/audit-history - Full review audit history
router.get('/:id/audit-history', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const reviews = await query(
      `SELECT pr.*, p.full_name as officer_name, a.email as officer_email
       FROM permit_reviews pr
       LEFT JOIN profiles p ON pr.officer_id = p.id
       LEFT JOIN accounts a ON pr.officer_id = a.id
       WHERE pr.application_id = $1
       ORDER BY pr.created_at ASC`,
      [id]
    );
    return sendSuccess(res, reviews.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
