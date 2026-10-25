import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'crypto';
import { verifyToken } from '../middleware/auth';
import { query } from '../db';

export const EVENT_TYPES = {
  // Auth / User
  USER_UPDATED: 'user.updated',
  USER_PROFILE_UPDATED: 'user.profile.updated',
  USER_STATUS_UPDATED: 'user.status.updated',
  USER_ROLE_UPDATED: 'user.role.updated',

  // Business
  BUSINESS_CREATED: 'business.created',
  BUSINESS_UPDATED: 'business.updated',
  BUSINESS_STATUS_UPDATED: 'business.status.updated',
  BUSINESS_VERIFICATION_UPDATED: 'business.verification.updated',
  BUSINESS_STAFF_UPDATED: 'business.staff.updated',

  // Hotels
  HOTEL_UPDATED: 'hotel.updated',
  ROOM_UPDATED: 'room.updated',
  ROOM_AVAILABILITY_UPDATED: 'room.availability.updated',
  ROOM_PRICE_UPDATED: 'room.price.updated',

  // Activities
  ACTIVITY_CREATED: 'activity.created',
  ACTIVITY_UPDATED: 'activity.updated',
  ACTIVITY_AVAILABILITY_UPDATED: 'activity.availability.updated',
  ACTIVITY_CAPACITY_UPDATED: 'activity.capacity.updated',
  ACTIVITY_WEATHER_UPDATED: 'activity.weather.updated',
  ACTIVITY_STATUS_UPDATED: 'activity.status.updated',

  // Guides
  GUIDE_UPDATED: 'guide.updated',
  GUIDE_AVAILABILITY_UPDATED: 'guide.availability.updated',
  GUIDE_SCHEDULE_UPDATED: 'guide.schedule.updated',

  // Transport
  TRANSPORT_UPDATED: 'transport.updated',
  TRANSPORT_AVAILABILITY_UPDATED: 'transport.availability.updated',
  TRANSPORT_SCHEDULE_UPDATED: 'transport.schedule.updated',

  // Bookings
  BOOKING_CREATED: 'booking.created',
  BOOKING_UPDATED: 'booking.updated',
  BOOKING_CONFIRMED: 'booking.confirmed',
  BOOKING_CANCELLED: 'booking.cancelled',
  BOOKING_COMPLETED: 'booking.completed',

  // Payments
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_UPDATED: 'payment.updated',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',

  // Permits
  PERMIT_CREATED: 'permit.created',
  PERMIT_UPDATED: 'permit.updated',
  PERMIT_SUBMITTED: 'permit.submitted',
  PERMIT_UNDER_REVIEW: 'permit.under_review',
  PERMIT_ADDITIONAL_INFO_REQUIRED: 'permit.additional_information_required',
  PERMIT_APPROVED: 'permit.approved',
  PERMIT_REJECTED: 'permit.rejected',

  // Schedules
  SCHEDULE_CREATED: 'schedule.created',
  SCHEDULE_UPDATED: 'schedule.updated',
  SCHEDULE_DELETED: 'schedule.deleted',

  // Chat
  CONVERSATION_CREATED: 'conversation.created',
  MESSAGE_CREATED: 'message.created',
  MESSAGE_UPDATED: 'message.updated',
  MESSAGE_DELETED: 'message.deleted',

  // Notifications
  NOTIFICATION_CREATED: 'notification.created',
  NOTIFICATION_READ: 'notification.read',

  // Reviews & Favorites
  REVIEW_CREATED: 'review.created',
  REVIEW_UPDATED: 'review.updated',
  FAVORITE_CREATED: 'favorite.created',
  FAVORITE_DELETED: 'favorite.deleted',

  // Financial
  TRANSACTION_CREATED: 'transaction.created',
  TRANSACTION_UPDATED: 'transaction.updated',
  PAYOUT_CREATED: 'payout.created',
  PAYOUT_UPDATED: 'payout.updated',
} as const;

