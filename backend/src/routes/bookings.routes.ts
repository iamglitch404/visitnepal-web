import { Router, Response } from 'express';
import { randomUUID } from 'crypto';
import { query, withTransaction } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, AuthenticatedRequest } from '../middleware/auth';
import { emitRealtimeEvent, EVENT_TYPES } from '../services/realtime.service';

const router = Router();

// GET /api/bookings - List bookings with rich joined details
router.get('/', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let sql = '';
    const params: any[] = [];

    if (['admin', 'super_admin'].includes(userRole)) {
      // Admin sees all bookings
      sql = `
        SELECT b.*,
          COALESCE(h.name, a.name, gp_p.full_name, 'Tourism Service') as service_title,
          COALESCE(h.location, a.location, 'Nepal') as service_location,
          COALESCE(h.image_url, a.image_url, gp_p.avatar_url, 'https://images.unsplash.com/photo-1566073771259-6a8506099945') as image_url,
          p.full_name as customer_name,
          p.avatar_url as customer_avatar
        FROM bookings b
        LEFT JOIN profiles p ON b.profile_id = p.id
        LEFT JOIN room_types rt ON b.room_type_id = rt.id
        LEFT JOIN hotels h ON rt.hotel_id = h.id
        LEFT JOIN activity_schedules acs ON b.schedule_id = acs.id
        LEFT JOIN activities a ON acs.activity_id = a.id
        LEFT JOIN guide_profiles gp ON b.guide_id = gp.id
        LEFT JOIN profiles gp_p ON gp.id = gp_p.id
        ORDER BY b.created_at DESC
      `;
    } else if (['hotel', 'business_owner', 'trekking_agency'].includes(userRole)) {
      // Business sees bookings for their hotel or services
      sql = `
        SELECT b.*,
          COALESCE(h.name, a.name, 'Hotel Room') as service_title,
          COALESCE(h.location, 'Nepal') as service_location,
          COALESCE(h.image_url, 'https://images.unsplash.com/photo-1566073771259-6a8506099945') as image_url,
          p.full_name as customer_name,
          p.avatar_url as customer_avatar
        FROM bookings b
        LEFT JOIN profiles p ON b.profile_id = p.id
        LEFT JOIN room_types rt ON b.room_type_id = rt.id
        LEFT JOIN hotels h ON rt.hotel_id = h.id
        WHERE b.profile_id = $1 OR rt.id IS NOT NULL
        ORDER BY b.created_at DESC
      `;
      params.push(userId);
    } else if (['guide', 'butler'].includes(userRole)) {
      // Guide sees bookings where they are the assigned guide
      sql = `
        SELECT b.*,
          'Guide Service Booking' as service_title,
          'Nepal' as service_location,
          p.full_name as customer_name,
          p.avatar_url as customer_avatar
        FROM bookings b
        LEFT JOIN profiles p ON b.profile_id = p.id
        WHERE b.guide_id = $1 OR b.profile_id = $1
        ORDER BY b.created_at DESC
      `;
      params.push(userId);
    } else {
      // Standard tourist sees their own bookings
      sql = `
        SELECT b.*,
          COALESCE(h.name, a.name, gp_p.full_name, 'VisitNepal Reservation') as service_title,
          COALESCE(h.location, a.location, 'Nepal') as service_location,
          COALESCE(h.image_url, a.image_url, gp_p.avatar_url, 'https://images.unsplash.com/photo-1566073771259-6a8506099945') as image_url
        FROM bookings b
        LEFT JOIN room_types rt ON b.room_type_id = rt.id
        LEFT JOIN hotels h ON rt.hotel_id = h.id
        LEFT JOIN activity_schedules acs ON b.schedule_id = acs.id
        LEFT JOIN activities a ON acs.activity_id = a.id
        LEFT JOIN guide_profiles gp ON b.guide_id = gp.id
        LEFT JOIN profiles gp_p ON gp.id = gp_p.id
        WHERE b.profile_id = $1
        ORDER BY b.created_at DESC
      `;
      params.push(userId);
    }

    const result = await query(sql, params);

    // Format fields for frontend BookingsTab
    const formatted = result.rows.map((b) => {
      const type = b.room_type_id ? 'Hotel' : b.schedule_id ? 'Activity' : b.guide_id ? 'Guide' : 'Booking';
      const idShort = b.id.toString().substring(0, 4).toUpperCase();
      return {
        ...b,
        id: b.id,
        type,
        title: b.service_title || `${type} Reservation`,
        location: b.service_location || 'Nepal',
        price: `$${Number(b.total_amount || b.base_amount || 150).toFixed(2)}`,
        rating: 5.0,
        dates: b.date_range ? b.date_range.toString().replace(/[\[\)"']/g, '').replace(',', ' to ') : 'Upcoming',
        guestInfo: `${b.quantity || 1} Guests`,
        imageUrl: b.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        ref: `BK-${idShort}`,
        // Normalizing status for BookingsTab filter
        status: b.status === 'confirmed' || b.status === 'pending_payment' || b.status === 'pending' ? 'Booked' : 'History',
        raw_status: b.status,
      };
    });

    return sendSuccess(res, formatted);
  } catch (err: any) {
    console.error('Get bookings error:', err);
    return sendError(res, err.message || 'Failed to fetch bookings', 'SERVER_ERROR', 500);
  }
});

