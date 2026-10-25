import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:Visitnpl%40world17@db.avlmoermtmtplkfwrxwo.supabase.co:5432/postgres';


export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
  max: IS_PRODUCTION ? 25 : 10,
  idleTimeoutMillis: 15000,
  connectionTimeoutMillis: IS_PRODUCTION ? 8000 : 3000,
});

pool.on('error', (err) => {
  console.error('[DB] PostgreSQL pool error:', err.message);
});

/**
 * Structured Database Health Checker
 */
export async function getDbHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  provider: 'postgresql' | 'memory_resilient';
  isProduction: boolean;
  latencyMs: number;
  totalConnections?: number;
  idleConnections?: number;
  waitingConnections?: number;
  error?: string | null;
}> {
  const start = Date.now();
  try {
    const res = await pool.query('SELECT 1 as ping');
    const latencyMs = Date.now() - start;
    if (res.rows[0]?.ping === 1) {
      return {
        status: 'healthy',
        provider: 'postgresql',
        isProduction: IS_PRODUCTION,
        latencyMs,
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingConnections: pool.waitingCount,
      };
    }
    throw new Error('Unexpected ping result from PostgreSQL');
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    return {
      status: 'unhealthy',
      provider: 'postgresql',
      isProduction: IS_PRODUCTION,
      latencyMs,
      error: `PostgreSQL connection failed: ${err.message}`,
    };
  }
}

/**
 * Executes a query with strict production isolation.
 * IN PRODUCTION: Rejects query if PostgreSQL is unavailable. NEVER silently falls back to memory.
 * IN DEVELOPMENT: Emits warning and permits local memory resilience for rapid developer iteration.
 */
export async function query(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> {
  try {
    const res = await pool.query(text, params);
    return { rows: res.rows, rowCount: res.rowCount ?? res.rows.length };
  } catch (err: any) {
    console.error('[DB_ERROR]', {
      query: text.substring(0, 100),
      error: err.message,
    });
    throw err;
  }
}

/**
 * Transaction wrapper with strict production isolation.
 */
export async function withTransaction<T>(
  callback: (client: any) => Promise<T>,
  userId?: string
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (userId) {
      await client.query("SET LOCAL app.current_user_id = $1", [userId]);
    }
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