export interface RealtimeScope {
  userId?: string;
  businessId?: string;
  conversationId?: string;
  role?: string;
  destinationId?: string;
  hotelId?: string;
  activityId?: string;
  guideId?: string;
  applicantId?: string;
  isPublic?: boolean;
}

export interface RealtimeEnvelope {
  id: string;
  event: string;
  entity: string;
  entityId: string;
  action: string;
  timestamp: string;
  version: number;
  scope: RealtimeScope;
  metadata?: Record<string, any>;
}

export interface AuthenticatedClient {
  ws: WebSocket;
  userId: string;
  role: string;
  businessId?: string;
  channels: Set<string>;
  isAlive: boolean;
}

// In-memory entity version registry to guarantee monotonic incrementing versions
const entityVersionRegistry = new Map<string, number>();

// Active connected clients registry
const activeClients = new Set<AuthenticatedClient>();

let wss: WebSocketServer | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

/**
 * Initializes the WebSocket real-time server on the given HTTP server instance.
 */
export function initRealtimeServer(httpServer: HttpServer): WebSocketServer {
  wss = new WebSocketServer({
    server: httpServer,
    path: '/ws',
  });

  wss.on('connection', async (ws: WebSocket, req) => {
    let client: AuthenticatedClient | null = null;

    // 1. Try to authenticate via URL query parameter `?token=...`
    try {
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
      const token = url.searchParams.get('token');

      if (token) {
        client = await authenticateSocket(ws, token);
      }
    } catch (e) {
      // Ignored, client may send auth message subsequently
    }

    // Ping-pong liveness
    (ws as any).isAlive = true;
    ws.on('pong', () => {
      (ws as any).isAlive = true;
      if (client) client.isAlive = true;
    });

    ws.on('message', async (raw: string | Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());

        // Handshake: Auth message
        if (msg.type === 'auth') {
          if (client) {
            ws.send(JSON.stringify({ type: 'auth_success', message: 'Already authenticated' }));
            return;
          }
          client = await authenticateSocket(ws, msg.token);
          if (client) {
            ws.send(JSON.stringify({
              type: 'auth_success',
              userId: client.userId,
              role: client.role,
              businessId: client.businessId,
              channels: Array.from(client.channels),
            }));
          }
          return;
        }

        // Must be authenticated to subscribe or send events
        if (!client) {
          ws.send(JSON.stringify({ type: 'error', code: 'UNAUTHORIZED', message: 'Please authenticate first' }));
          return;
        }

        // Explicit Channel Subscription
        if (msg.type === 'subscribe') {
          const channel = String(msg.channel || '').trim();
          const authorized = await isChannelAuthorized(client, channel);
          if (authorized) {
            client.channels.add(channel);
            ws.send(JSON.stringify({ type: 'subscribed', channel }));
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              code: 'FORBIDDEN_SUBSCRIPTION',
              message: `Unauthorized subscription to channel: ${channel}`,
            }));
          }
          return;
        }

        // Unsubscribe
        if (msg.type === 'unsubscribe') {
          const channel = String(msg.channel || '').trim();
          client.channels.delete(channel);
          ws.send(JSON.stringify({ type: 'unsubscribed', channel }));
          return;
        }

        // Heartbeat Ping
        if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          return;
        }
      } catch (err: any) {
        ws.send(JSON.stringify({ type: 'error', message: err.message || 'Invalid message payload' }));
      }
    });

    ws.on('close', () => {
      if (client) {
        activeClients.delete(client);
      }
    });

    ws.on('error', (err) => {
      console.warn('[REALTIME_WS] Socket warning:', err.message);
    });

    // Send connection established welcome
    ws.send(JSON.stringify({
      type: 'connection_established',
      serverTime: new Date().toISOString(),
      requiresAuth: !client,
    }));
  });

  // Heartbeat to prune dead connections every 30s
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    if (!wss) return;
    for (const ws of wss.clients) {
      if ((ws as any).isAlive === false) {
        ws.terminate();
        continue;
      }
      (ws as any).isAlive = false;
      ws.ping();
    }
  }, 30000);

  console.log('[REALTIME_WS] WebSocket server initialized on path /ws');
  return wss;
}