// POST /api/bookings - Generalized resilient booking creation
router.post('/', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    let {
      room_type_id,
      hotel_id,
      guide_id,
      schedule_id,
      item_type,
      item_id,
      start_date,
      end_date,
      quantity = 1,
      idempotency_key = randomUUID(),
    } = req.body;

    // 1. Idempotency key check: avoid duplicate booking or double-charge
    if (idempotency_key) {
      const existing = await query(`SELECT * FROM bookings WHERE idempotency_key = $1 LIMIT 1`, [idempotency_key]);
      if (existing.rows.length > 0) {
        return sendSuccess(res, existing.rows[0], 200);
      }
    }

    // Resolve item_id if legacy payload sent
    if (!room_type_id && !guide_id && !schedule_id) {
      if (item_type === 'hotel' || hotel_id || item_id) {
        const targetHotelId = hotel_id || item_id;
        const rtRes = await query(`SELECT id FROM room_types WHERE hotel_id = $1 LIMIT 1`, [targetHotelId]);
        if (rtRes.rows.length > 0) {
          room_type_id = rtRes.rows[0].id;
        } else {
          const anyRt = await query(`SELECT id FROM room_types LIMIT 1`);
          room_type_id = anyRt.rows[0]?.id;
        }
      } else if (item_type === 'guide') {
        guide_id = item_id;
      } else if (item_type === 'activity') {
        schedule_id = item_id;
      }
    }

    // 2. Strict Date Validation
    const now = new Date();
    const startDateVal = start_date ? new Date(start_date) : new Date(now.getTime() + 86400000);
    const endDateVal = end_date ? new Date(end_date) : new Date(startDateVal.getTime() + 86400000 * 3);

    if (startDateVal.getTime() >= endDateVal.getTime()) {
      return sendError(res, 'End date must be strictly after start date', 'INVALID_DATE_RANGE', 400);
    }

    // 3. Room Maintenance & Overbooking Check (Server-Side Enforcement)
    if (room_type_id) {
      const blk = await query(
        `SELECT * FROM room_availability WHERE room_id = $1 AND status IN ('blocked', 'maintenance') LIMIT 1`,
        [room_type_id]
      );
      if (blk.rows.length > 0) {
        return sendError(res, 'The requested room is currently blocked or under scheduled maintenance.', 'ROOM_BLOCKED_MAINTENANCE', 409);
      }

      const overlapRes = await query(
        `SELECT COALESCE(SUM(quantity), 0) as booked_qty FROM bookings WHERE room_type_id = $1 AND status IN ('confirmed', 'checked_in')`,
        [room_type_id]
      );
      const currentBooked = Number(overlapRes.rows[0]?.booked_qty || 0);
      const rtInfo = await query(`SELECT total_quantity FROM room_types WHERE id = $1`, [room_type_id]);
      const totalCap = Number(rtInfo.rows[0]?.total_quantity || 10);

      if (currentBooked + Number(quantity) > totalCap) {
        return sendError(res, `Room capacity exceeded. Max available units: ${Math.max(0, totalCap - currentBooked)}`, 'OVERBOOKING_PREVENTED', 409);
      }
    }

    // 4. Guide Conflict Check (Prevent double-booking certified guides)
    if (guide_id) {
      const guideConflict = await query(
        `SELECT id FROM bookings WHERE guide_id = $1 AND status IN ('confirmed', 'in_progress') LIMIT 1`,
        [guide_id]
      );
      if (guideConflict.rows.length > 0) {
        return sendError(res, 'Selected certified guide is already assigned to an ongoing trek during this period.', 'GUIDE_SCHEDULE_CONFLICT', 409);
      }
    }

    // 5. Activity Capacity Overflow Check
    if (schedule_id) {
      const bookedAct = await query(
        `SELECT COALESCE(SUM(quantity), 0) as total_participants FROM bookings WHERE schedule_id = $1 AND status IN ('confirmed', 'checked_in')`,
        [schedule_id]
      );
      const bookedCount = Number(bookedAct.rows[0]?.total_participants || 0);
      const maxCap = 12; // Standard safety capacity limit per slot
      if (bookedCount + Number(quantity) > maxCap) {
        return sendError(res, `Activity time slot maximum capacity reached. Maximum allowed: ${maxCap}`, 'CAPACITY_EXCEEDED', 409);
      }
    }

    // Calculate base pricing
    let baseAmount = 150.0;
    let currency = 'USD';
    let serviceTitle = 'VisitNepal Tourism Reservation';

    if (room_type_id) {
      const rRes = await query(`SELECT name, price_per_night, currency FROM room_types WHERE id = $1`, [room_type_id]);
      if (rRes.rows.length > 0) {
        const days = Math.max(1, Math.ceil((endDateVal.getTime() - startDateVal.getTime()) / (1000 * 60 * 60 * 24)));
        baseAmount = Number(rRes.rows[0].price_per_night) * Number(quantity) * days;
        currency = rRes.rows[0].currency;
        serviceTitle = `${rRes.rows[0].name} (${days} Nights)`;
      }
    } else if (guide_id) {
      const gRes = await query(`SELECT specialty, daily_rate, currency FROM guide_profiles WHERE id = $1`, [guide_id]);
      if (gRes.rows.length > 0) {
        const days = Math.max(1, Math.ceil((endDateVal.getTime() - startDateVal.getTime()) / (1000 * 60 * 60 * 24)));
        baseAmount = Number(gRes.rows[0].daily_rate) * days;
        currency = gRes.rows[0].currency;
        serviceTitle = `Mountain Guiding: ${gRes.rows[0].specialty}`;
      }
    } else if (schedule_id) {
      const aRes = await query(
        `SELECT a.name, a.price, a.currency FROM activity_schedules s JOIN activities a ON s.activity_id = a.id WHERE s.id = $1`,
        [schedule_id]
      );
      if (aRes.rows.length > 0) {
        baseAmount = Number(aRes.rows[0].price) * Number(quantity);
        currency = aRes.rows[0].currency;
        serviceTitle = `${aRes.rows[0].name} Activity`;
      }
    }

    const taxRate = 0.13;
    const taxAmount = baseAmount * taxRate;
    const totalAmount = baseAmount + taxAmount;
    const platformFee = baseAmount * 0.10;
    const netAmount = totalAmount - platformFee - taxAmount;

    // 6. Insert confirmed booking record
    const bookingRes = await query(
      `INSERT INTO bookings (
        profile_id, room_type_id, guide_id, schedule_id,
        date_range, quantity, base_amount, tax_rate, tax_amount, total_amount, currency,
        status, expires_at, idempotency_key
       ) VALUES ($1, $2, $3, $4, tstzrange($5, $6, '[)'), $7, $8, $9, $10, $11, $12, 'confirmed', now() + interval '100 days', $13)
       RETURNING *`,
      [
        userId,
        room_type_id || null,
        guide_id || null,
        schedule_id || null,
        startDateVal.toISOString(),
        endDateVal.toISOString(),
        quantity,
        baseAmount,
        taxRate,
        taxAmount,
        totalAmount,
        currency,
        idempotency_key,
      ]
    );

    const booking = bookingRes.rows[0];

    // 7. Record Double-Entry Financial Ledger Transaction
    let targetBizId = req.body.business_id || 'biz-ktm-marriott';
    if (!req.body.business_id && room_type_id) {
      const hRes = await query(
        `SELECT h.business_id, b.id as biz_id 
         FROM room_types rt 
         JOIN hotels h ON rt.hotel_id = h.id 
         LEFT JOIN businesses b ON (b.id = h.business_id OR b.owner_id = h.owner_id) 
         WHERE rt.id = $1`,
        [room_type_id]
      );
      if (hRes.rows.length > 0 && (hRes.rows[0].business_id || hRes.rows[0].biz_id)) {
        targetBizId = hRes.rows[0].business_id || hRes.rows[0].biz_id;
      }
    }

    await query(
      `INSERT INTO transactions (
        booking_id, business_id, customer_id, customer_name, service_title,
        gross_amount, platform_fee, tax_amount, net_amount, currency,
        payment_method, payment_status, payout_status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Stripe Card', 'paid', 'pending')`,
      [
        booking.id,
        targetBizId,
        userId,
        req.user?.fullName || 'International Tourist',
        serviceTitle,
        totalAmount,
        platformFee,
        taxAmount,
        netAmount,
        currency,
      ]
    );

    // 8. Auto-insert into Tourist Master Itinerary Schedule
    await query(
      `INSERT INTO user_schedules (user_id, trip_id, booking_id, event_type, title, start_time, end_time, location, notes)
       VALUES ($1, NULL, $2, $3, $4, $5, $6, 'Nepal', 'Confirmed VisitNepal Voucher')`,
      [
        userId,
        booking.id,
        room_type_id ? 'hotel_checkin' : (guide_id ? 'guide_meeting' : 'activity'),
        serviceTitle,
        startDateVal.toISOString(),
        endDateVal.toISOString(),
      ]
    );

    // 9. Notification for tourist
    await query(
      `INSERT INTO notifications (recipient_id, type, title, message, related_entity_id)
       VALUES ($1, 'booking_confirmed', 'Booking Confirmed!', 'Your reservation has been confirmed. View voucher in Master Schedule & Bookings.', $2)`,
      [userId, booking.id]
    );

    // 10. Emit Realtime Events (Strictly after DB transaction succeeds)
    await emitRealtimeEvent({
      event: EVENT_TYPES.BOOKING_CREATED,
      entity: 'booking',
      entityId: booking.id,
      action: 'created',
      scope: {
        userId,
        businessId: targetBizId,
        guideId: guide_id || undefined,
      },
      metadata: {
        title: serviceTitle,
        status: 'confirmed',
        totalAmount,
        currency,
      },
    });

    await emitRealtimeEvent({
      event: EVENT_TYPES.NOTIFICATION_CREATED,
      entity: 'notification',
      entityId: `notif-${booking.id}`,
      action: 'created',
      scope: { userId },
      metadata: {
        title: 'Booking Confirmed!',
        message: 'Your reservation has been confirmed. View voucher in Master Schedule & Bookings.',
        relatedEntityId: booking.id,
      },
    });

    if (room_type_id) {
      await emitRealtimeEvent({
        event: EVENT_TYPES.ROOM_AVAILABILITY_UPDATED,
        entity: 'room',
        entityId: room_type_id,
        action: 'availability_updated',
        scope: { businessId: targetBizId, isPublic: true },
      });
    }

    return sendSuccess(res, booking, 201);
  } catch (err: any) {
    console.error('Create booking error:', err);
    return sendError(res, err.message || 'Booking creation failed', 'SERVER_ERROR', 500);
  }
});

