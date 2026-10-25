import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../middleware/auth';
import { emitRealtimeEvent, EVENT_TYPES } from '../services/realtime.service';

@Injectable()
export class PermitsService {
  constructor(private readonly db: DatabaseService) {}

  async getAuthorities() {
    const authorities = await this.db.query(
      `SELECT * FROM permit_authorities ORDER BY name ASC`
    );
    return authorities.rows;
  }

  async getTypes() {
    const types = await this.db.query(
      `SELECT pt.*, pa.name as authority_name, pa.contact_info as authority_contact
       FROM permit_types pt
       LEFT JOIN permit_authorities pa ON pt.authority_id = pa.id
       ORDER BY pt.name ASC`
    );
    return types.rows;
  }

  async getRequirements(typeId: string) {
    const reqs = await this.db.query(
      `SELECT * FROM permit_requirements WHERE permit_type_id = $1 ORDER BY is_mandatory DESC, document_type ASC`,
      [typeId]
    );
    return reqs.rows;
  }

  async findAll(user: AuthUser, query: { status?: string }) {
    const userId = user.id;
    const userRole = user.role;
    const { status } = query;

    let sql = `
      SELECT pa.*, pt.name as permit_name, pt.code as permit_code, pt.price, pt.currency,
             d.name as destination_name, p.full_name as applicant_name
      FROM permit_applications pa
      JOIN permit_types pt ON pa.permit_type_id = pt.id
      LEFT JOIN destinations d ON pa.destination_id = d.id
      LEFT JOIN profiles p ON pa.applicant_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (['admin', 'super_admin', 'verification_officer', 'permit_officer'].includes(userRole)) {
      if (status && status !== 'All') {
        params.push(status);
        sql += ` AND pa.status = $${params.length}`;
      }
    } else {
      params.push(userId);
      sql += ` AND pa.applicant_id = $${params.length}`;
      if (status && status !== 'All') {
        params.push(status);
        sql += ` AND pa.status = $${params.length}`;
      }
    }

    sql += ` ORDER BY pa.created_at DESC`;
    const result = await this.db.query(sql, params);
    return result.rows;
  }

  async submit(user: AuthUser, body: any) {
    const userId = user.id;
    const {
      permit_type_id,
      permit_type_code,
      destination_id,
      travel_start_date,
      travel_end_date,
      personal_info = {},
      documents = [],
    } = body;

    let targetTypeId = permit_type_id;
    if (!targetTypeId && permit_type_code) {
      const tRes = await this.db.query(`SELECT id FROM permit_types WHERE code = $1 LIMIT 1`, [permit_type_code]);
      if (tRes.rows.length > 0) targetTypeId = tRes.rows[0].id;
    }

    if (!targetTypeId) {
      const anyT = await this.db.query(`SELECT id FROM permit_types LIMIT 1`);
      targetTypeId = anyT.rows[0]?.id;
    }

    if (!travel_start_date || !travel_end_date) {
      throw new BadRequestException('Travel start and end dates are required');
    }

    const refNum = `NP-PERMIT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 899 + 100)}`;

    const insertRes = await this.db.query(
      `INSERT INTO permit_applications (
        applicant_id, permit_type_id, destination_id, travel_start_date, travel_end_date,
        personal_info, status, reference_number
      ) VALUES ($1, $2, $3, $4, $5, $6, 'under_review', $7)
      RETURNING *`,
      [
        userId,
        targetTypeId,
        destination_id || null,
        travel_start_date,
        travel_end_date,
        JSON.stringify(personal_info),
        refNum,
      ]
    );

    const permit = insertRes.rows[0];

    // Audit log
    await this.db.query(
      `INSERT INTO audit_logs (action_name, entity_name, entity_id, actor_id, payload)
       VALUES ('permit_application_created', 'permit_applications', $1, $2, $3)`,
      [permit.id, userId, JSON.stringify({ reference_number: refNum, status: 'under_review' })]
    );

    // Emit Realtime Event
    await emitRealtimeEvent({
      event: EVENT_TYPES.PERMIT_CREATED,
      entity: 'permit',
      entityId: permit.id,
      action: 'created',
      scope: {
        userId,
        isPublic: false,
      },
      metadata: {
        reference_number: refNum,
        status: 'under_review',
      },
    });

    return permit;
  }

  async getDigitalPermit(id: string, user: AuthUser) {
    const userId = user.id;
    const userRole = user.role;

    const permitRes = await this.db.query(
      `SELECT pa.*, pt.name as permit_name, pt.code as permit_code, d.name as destination_name,
              p.full_name as traveler_name
       FROM permit_applications pa
       JOIN permit_types pt ON pa.permit_type_id = pt.id
       LEFT JOIN destinations d ON pa.destination_id = d.id
       LEFT JOIN profiles p ON pa.applicant_id = p.id
       WHERE pa.id = $1`,
      [id]
    );

    if (permitRes.rows.length === 0) {
      throw new NotFoundException('Permit record not found');
    }

    const permit = permitRes.rows[0];
    const isOwner = permit.applicant_id === userId;
    const isOfficer = ['admin', 'super_admin', 'verification_officer', 'permit_officer'].includes(userRole);

    if (!isOwner && !isOfficer) {
      throw new ForbiddenException('Unauthorized to view this digital permit');
    }

    const verCode = permit.reference_number || permit.id;
    const expiry = permit.travel_end_date;

    return {
      permitId: permit.id,
      referenceNumber: permit.reference_number || `NP-TIMS-${permit.id.toString().substring(0, 6)}`,
      verificationCode: verCode,
      status: permit.status,
      permitType: permit.permit_name,
      permitCode: permit.permit_code,
      travelerName: permit.traveler_name || user.fullName || 'Traveler',
      destination: permit.destination_name || 'Nepal Himalayan Range',
      travelStartDate: permit.travel_start_date,
      travelEndDate: permit.travel_end_date,
      expiresAt: expiry,
      isApproved: permit.status === 'approved',
      qrPayload: `https://visitnepal.gov.np/verify-permit/${verCode}`,
      issuingAuthority: 'Department of Immigration & Tourism Board of Nepal',
      terms: 'Carry this digital permit and passport at all National Park checkpoints and TIMS counters.',
    };
  }

  async verifyRefCode(refCode: string) {
    const result = await this.db.query(
      `SELECT pa.id, pa.status, pa.travel_start_date, pa.travel_end_date, pa.personal_info,
              pt.name as permit_name, pt.code as permit_code, d.name as destination_name,
              p.full_name as traveler_name
       FROM permit_applications pa
       JOIN permit_types pt ON pa.permit_type_id = pt.id
       LEFT JOIN profiles p ON pa.applicant_id = p.id
       LEFT JOIN destinations d ON pa.destination_id = d.id
       WHERE pa.id = $1 OR pa.personal_info::text ILIKE $2 OR pa.reference_number = $1 LIMIT 1`,
      [refCode, `%${refCode}%`]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('No permit record found for the provided verification identifier');
    }

    const row = result.rows[0];
    let pInfo = row.personal_info;
    if (typeof pInfo === 'string') {
      try { pInfo = JSON.parse(pInfo); } catch (_) { pInfo = {}; }
    }

    // Public checkpost verification payload: Only safe checkpost data (NO passport numbers or confidential uploads)
    return {
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
    };
  }

  async resubmit(id: string, user: AuthUser, body: any) {
    const { documents, personal_info } = body;
    const userId = user.id;

    const permitRes = await this.db.query(`SELECT * FROM permit_applications WHERE id = $1`, [id]);
    if (permitRes.rows.length === 0) {
      throw new NotFoundException('Permit not found');
    }

    const permit = permitRes.rows[0];
    if (permit.applicant_id !== userId) {
      throw new ForbiddenException('Unauthorized to resubmit this permit');
    }

    await this.db.query(
      `UPDATE permit_applications SET
        status = 'under_review',
        personal_info = COALESCE($1, personal_info),
        updated_at = now()
       WHERE id = $2`,
      [personal_info ? JSON.stringify(personal_info) : null, id]
    );

    return { message: 'Permit resubmitted successfully', status: 'under_review' };
  }

  async review(id: string, user: AuthUser, body: any) {
    const { status, review_notes } = body;
    const actorId = user.id;

    if (!['approved', 'rejected', 'under_review'].includes(status)) {
      throw new BadRequestException('Invalid review status');
    }

    const updateRes = await this.db.query(
      `UPDATE permit_applications SET
        status = $1,
        review_notes = $2,
        reviewer_id = $3,
        updated_at = now()
       WHERE id = $4
       RETURNING *`,
      [status, review_notes || null, actorId, id]
    );

    if (updateRes.rows.length === 0) {
      throw new NotFoundException('Permit application not found');
    }

    const permit = updateRes.rows[0];

    // Audit log
    await this.db.query(
      `INSERT INTO audit_logs (action_name, entity_name, entity_id, actor_id, payload)
       VALUES ('permit_reviewed', 'permit_applications', $1, $2, $3)`,
      [id, actorId, JSON.stringify({ status, review_notes })]
    );

    // Notify traveler
    const title = status === 'approved' ? 'Permit Approved!' : 'Permit Application Update';
    const msg = status === 'approved'
      ? 'Your official trekking permit has been approved and issued by the Department of Immigration.'
      : `Permit application update: ${status}. ${review_notes || ''}`;

    await this.db.query(
      `INSERT INTO notifications (recipient_id, type, title, message, related_entity_id)
       VALUES ($1, 'permit_status', $2, $3, $4)`,
      [permit.applicant_id, title, msg, id]
    );

    // Emit Realtime Event
    await emitRealtimeEvent({
      event: status === 'approved' ? EVENT_TYPES.PERMIT_APPROVED : EVENT_TYPES.PERMIT_REJECTED,
      entity: 'permit',
      entityId: id,
      action: status,
      scope: {
        userId: permit.applicant_id,
        isPublic: false,
      },
      metadata: { status, review_notes, permitId: id },
    });

    return permit;
  }

  async getAuditHistory(id: string, user: AuthUser) {
    const auditRes = await this.db.query(
      `SELECT al.*, a.email as actor_email, p.full_name as actor_name
       FROM audit_logs al
       LEFT JOIN accounts a ON al.actor_id = a.id
       LEFT JOIN profiles p ON a.id = p.id
       WHERE al.entity_id = $1
       ORDER BY al.created_at DESC`,
      [id]
    );
    return auditRes.rows;
  }
}
