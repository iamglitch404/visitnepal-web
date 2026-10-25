import { Injectable } from '@nestjs/common';
import { query as rawQuery, withTransaction as rawWithTransaction, getDbHealth } from '../db';
import { IDatabaseService, QueryResult, DbHealthResult } from './database.interface';

@Injectable()
export class DatabaseService implements IDatabaseService {
  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    const res = await rawQuery(sql, params);
    return {
      rows: res.rows,
      rowCount: res.rowCount,
    };
  }

  async withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    return rawWithTransaction(callback);
  }

  async getHealth(): Promise<DbHealthResult> {
    const health = await getDbHealth();
    return {
      status: health.status as any,
      latencyMs: health.latencyMs,
      timestamp: new Date().toISOString(),
      provider: health.provider as any,
    };
  }
}