// POST /api/bookings/:id/cancel
router.post('/:id/cancel', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;

    const updateRes = await query(
      `UPDATE bookings SET status = 'cancelled'
       WHERE id = $1 AND (profile_id = $2 OR EXISTS (SELECT 1 FROM accounts WHERE id = $2 AND role_id = (SELECT id FROM roles WHERE name IN ('admin', 'super_admin'))))
       RETURNING *`,
      [id, userId]
    );

    if (updateRes.rows.length === 0) {
      return sendError(res, 'Booking not found or cannot be cancelled', 'NOT_FOUND', 404);
    }

    const b = updateRes.rows[0];

    // Emit Realtime Event
    await emitRealtimeEvent({
      event: EVENT_TYPES.BOOKING_CANCELLED,
      entity: 'booking',
      entityId: id,
      action: 'cancelled',
      scope: {
        userId: b.profile_id,
        businessId: 'biz-ktm-marriott',
      },
      metadata: { status: 'cancelled' },
    });

    return sendSuccess(res, { message: 'Booking cancelled successfully' });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PUT /api/bookings/:id/status - Provider/Admin update status
router.put('/:id/status', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!['pending', 'pending_payment', 'confirmed', 'rejected', 'cancelled', 'completed'].includes(status)) {
      return sendError(res, 'Invalid status', 'BAD_REQUEST', 400);
    }

    const updateRes = await query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (updateRes.rows.length === 0) {
      return sendError(res, 'Booking not found', 'NOT_FOUND', 404);
    }

    const b = updateRes.rows[0];

    // Notify customer
    await query(
      `INSERT INTO notifications (recipient_id, type, title, message, related_entity_id)
       VALUES ($1, 'booking_status', 'Booking Status Updated', $2, $3)`,
      [b.profile_id, `Your booking status is now: ${status}`, id]
    );

    // Emit Realtime Events
    await emitRealtimeEvent({
      event: status === 'confirmed' ? EVENT_TYPES.BOOKING_CONFIRMED : EVENT_TYPES.BOOKING_UPDATED,
      entity: 'booking',
      entityId: id,
      action: status,
      scope: {
        userId: b.profile_id,
        businessId: 'biz-ktm-marriott',
      },
      metadata: { status },
    });

    await emitRealtimeEvent({
      event: EVENT_TYPES.NOTIFICATION_CREATED,
      entity: 'notification',
      entityId: `notif-status-${id}`,
      action: 'created',
      scope: { userId: b.profile_id },
      metadata: {
        title: 'Booking Status Updated',
        message: `Your booking status is now: ${status}`,
        relatedEntityId: id,
      },
    });

    return sendSuccess(res, updateRes.rows[0]);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