/**
 * Validates JWT token and creates an AuthenticatedClient record with authorized channels.
 */
export async function authenticateSocket(ws: WebSocket, token: string): Promise<AuthenticatedClient | null> {
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    ws.send(JSON.stringify({ type: 'error', code: 'INVALID_TOKEN', message: 'Token is invalid or expired' }));
    ws.close(4401, 'Unauthorized');
    return null;
  }

  try {
    const userRes = await query(
      `SELECT a.id, a.email, a.status, r.name as role
       FROM accounts a
       LEFT JOIN roles r ON a.role_id = r.id
       WHERE a.id = $1`,
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      ws.send(JSON.stringify({ type: 'error', code: 'USER_NOT_FOUND', message: 'Account not found' }));
      ws.close(4401, 'Unauthorized');
      return null;
    }

    const row = userRes.rows[0];
    if (row.status === 'banned' || row.status === 'suspended') {
      ws.send(JSON.stringify({ type: 'error', code: 'ACCOUNT_RESTRICTED', message: `Account is ${row.status}` }));
      ws.close(4403, 'Account restricted');
      return null;
    }

    // Resolve business ID if user is business owner
    let businessId: string | undefined;
    const bizRes = await query(`SELECT id FROM businesses WHERE owner_id = $1 LIMIT 1`, [row.id]);
    if (bizRes.rows.length > 0) {
      businessId = bizRes.rows[0].id;
    } else if (['hotel', 'trekking_agency', 'business_owner', 'manager'].includes(row.role)) {
      const newBiz = await query(
        `INSERT INTO businesses (owner_id, name, category, status, is_verified)
         VALUES ($1, 'My Tourism Business', $2, 'pending', false)
         RETURNING id`,
        [row.id, row.role || 'hotel']
      );
      if (newBiz.rows.length > 0) {
        businessId = newBiz.rows[0].id;
      }
    }

    const client: AuthenticatedClient = {
      ws,
      userId: row.id,
      role: row.role || 'tourist',
      businessId,
      channels: new Set<string>(),
      isAlive: true,
    };

    // Auto-subscribe to personal and role-authorized channels
    client.channels.add(`user:${client.userId}`);
    if (client.businessId) {
      client.channels.add(`business:${client.businessId}`);
    }
    if (['admin', 'super_admin'].includes(client.role)) {
      client.channels.add('admin');
    }
    // Public channels open to all authenticated users
    client.channels.add('public:discovery');
    client.channels.add('public:hotels');
    client.channels.add('public:activities');

    activeClients.add(client);
    return client;
  } catch (err: any) {
    console.error('[REALTIME_WS] Auth error:', err);
    ws.send(JSON.stringify({ type: 'error', code: 'AUTH_FAILED', message: 'Server auth failure' }));
    return null;
  }
}

/**
 * Associates a user with a business and updates any active WS client connection channels.
 */
export function associateUserBusiness(userId: string, businessId: string) {
  for (const client of activeClients) {
    if (client.userId === userId) {
      client.businessId = businessId;
      client.channels.add(`business:${businessId}`);
    }
  }
}

/**
 * Strict server-side authorization check for custom channel subscription requests.
 */
