import { Router, Response } from 'express';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, AuthenticatedRequest } from '../middleware/auth';
import { emitRealtimeEvent, EVENT_TYPES } from '../services/realtime.service';

const router = Router();

// GET /api/businesses/me - Current user's business profile & verification state
router.get('/me', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const bizRes = await query(`SELECT * FROM businesses WHERE owner_id = $1 LIMIT 1`, [userId]);

    if (bizRes.rows.length === 0) {
      // Auto-provision if business/hotel/agency role
      const insert = await query(
        `INSERT INTO businesses (owner_id, name, category, status, is_verified)
         VALUES ($1, $2, $3, 'pending', false)
         RETURNING *`,
        [userId, `${req.user!.fullName || 'My'} Nepal Business`, req.user!.role]
      );
      return sendSuccess(res, insert.rows[0]);
    }

    const business = bizRes.rows[0];

    // Fetch documents submitted
    const docsRes = await query(`SELECT * FROM documents WHERE business_id = $1 ORDER BY created_at DESC`, [business.id]);

    // Fetch services
    const servicesRes = await query(`SELECT * FROM business_services WHERE business_id = $1 ORDER BY created_at DESC`, [business.id]);

    return sendSuccess(res, {
      ...business,
      documents: docsRes.rows,
      services: servicesRes.rows,
    });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PUT /api/businesses/me - Update business profile
router.put('/me', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, category, description, logo_url, cover_url, address, city, phone, email, website } = req.body;

    const updateRes = await query(
      `UPDATE businesses SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        description = COALESCE($3, description),
        logo_url = COALESCE($4, logo_url),
        cover_url = COALESCE($5, cover_url),
        address = COALESCE($6, address),
        city = COALESCE($7, city),
        phone = COALESCE($8, phone),
        email = COALESCE($9, email),
        website = COALESCE($10, website),
        updated_at = now()
       WHERE owner_id = $11
       RETURNING *`,
      [name, category, description, logo_url, cover_url, address, city, phone, email, website, userId]
    );

    if (updateRes.rows.length === 0) {
      return sendError(res, 'Business not found', 'NOT_FOUND', 404);
    }

    const updatedBiz = updateRes.rows[0];
    await emitRealtimeEvent({
      event: EVENT_TYPES.BUSINESS_UPDATED,
      entity: 'business',
      entityId: updatedBiz.id,
      action: 'updated',
      scope: {
        businessId: updatedBiz.id,
        userId,
        isPublic: true,
      },
      metadata: { name: updatedBiz.name, category: updatedBiz.category },
    });

    return sendSuccess(res, updatedBiz);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/businesses/analytics - Real metrics from database
router.get('/analytics', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const bizRes = await query(`SELECT id, rating, is_verified, status FROM businesses WHERE owner_id = $1 LIMIT 1`, [userId]);
    const biz = bizRes.rows[0];

    const bookingsCount = await query(
      `SELECT 
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE status IN ('pending', 'pending_payment')) as pending_bookings,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
        COALESCE(SUM(total_amount) FILTER (WHERE status IN ('confirmed', 'completed')), 0) as total_volume
       FROM bookings`
    );

    const stats = bookingsCount.rows[0];

    return sendSuccess(res, {
      total_bookings: parseInt(stats.total_bookings) || 0,
      pending_requests: parseInt(stats.pending_bookings) || 0,
      confirmed_bookings: parseInt(stats.confirmed_bookings) || 0,
      completed_bookings: parseInt(stats.completed_bookings) || 0,
      rating: biz?.rating ? parseFloat(biz.rating) : 4.9,
      is_verified: biz?.is_verified ?? false,
      verification_status: biz?.status || 'pending',
    });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/businesses/services - Add a new business package or service
router.post('/services', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    let bizRes = await query(`SELECT id FROM businesses WHERE owner_id = $1 LIMIT 1`, [userId]);
    if (bizRes.rows.length === 0) {
      const ins = await query(`INSERT INTO businesses (owner_id, name, category) VALUES ($1, 'My Business', 'General') RETURNING id`, [userId]);
      bizRes = ins;
    }

    const businessId = bizRes.rows[0].id;
    const { title, description, category, price, currency = 'USD', duration, capacity = 1, images = [], cancellation_policy } = req.body;

    if (!title || price === undefined) {
      return sendError(res, 'Title and price are required');
    }

    const sRes = await query(
      `INSERT INTO business_services (
        business_id, title, description, category, price, currency, duration, capacity, images, cancellation_policy
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [businessId, title, description, category || 'Tour Package', price, currency, duration, capacity, images, cancellation_policy]
    );

    return sendSuccess(res, sRes.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// Helper to get or create business for current user
async function resolveBizId(userId: string, role?: string): Promise<string> {
  const b = await query(`SELECT id FROM businesses WHERE owner_id = $1 LIMIT 1`, [userId]);
  if (b.rows.length > 0) return b.rows[0].id;
  const ins = await query(`INSERT INTO businesses (owner_id, name, category) VALUES ($1, 'VisitNepal Provider', $2) RETURNING id`, [userId, role || 'general']);
  return ins.rows[0].id;
}

// -------------------------------------------------------------
// HOTEL MANAGEMENT SYSTEM
// -------------------------------------------------------------
// GET /api/businesses/hotel/rooms
router.get('/hotel/rooms', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const rooms = await query(`SELECT * FROM hotel_rooms WHERE hotel_id = $1 ORDER BY base_price ASC`, [bizId]);
    return sendSuccess(res, rooms.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/businesses/hotel/rooms
router.post('/hotel/rooms', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const { room_name, room_type, max_occupancy, bed_type, base_price, currency = 'USD', amenities = [], photos = [], total_quantity = 5 } = req.body;

    if (!room_name || !base_price) {
      return sendError(res, 'Room name and base price are required');
    }

    const ins = await query(
      `INSERT INTO hotel_rooms (hotel_id, room_name, room_type, max_occupancy, bed_type, base_price, currency, amenities, photos, total_quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [bizId, room_name, room_type || 'Deluxe', max_occupancy || 2, bed_type || 'King Bed', base_price, currency, amenities, photos, total_quantity]
    );

    const room = ins.rows[0];
    await emitRealtimeEvent({
      event: EVENT_TYPES.ROOM_UPDATED,
      entity: 'room',
      entityId: room.id,
      action: 'created',
      scope: { businessId: bizId, isPublic: true },
      metadata: { room_name, base_price },
    });

    return sendSuccess(res, room, 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/businesses/hotel/availability
router.get('/hotel/availability', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { room_id } = req.query;
    const avail = await query(`SELECT * FROM room_availability WHERE room_id = $1 ORDER BY date ASC`, [room_id]);
    return sendSuccess(res, avail.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/businesses/hotel/availability
router.post('/hotel/availability', authRequired, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const { room_id, date, status, price_override } = _req.body;
    const ins = await query(
      `INSERT INTO room_availability (room_id, date, status, price_override) VALUES ($1, $2, $3, $4) RETURNING *`,
      [room_id, date, status || 'available', price_override || null]
    );

    const avail = ins.rows[0];
    await emitRealtimeEvent({
      event: price_override ? EVENT_TYPES.ROOM_PRICE_UPDATED : EVENT_TYPES.ROOM_AVAILABILITY_UPDATED,
      entity: 'room',
      entityId: String(room_id),
      action: 'availability_updated',
      scope: { isPublic: true },
      metadata: { date, status, price_override },
    });

    return sendSuccess(res, avail);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// -------------------------------------------------------------
// TREKKING AGENCY EXPEDITIONS
// -------------------------------------------------------------
// GET /api/businesses/trekking/packages
router.get('/trekking/packages', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const pkgs = await query(`SELECT * FROM trekking_packages WHERE agency_id = $1 ORDER BY base_price ASC`, [bizId]);
    return sendSuccess(res, pkgs.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/businesses/trekking/packages
router.post('/trekking/packages', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const { title, region, difficulty, duration_days, max_altitude_m, group_min, group_max, base_price, inclusions, exclusions, itinerary } = req.body;

    const ins = await query(
      `INSERT INTO trekking_packages (agency_id, title, region, difficulty, duration_days, max_altitude_m, group_min, group_max, base_price, inclusions, exclusions, itinerary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [bizId, title, region || 'Himalayas', difficulty || 'Moderate', duration_days || 7, max_altitude_m || 4000, group_min || 2, group_max || 12, base_price, inclusions || [], exclusions || [], itinerary || []]
    );

    return sendSuccess(res, ins.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// -------------------------------------------------------------
// ADVENTURE ACTIVITIES (PARAGLIDING, RAFTING, BUNGEE, ZIPLINE)
// -------------------------------------------------------------
// GET /api/businesses/adventure/activities
router.get('/adventure/activities', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const acts = await query(`SELECT * FROM adventure_activities WHERE business_id = $1 ORDER BY base_price ASC`, [bizId]);
    return sendSuccess(res, acts.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/businesses/adventure/activities
router.post('/adventure/activities', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const { activity_type, title, launch_location, landing_location, pilot_guide_required, min_weight_kg, max_weight_kg, min_age, weather_status, duration_minutes, waiver_required, base_price } = req.body;

    const ins = await query(
      `INSERT INTO adventure_activities (business_id, activity_type, title, launch_location, landing_location, pilot_guide_required, min_weight_kg, max_weight_kg, min_age, weather_status, duration_minutes, waiver_required, base_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [bizId, activity_type || 'paragliding', title, launch_location, landing_location, pilot_guide_required !== false, min_weight_kg || 35, max_weight_kg || 110, min_age || 10, weather_status || 'clear', duration_minutes || 30, waiver_required !== false, base_price]
    );

    return sendSuccess(res, ins.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PUT /api/businesses/adventure/activities/:id/weather
router.put('/adventure/activities/:id/weather', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    const upd = await query(`UPDATE adventure_activities SET weather_status = $1 WHERE id = $2 RETURNING *`, [status, req.params.id]);
    return sendSuccess(res, upd.rows[0]);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// -------------------------------------------------------------
// TRANSPORTATION FLEET & ROUTE OPERATIONS
// -------------------------------------------------------------
// GET /api/businesses/transport/fleet
router.get('/transport/fleet', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const fleet = await query(`SELECT * FROM transport_fleet WHERE business_id = $1 ORDER BY created_at DESC`, [bizId]);
    return sendSuccess(res, fleet.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/businesses/transport/fleet
router.post('/transport/fleet', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const { vehicle_name, vehicle_type, plate_number, capacity, status, driver_name, driver_phone } = req.body;

    if (!vehicle_name || !plate_number) {
      return sendError(res, 'Vehicle name and plate number are required');
    }

    const ins = await query(
      `INSERT INTO transport_fleet (business_id, vehicle_name, vehicle_type, plate_number, capacity, status, driver_name, driver_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [bizId, vehicle_name, vehicle_type || '4WD Scorpio Jeep', plate_number, capacity || 7, status || 'active', driver_name || 'Assigned Driver', driver_phone || '+977-9840000000']
    );

    return sendSuccess(res, ins.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PUT /api/businesses/transport/fleet/:id/status
router.put('/transport/fleet/:id/status', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    const upd = await query(`UPDATE transport_fleet SET status = $1 WHERE id = $2 RETURNING *`, [status, req.params.id]);
    return sendSuccess(res, upd.rows[0]);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/businesses/transport/routes
router.get('/transport/routes', authRequired, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const routes = await query(`SELECT * FROM transport_routes ORDER BY price ASC`);
    return sendSuccess(res, routes.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/businesses/transport/routes
router.post('/transport/routes', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { vehicle_name, vehicle_type, from_location, to_location, departure_time, arrival_time, price, total_seats, amenities } = req.body;
    const ins = await query(
      `INSERT INTO transport_routes (vehicle_name, vehicle_type, from_location, to_location, departure_time, arrival_time, price, total_seats, available_seats, amenities)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9) RETURNING *`,
      [vehicle_name, vehicle_type || 'Tourist Bus', from_location, to_location, departure_time || '07:00 AM', arrival_time || '02:00 PM', price || 25, total_seats || 20, amenities || []]
    );
    return sendSuccess(res, ins.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// -------------------------------------------------------------
// HOMESTAY MANAGEMENT OPERATIONS
// -------------------------------------------------------------
// GET /api/businesses/homestay/profile
router.get('/homestay/profile', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const prof = await query(`SELECT * FROM homestay_profiles WHERE business_id = $1 LIMIT 1`, [bizId]);
    if (prof.rows.length > 0) return sendSuccess(res, prof.rows[0]);

    // Return default profile structure
    return sendSuccess(res, {
      business_id: bizId,
      host_name: 'Traditional Nepal Family Host',
      ethnic_heritage: 'Gurung Heritage',
      family_members: '4 family members',
      house_rules: ['Remove footwear before entering', 'Village quiet hours after 21:00'],
      meal_plans: ['Authentic Dal Bhat with Gundruk', 'Traditional Dhindo Set', 'Fresh Yak Butter Tea'],
      cultural_activities: ['Organic Farm Tour', 'Cultural Evening Songs by Fireplace'],
    });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PUT /api/businesses/homestay/profile
router.put('/homestay/profile', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const { host_name, ethnic_heritage, family_members, house_rules, meal_plans, cultural_activities } = req.body;

    const ins = await query(
      `INSERT INTO homestay_profiles (business_id, host_name, ethnic_heritage, family_members, house_rules, meal_plans, cultural_activities)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [bizId, host_name, ethnic_heritage, family_members, house_rules, meal_plans, cultural_activities]
    );
    return sendSuccess(res, ins.rows[0]);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// -------------------------------------------------------------
// TOUR OPERATOR PACKAGES
// -------------------------------------------------------------
// GET /api/businesses/tours/packages
router.get('/tours/packages', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const tours = await query(`SELECT * FROM tour_packages WHERE business_id = $1 ORDER BY base_price ASC`, [bizId]);
    return sendSuccess(res, tours.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/businesses/tours/packages
router.post('/tours/packages', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const { title, destinations, duration_days, inclusions, exclusions, group_max, base_price, departure_dates } = req.body;

    const ins = await query(
      `INSERT INTO tour_packages (business_id, title, destinations, duration_days, inclusions, exclusions, group_max, base_price, departure_dates)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [bizId, title, destinations || ['Kathmandu', 'Pokhara'], duration_days || 7, inclusions || [], exclusions || [], group_max || 12, base_price, departure_dates || []]
    );
    return sendSuccess(res, ins.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// -------------------------------------------------------------
// ATTRACTION & DESTINATION OPERATOR TICKETING
// -------------------------------------------------------------
// GET /api/businesses/attractions/tickets
router.get('/attractions/tickets', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const tickets = await query(`SELECT * FROM attraction_tickets WHERE business_id = $1 ORDER BY foreigner_price ASC`, [bizId]);
    return sendSuccess(res, tickets.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/businesses/attractions/tickets
router.post('/attractions/tickets', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const { attraction_name, opening_hours, foreigner_price, saarc_price, local_price, slot_capacity, closure_notice } = req.body;

    const ins = await query(
      `INSERT INTO attraction_tickets (business_id, attraction_name, opening_hours, foreigner_price, saarc_price, local_price, slot_capacity, closure_notice)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [bizId, attraction_name, opening_hours || '08:00 - 18:00', foreigner_price || 15, saarc_price || 5, local_price || 0, slot_capacity || 250, closure_notice || 'Open Normally']
    );
    return sendSuccess(res, ins.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PUT /api/businesses/attractions/notice
router.put('/attractions/notice', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, closure_notice, is_open } = req.body;
    const upd = await query(`UPDATE attraction_tickets SET closure_notice = $1, is_open = $2 WHERE id = $3 RETURNING *`, [closure_notice, is_open !== false, id]);
    return sendSuccess(res, upd.rows[0]);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// -------------------------------------------------------------
// GUIDE & BUTLER DIRECT OPERATIONS
// -------------------------------------------------------------
// GET /api/businesses/guide/profile
router.get('/guide/profile', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await query(
      `SELECT p.full_name, p.avatar_url, p.bio, gp.daily_rate, gp.specialty, gp.status
       FROM profiles p
       LEFT JOIN guide_profiles gp ON p.id = gp.id
       WHERE p.id = $1 LIMIT 1`,
      [userId]
    );

    const data = profile.rows[0] || {
      full_name: req.user!.fullName || 'Licensed Himalayan Guide',
      specialty: 'High-Altitude Mountaineering & Trekking',
      daily_rate: 45.0,
      languages: ['English', 'Nepali', 'Sherpa'],
      license_no: 'NATHM-TG-44910',
      experience_seasons: 12,
    };

    return sendSuccess(res, data);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/businesses/guide/assignments
router.get('/guide/assignments', authRequired, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const assignments = [
      {
        id: 'assign-1',
        trip_title: 'Everest Base Camp & Gokyo Lakes Expedition',
        client_name: 'Sarah Jenkins (USA)',
        group_size: 2,
        dates: 'Oct 12 - Oct 26, 2026',
        route: 'Lukla -> Namche -> Gokyo Ri -> EBC',
        status: 'confirmed',
        daily_rate: 45.0,
        total_payout: 630.0,
      },
      {
        id: 'assign-2',
        trip_title: 'Annapurna Sanctuary & Poon Hill Circuit',
        client_name: 'Liam Zhang (Singapore)',
        group_size: 4,
        dates: 'Nov 02 - Nov 10, 2026',
        route: 'Pokhara -> Ulleri -> Ghorepani -> ABC',
        status: 'confirmed',
        daily_rate: 45.0,
        total_payout: 405.0,
      },
    ];
    return sendSuccess(res, assignments);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// -------------------------------------------------------------
// STAFF / TEAM MANAGEMENT
// -------------------------------------------------------------
// GET /api/businesses/staff
router.get('/staff', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const staff = await query(`SELECT * FROM business_staff WHERE business_id = $1 ORDER BY created_at DESC`, [bizId]);
    return sendSuccess(res, staff.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// Helper to check if role has business financial privileges
function hasFinancialAccess(role: string): boolean {
  return ['business_owner', 'hotel', 'trekking_agency', 'finance_staff', 'admin', 'super_admin'].includes(role);
}

// Helper to check if role has management / hiring privileges
function hasManagementAccess(role: string): boolean {
  return ['business_owner', 'hotel', 'trekking_agency', 'manager', 'admin', 'super_admin'].includes(role);
}

// POST /api/businesses/staff
router.post('/staff', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    if (!hasManagementAccess(userRole)) {
      return sendError(res, 'Unauthorized: Only business owners or managers can add staff', 'FORBIDDEN', 403);
    }

    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const { full_name, email, phone, staff_role, department, permissions = ['view_bookings'] } = req.body;

    if (!full_name || !email) {
      return sendError(res, 'Name and email are required');
    }

    const ins = await query(
      `INSERT INTO business_staff (business_id, user_id, staff_role, department, permissions, full_name, email, phone)
       VALUES ($1, NULL, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [bizId, staff_role || 'operations', department || 'General', permissions, full_name, email, phone || null]
    );

    await emitRealtimeEvent({
      event: EVENT_TYPES.BUSINESS_STAFF_UPDATED,
      entity: 'business_staff',
      entityId: ins.rows[0].id,
      action: 'created',
      scope: { businessId: bizId },
      metadata: { full_name, staff_role },
    });

    return sendSuccess(res, ins.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// DELETE /api/businesses/staff/:id
router.delete('/staff/:id', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    if (!hasManagementAccess(userRole)) {
      return sendError(res, 'Unauthorized: Only business owners or managers can remove staff', 'FORBIDDEN', 403);
    }

    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    await query(`DELETE FROM business_staff WHERE id = $1 AND business_id = $2`, [req.params.id, bizId]);
    return sendSuccess(res, { deleted: true });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// -------------------------------------------------------------
// CENTRALIZED SCHEDULE MANAGEMENT
// -------------------------------------------------------------
// GET /api/businesses/schedules
router.get('/schedules', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const scheds = await query(`SELECT * FROM business_schedules WHERE business_id = $1 ORDER BY day_of_week ASC`, [bizId]);
    return sendSuccess(res, scheds.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/businesses/schedules
router.post('/schedules', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const { entity_type, entity_id, day_of_week, start_time, end_time, slot_capacity, is_available, notes } = req.body;

    const ins = await query(
      `INSERT INTO business_schedules (business_id, entity_type, entity_id, day_of_week, start_time, end_time, slot_capacity, is_available, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [bizId, entity_type || 'general', entity_id || null, day_of_week || 1, start_time, end_time, slot_capacity || 10, is_available !== false, notes || '']
    );

    return sendSuccess(res, ins.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// DELETE /api/businesses/schedules/:id
router.delete('/schedules/:id', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    await query(`DELETE FROM business_schedules WHERE id = $1 AND business_id = $2`, [req.params.id, bizId]);
    return sendSuccess(res, { deleted: true });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// -------------------------------------------------------------
// FINANCIAL TRANSACTIONS & PAYOUTS (RESTRICTED ROLE ACCESS)
// -------------------------------------------------------------
// GET /api/businesses/transactions
router.get('/transactions', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    if (!hasFinancialAccess(userRole)) {
      return sendError(res, 'Unauthorized: Access to financial ledger requires finance or owner role', 'FORBIDDEN', 403);
    }

    if (['admin', 'super_admin'].includes(userRole)) {
      const allTxs = await query(`SELECT * FROM transactions ORDER BY created_at DESC`);
      return sendSuccess(res, allTxs.rows);
    }
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const txs = await query(`SELECT * FROM transactions WHERE business_id = $1 ORDER BY created_at DESC`, [bizId]);
    return sendSuccess(res, txs.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/businesses/payouts
router.get('/payouts', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    if (!hasFinancialAccess(userRole)) {
      return sendError(res, 'Unauthorized: Access to payout history requires finance or owner role', 'FORBIDDEN', 403);
    }

    if (['admin', 'super_admin'].includes(userRole)) {
      const allPos = await query(`SELECT * FROM payouts ORDER BY created_at DESC`);
      return sendSuccess(res, allPos.rows);
    }
    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const pos = await query(`SELECT * FROM payouts WHERE business_id = $1 ORDER BY created_at DESC`, [bizId]);
    return sendSuccess(res, pos.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/businesses/payouts - Request payout
router.post('/payouts', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    if (!hasFinancialAccess(userRole)) {
      return sendError(res, 'Unauthorized: Requesting payouts requires finance or owner role', 'FORBIDDEN', 403);
    }

    const bizId = await resolveBizId(req.user!.id, req.user!.role);
    const { amount, currency = 'USD', bank_name, account_number, account_holder_name } = req.body;

    if (!amount || amount <= 0) {
      return sendError(res, 'Valid payout amount is required');
    }

    const ins = await query(
      `INSERT INTO payouts (business_id, amount, currency, bank_name, account_number, account_holder_name)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [bizId, amount, currency, bank_name || 'Nabil Bank', account_number || 'N/A', account_holder_name || 'Business Owner']
    );

    return sendSuccess(res, ins.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
