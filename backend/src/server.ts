import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { runMigrations } from './migrate';
import { sendSuccess, sendError } from './utils/response';
import { getDbHealth } from './db';

// Route imports
import authRoutes from './routes/auth.routes';
import destinationsRoutes from './routes/destinations.routes';
import hotelsRoutes from './routes/hotels.routes';
import providersRoutes from './routes/providers.routes';
import activitiesRoutes from './routes/activities.routes';
import transportRoutes from './routes/transport.routes';
import bookingsRoutes from './routes/bookings.routes';
import tripsRoutes from './routes/trips.routes';
import permitsRoutes from './routes/permits.routes';
import businessesRoutes from './routes/businesses.routes';
import adminRoutes from './routes/admin.routes';
import verificationRoutes from './routes/verification.routes';
import chatRoutes from './routes/chat.routes';
import notificationsRoutes from './routes/notifications.routes';
import communityRoutes from './routes/community.routes';
import favoritesRoutes from './routes/favorites.routes';
import reviewsRoutes from './routes/reviews.routes';
import profileRoutes from './routes/profile.routes';
import userSchedulesRoutes from './routes/user_schedules.routes';
import paymentsRoutes from './routes/payments.routes';

const app = express();
const PORT = process.env.PORT || 8080;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Enable CORS for Flutter web / mobile clients
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Structured request & audit logging (redacts sensitive tokens/credentials)
app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  const safeUrl = req.originalUrl.split('?')[0];
  next();
  // Safe observability logging for critical routes
  if (req.method !== 'GET' || safeUrl.includes('/health')) {
    const elapsed = Date.now() - start;
    console.log(`[API_AUDIT] ${req.method} ${safeUrl} (${elapsed}ms) - IP: ${req.ip}`);
  }
});

// Static uploads directory
const uploadsPath = path.resolve(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadsPath));

// Static Flutter Web build (Unified single-origin hosting)
const webBuildPath = path.resolve(__dirname, '../../build/web');
if (fs.existsSync(webBuildPath)) {
  app.use(express.static(webBuildPath));
}

// System Health Check
app.get('/health', async (_req: Request, res: Response) => {
  const dbHealth = await getDbHealth();
  const isHealthy = !IS_PRODUCTION || dbHealth.status === 'healthy';

  const payload = {
    status: isHealthy ? 'online' : 'degraded',
    platform: 'VisitNepal Tourism Platform API',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbHealth.status,
      provider: dbHealth.provider,
      latencyMs: dbHealth.latencyMs,
    },
    memory: {
      rssMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)),
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(isHealthy ? 200 : 503).json({ success: isHealthy, data: payload });
});

// Dedicated Database Health & Diagnostic Check
app.get('/health/db', async (_req: Request, res: Response) => {
  const dbHealth = await getDbHealth();
  const statusCode = dbHealth.status === 'healthy' ? 200 : (IS_PRODUCTION ? 503 : 200);

  return res.status(statusCode).json({
    success: dbHealth.status === 'healthy' || !IS_PRODUCTION,
    data: dbHealth,
  });
});

// Authentication Routes
app.use('/auth', authRoutes);

// Core Tourism API Routes
app.use('/api/destinations', destinationsRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/permits', permitsRoutes);
app.use('/api/businesses', businessesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/user-schedules', userSchedulesRoutes);
app.use('/api/payments', paymentsRoutes);

// Export for serverless / testing
export default app;

import http from 'http';
import { initRealtimeServer, getMissedEvents, getRealtimeMetrics } from './services/realtime.service';
import { authRequired, AuthenticatedRequest } from './middleware/auth';
import { query } from './db';

// Realtime Reconnection & Resync Endpoint
app.get('/api/realtime/resync', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const since = req.query.since as string | undefined;

    let businessId: string | undefined;
    const bizRes = await query(`SELECT id FROM businesses WHERE owner_id = $1 LIMIT 1`, [userId]);
    if (bizRes.rows.length > 0) businessId = bizRes.rows[0].id;

    const missed = await getMissedEvents(userId, role, businessId, since);
    return sendSuccess(res, missed);
  } catch (err: any) {
    return sendError(res, err.message || 'Resync failed', 'SERVER_ERROR', 500);
  }
});

// Realtime System Metrics
app.get('/api/realtime/metrics', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  if (!['admin', 'super_admin'].includes(req.user!.role)) {
    return sendError(res, 'Unauthorized', 'FORBIDDEN', 403);
  }
  return sendSuccess(res, getRealtimeMetrics());
});

// 404 handler
app.use((_req: Request, res: Response) => {
  return sendError(res, 'Resource not found', 'NOT_FOUND', 404);
});

// Global error handler (prevents credential leaking in error traces)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[UNHANDLED_ERROR]', {
    message: err.message,
    code: err.code,
    timestamp: new Date().toISOString(),
  });
  return sendError(res, err.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', 500);
});

// Start Server with Startup Verification & WebSocket attachment
async function start() {
  console.log(`[STARTUP] Initializing VisitNepal in ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'} mode...`);

  const initialDbCheck = await getDbHealth();
  console.log(`[STARTUP] Database Status: ${initialDbCheck.status.toUpperCase()} (${initialDbCheck.provider})`);

  if (IS_PRODUCTION && initialDbCheck.status !== 'healthy') {
    console.error('[FATAL] Production database connectivity failed. Refusing to start with volatile store.');
    process.exit(1);
  }

  await runMigrations();

  const httpServer = http.createServer(app);
  initRealtimeServer(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`[SERVER_READY] VisitNepal TypeScript API & Realtime Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('[FATAL_STARTUP_ERROR]', err);
  process.exit(1);
});