export async function isChannelAuthorized(client: AuthenticatedClient, channel: string): Promise<boolean> {
  if (!channel) return false;

  // 1. User private channel
  if (channel.startsWith('user:')) {
    const targetUserId = channel.replace('user:', '');
    return targetUserId === client.userId || ['admin', 'super_admin'].includes(client.role);
  }

  // 2. Business private channel
  if (channel.startsWith('business:')) {
    const targetBizId = channel.replace('business:', '');
    if (['admin', 'super_admin'].includes(client.role)) return true;
    if (client.businessId && client.businessId === targetBizId) return true;

    // Check if user is owner OR registered staff for this business
    try {
      const ownerOrStaffCheck = await query(
        `SELECT id FROM businesses WHERE id = $1 AND owner_id = $2
         UNION
         SELECT id FROM business_staff WHERE business_id = $1 AND user_id = $2 AND status = 'active' LIMIT 1`,
        [targetBizId, client.userId]
      );
      if (ownerOrStaffCheck.rows.length > 0) {
        client.businessId = targetBizId;
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  // 3. Admin channel
  if (channel === 'admin') {
    return ['admin', 'super_admin'].includes(client.role);
  }

  // 4. Conversation channel
  if (channel.startsWith('entity:conversation:')) {
    const convoId = channel.replace('entity:conversation:', '');
    if (['admin', 'super_admin'].includes(client.role)) return true;
    try {
      const cRes = await query(
        `SELECT id FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2) LIMIT 1`,
        [convoId, client.userId]
      );
      return cRes.rows.length > 0;
    } catch (_) {
      return false;
    }
  }

  // 5. Booking entity channel
  if (channel.startsWith('entity:booking:')) {
    const bookingId = channel.replace('entity:booking:', '');
    if (['admin', 'super_admin'].includes(client.role)) return true;
    try {
      const bRes = await query(
        `SELECT b.id, b.profile_id, rt.hotel_id, b.guide_id
         FROM bookings b
         LEFT JOIN room_types rt ON b.room_type_id = rt.id
         WHERE b.id = $1 LIMIT 1`,
        [bookingId]
      );
      if (bRes.rows.length === 0) return false;
      const b = bRes.rows[0];
      if (b.profile_id === client.userId || b.guide_id === client.userId) return true;
      if (client.businessId) {
        const bizCheck = await query(
          `SELECT id FROM businesses WHERE id = $1 AND (owner_id = $2 OR id IN (SELECT business_id FROM hotels WHERE id = $3)) LIMIT 1`,
          [client.businessId, client.userId, b.hotel_id]
        );
        if (bizCheck.rows.length > 0) return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  // 6. Public channels
  if (channel.startsWith('public:')) {
    return true;
  }

  return false;
}

/**
 * Gets the next sequential version number for an entity.
 */
function getNextEntityVersion(entity: string, entityId: string): number {
  const key = `${entity}:${entityId}`;
  const cur = entityVersionRegistry.get(key) || 1;
  const next = cur + 1;
  entityVersionRegistry.set(key, next);
  return next;
}

export interface EmitEventParams {
  event: string;
  entity: string;
  entityId: string;
  action: string;
  scope: RealtimeScope;
  metadata?: Record<string, any>;
  version?: number;
}

/**
 * Core event emitter: persists event strictly and delivers to authorized connected sockets.
 * Must be invoked strictly AFTER successful database commits.
 */
export async function emitRealtimeEvent(params: EmitEventParams): Promise<RealtimeEnvelope> {
  const id = randomUUID();
  const timestamp = new Date().toISOString();
  const version = params.version ?? getNextEntityVersion(params.entity, params.entityId);

  const envelope: RealtimeEnvelope = {
    id,
    event: params.event,
    entity: params.entity,
    entityId: params.entityId,
    action: params.action,
    timestamp,
    version,
    scope: params.scope,
    metadata: params.metadata || {},
  };

  // 1. Persist to database event log / outbox
  try {
    await query(
      `INSERT INTO realtime_events (id, event_type, entity, entity_id, action, scope, metadata, version, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        params.event,
        params.entity,
        params.entityId,
        params.action,
        JSON.stringify(params.scope),
        JSON.stringify(params.metadata || {}),
        version,
        timestamp,
      ]
    );
  } catch (err: any) {
    console.warn('[REALTIME_EVENT_LOG] Warning: Failed to persist event log:', err.message);
  }

  // 2. Identify target channels based on event scope
  const targetChannels = new Set<string>();

  if (params.scope.userId) {
    targetChannels.add(`user:${params.scope.userId}`);
  }
  if (params.scope.applicantId) {
    targetChannels.add(`user:${params.scope.applicantId}`);
  }
  if (params.scope.guideId) {
    targetChannels.add(`user:${params.scope.guideId}`);
  }
  if (params.scope.businessId) {
    targetChannels.add(`business:${params.scope.businessId}`);
  }
  if (params.scope.conversationId) {
    targetChannels.add(`entity:conversation:${params.scope.conversationId}`);
  }
  if (params.entity === 'booking') {
    targetChannels.add(`entity:booking:${params.entityId}`);
  }

  // Certain events must be visible to platform admin
  if (
    params.event.startsWith('business.') ||
    params.event.startsWith('permit.') ||
    params.event.startsWith('booking.') ||
    params.event.startsWith('payment.') ||
    params.event.startsWith('user.status.') ||
    params.event.startsWith('transaction.')
  ) {
    targetChannels.add('admin');
  }

  // Public broadcast if marked public or discovery
  if (
    params.scope.isPublic ||
    params.event.startsWith('room.price') ||
    params.event.startsWith('room.availability') ||
    params.event.startsWith('activity.weather') ||
    params.event.startsWith('activity.status') ||
    (params.event === EVENT_TYPES.BUSINESS_STATUS_UPDATED && params.action === 'approved')
  ) {
    targetChannels.add('public:discovery');
    targetChannels.add('public:hotels');
    targetChannels.add('public:activities');
  }

  // 3. Dispatch to all matching authenticated clients
  const payloadStr = JSON.stringify({
    type: 'event',
    data: envelope,
  });

  let deliveredCount = 0;
  for (const client of activeClients) {
    if (client.ws.readyState !== WebSocket.OPEN) continue;

    // Multi-tenant check: Does the client have ANY of the matching channels?
    const hasAuthorizedChannel = Array.from(targetChannels).some((ch) => client.channels.has(ch));

    if (hasAuthorizedChannel) {
      try {
        client.ws.send(payloadStr);
        deliveredCount++;
      } catch (err: any) {
        console.warn(`[REALTIME_DISPATCH] Failed to send event to user ${client.userId}:`, err.message);
      }
    }
  }

  return envelope;
}

/**
 * Reconnect Resync: returns events that occurred since the client disconnected.
 */
export async function getMissedEvents(
  userId: string,
  userRole: string,
  businessId?: string,
  sinceTimestamp?: string
): Promise<RealtimeEnvelope[]> {
  try {
    const ts = sinceTimestamp || new Date(Date.now() - 3600000).toISOString(); // Default to past 1 hour

    const res = await query(
      `SELECT * FROM realtime_events 
       WHERE created_at > $1 
       ORDER BY created_at ASC 
       LIMIT 200`,
      [ts]
    );

    const filtered: RealtimeEnvelope[] = [];
    const isAdmin = ['admin', 'super_admin'].includes(userRole);

    for (const row of res.rows) {
      let scope: RealtimeScope = {};
      try {
        scope = typeof row.scope === 'string' ? JSON.parse(row.scope) : (row.scope || {});
      } catch (_) {}

      // Multi-tenant authorization check on each historical event
      const isMine =
        isAdmin ||
        scope.userId === userId ||
        scope.applicantId === userId ||
        scope.guideId === userId ||
        (businessId && scope.businessId === businessId) ||
        scope.isPublic === true;

      if (isMine) {
        let meta: Record<string, any> = {};
        try {
          meta = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {});
        } catch (_) {}

        filtered.push({
          id: row.id,
          event: row.event_type,
          entity: row.entity,
          entityId: row.entity_id,
          action: row.action,
          timestamp: row.created_at,
          version: Number(row.version || 1),
          scope,
          metadata: meta,
        });
      }
    }

    return filtered;
  } catch (err: any) {
    console.error('[REALTIME_RESYNC] Error fetching missed events:', err);
    return [];
  }
}

/**
 * Returns active connection metrics for observability.
 */
export function getRealtimeMetrics() {
  return {
    connectedClients: activeClients.size,
    activeChannelsCount: Array.from(activeClients).reduce((acc, c) => acc + c.channels.size, 0),
    trackedEntitiesCount: entityVersionRegistry.size,
  };
}
