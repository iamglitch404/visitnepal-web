import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../middleware/auth';
import { emitRealtimeEvent, EVENT_TYPES } from '../services/realtime.service';

@Injectable()
export class BookingsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(user: AuthUser) {
    const userId = user.id;
    const userRole = user.role;

    let sql = '';
    const params: any[] = [];

    if (['admin', 'super_admin'].includes(userRole)) {
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
        WHERE b.profile_id = $1 OR b.business_id IN (SELECT id FROM businesses WHERE owner_id = $1)
        ORDER BY b.created_at DESC
      `;
      params.push(userId);
    } else if (['guide', 'butler'].includes(userRole)) {
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

    const result = await this.db.query(sql, params);

    return result.rows.map((b) => {
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
        status: b.status === 'confirmed' || b.status === 'pending_payment' || b.status === 'pending' ? 'Booked' : 'History',
        raw_status: b.status,
      };
    });
  }

  async create(user: AuthUser, body: any): Promise<{ booking: any; isExisting?: boolean }> {
    const userId = user.id;
    let {
      room_type_id,
      hotel_id,
      guide_id,
      schedule_id,
      item_type,
      item_id,
      quantity = 1,
      start_date,
      end_date,
      special_requests = '',
      idempotency_key,
      business_id,
    } = body;

    // 1. Idempotency check
    if (idempotency_key) {
      const existing = await this.db.query(
        `SELECT * FROM bookings WHERE profile_id = $1 AND idempotency_key = $2 LIMIT 1`,
        [userId, idempotency_key]
      );
      if (existing.rows.length > 0) {
        return { booking: existing.rows[0], isExisting: true };
      }
    }

    // Resolve item_id
    if (!room_type_id && !guide_id && !schedule_id) {
      if (item_type === 'hotel' || hotel_id || item_id) {
        const targetHotelId = hotel_id || item_id;
        const rtRes = await this.db.query(`SELECT id FROM room_types WHERE hotel_id = $1 LIMIT 1`, [targetHotelId]);
        if (rtRes.rows.length > 0) {
          room_type_id = rtRes.rows[0].id;
        } else {
          const anyRt = await this.db.query(`SELECT id FROM room_types LIMIT 1`);
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
      throw new HttpException(
        {
          code: 'INVALID_DATE_RANGE',
          message: 'End date must be strictly after start date',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    // 3. Room Maintenance & Overbooking Check
    if (room_type_id) {
      const blk = await this.db.query(
        `SELECT * FROM room_availability WHERE room_id = $1 AND status IN ('blocked', 'maintenance') LIMIT 1`,
        [room_type_id]
      );
      if (blk.rows.length > 0) {
        throw new HttpException(
          {
            code: 'ROOM_BLOCKED_MAINTENANCE',
            message: 'The requested room is currently blocked or under scheduled maintenance.',
          },
          HttpStatus.CONFLICT
        );
      }

      const overlapRes = await this.db.query(
        `SELECT COALESCE(SUM(quantity), 0) as booked_qty FROM bookings WHERE room_type_id = $1 AND status IN ('confirmed', 'checked_in')`,
        [room_type_id]
      );
      const currentBooked = Number(overlapRes.rows[0]?.booked_qty || 0);
      const rtInfo = await this.db.query(`SELECT total_quantity FROM room_types WHERE id = $1`, [room_type_id]);
      const totalCap = Number(rtInfo.rows[0]?.total_quantity || 10);

      if (currentBooked + Number(quantity) > totalCap) {
        throw new HttpException(
          {
            code: 'OVERBOOKING_PREVENTED',
            message: `Room capacity exceeded. Max available units: ${Math.max(0, totalCap - currentBooked)}`,
          },
          HttpStatus.CONFLICT
        );
      }
    }

    // 4. Guide Conflict Check
    if (guide_id) {
      const guideConflict = await this.db.query(
        `SELECT id FROM bookings WHERE guide_id = $1 AND status IN ('confirmed', 'in_progress') LIMIT 1`,
        [guide_id]
      );
      if (guideConflict.rows.length > 0) {
        throw new HttpException(
          {
            code: 'GUIDE_SCHEDULE_CONFLICT',
            message: 'Selected certified guide is already assigned to an ongoing trek during this period.',
          },
          HttpStatus.CONFLICT
        );
      }
    }

    // 5. Activity Capacity Overflow Check
    if (schedule_id) {
      const bookedAct = await this.db.query(
        `SELECT COALESCE(SUM(quantity), 0) as total_participants FROM bookings WHERE schedule_id = $1 AND status IN ('confirmed', 'checked_in')`,
        [schedule_id]
      );
      const bookedCount = Number(bookedAct.rows[0]?.total_participants || 0);
      const maxCap = 12;
      if (bookedCount + Number(quantity) > maxCap) {
        throw new HttpException(
          {
            code: 'CAPACITY_EXCEEDED',
            message: `Activity time slot maximum capacity reached. Maximum allowed: ${maxCap}`,
          },
          HttpStatus.CONFLICT
        );
      }
    }

    // Pricing calculation
    let baseAmount = 150.0;
    let currency = 'USD';
    let serviceTitle = 'VisitNepal Tourism Reservation';

    if (room_type_id) {
      const rRes = await this.db.query(`SELECT name, price_per_night, currency FROM room_types WHERE id = $1`, [room_type_id]);
      if (rRes.rows.length > 0) {
        const days = Math.max(1, Math.ceil((endDateVal.getTime() - startDateVal.getTime()) / (1000 * 60 * 60 * 24)));
        baseAmount = Number(rRes.rows[0].price_per_night) * Number(quantity) * days;
        currency = rRes.rows[0].currency;
        serviceTitle = `${rRes.rows[0].name} (${days} Nights)`;
      }
    } else if (guide_id) {
      const gRes = await this.db.query(`SELECT specialty, daily_rate, currency FROM guide_profiles WHERE id = $1`, [guide_id]);
      if (gRes.rows.length > 0) {
        const days = Math.max(1, Math.ceil((endDateVal.getTime() - startDateVal.getTime()) / (1000 * 60 * 60 * 24)));
        baseAmount = Number(gRes.rows[0].daily_rate) * days;
        currency = gRes.rows[0].currency;
        serviceTitle = `Mountain Guiding: ${gRes.rows[0].specialty}`;
      }
    } else if (schedule_id) {
      const aRes = await this.db.query(
        `SELECT a.name, a.price, a.currency FROM activity_schedules s JOIN activities a ON s.activity_id = a.id WHERE s.id = $1`,
        [schedule_id]
      );
      if (aRes.rows.length > 0) {
        baseAmount = Number(aRes.rows[0].price) * Number(quantity);
        currency = aRes.rows[0].currency;
        serviceTitle = `${aRes.rows[0].name} Activity`;
      }
    }

    const taxAmount = Number((baseAmount * 0.13).toFixed(2));
    const totalAmount = Number((baseAmount + taxAmount).toFixed(2));
    const dateRangeStr = `[${startDateVal.toISOString().split('T')[0]}, ${endDateVal.toISOString().split('T')[0]})`;

    const bookingRes = await this.db.query(
      `INSERT INTO bookings (
        profile_id, room_type_id, guide_id, schedule_id,
        date_range, quantity, total_amount, base_amount,
        status, special_requests, idempotency_key, business_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10, $11)
      RETURNING *`,
      [
        userId,
        room_type_id || null,
        guide_id || null,
        schedule_id || null,
        dateRangeStr,
        quantity,
        totalAmount,
        baseAmount,
        special_requests,
        idempotency_key || randomUUID(),
        business_id || null,
      ]
    );

    const saved = bookingRes.rows[0];

    // Emit Realtime Event
    await emitRealtimeEvent({
      event: EVENT_TYPES.BOOKING_CREATED,
      entity: 'booking',
      entityId: saved.id,
      action: 'created',
      scope: {
        userId,
        businessId: business_id || undefined,
        isPublic: false,
      },
      metadata: {
        bookingId: saved.id,
        serviceTitle,
        totalAmount,
        status: 'pending',
      },
    });

    // Send instant notification
    await this.db.query(
      `INSERT INTO notifications (recipient_id, type, title, message, related_entity_id)
       VALUES ($1, 'booking_update', 'Booking Received', $2, $3)`,
      [userId, `Your booking for ${serviceTitle} has been created. Reference: BK-${saved.id.toString().substring(0, 4).toUpperCase()}`, saved.id]
    );

    await emitRealtimeEvent({
      event: EVENT_TYPES.NOTIFICATION_CREATED,
      entity: 'notification',
      entityId: `notif-${saved.id}`,
      action: 'created',
      scope: { userId },
      metadata: {
        title: 'Booking Confirmed!',
        message: `Your booking for ${serviceTitle} has been created.`,
        relatedEntityId: saved.id,
      },
    });

    return { booking: saved };
  }

  async cancel(id: string, user: AuthUser, reason?: string) {
    const bRes = await this.db.query(`SELECT * FROM bookings WHERE id = $1`, [id]);
    if (bRes.rows.length === 0) {
      throw new NotFoundException('Booking not found');
    }

    const booking = bRes.rows[0];
    if (booking.profile_id !== user.id && !['admin', 'super_admin'].includes(user.role)) {
      throw new ForbiddenException('Unauthorized to cancel this booking');
    }

    await this.db.query(`UPDATE bookings SET status = 'cancelled', updated_at = now() WHERE id = $1`, [id]);

    await emitRealtimeEvent({
      event: EVENT_TYPES.BOOKING_CANCELLED,
      entity: 'booking',
      entityId: id,
      action: 'cancelled',
      scope: {
        userId: booking.profile_id,
        businessId: booking.business_id,
      },
      metadata: { status: 'cancelled', reason: reason || 'Customer requested' },
    });

    return { message: 'Booking cancelled successfully' };
  }

  async updateStatus(id: string, user: AuthUser, status: string) {
    const bRes = await this.db.query(`SELECT * FROM bookings WHERE id = $1`, [id]);
    if (bRes.rows.length === 0) {
      throw new NotFoundException('Booking not found');
    }

    const booking = bRes.rows[0];
    await this.db.query(`UPDATE bookings SET status = $1, updated_at = now() WHERE id = $2`, [status, id]);

    await emitRealtimeEvent({
      event: EVENT_TYPES.BOOKING_UPDATED,
      entity: 'booking',
      entityId: id,
      action: status,
      scope: {
        userId: booking.profile_id,
        businessId: booking.business_id,
      },
      metadata: { status },
    });

    return { message: `Booking status updated to ${status}` };
  }
}
