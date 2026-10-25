export interface QueryResult<T = any> {
  rows: T[];
  rowCount?: number;
}

export interface DbHealthResult {
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  timestamp: string;
  provider: 'postgresql' | 'memory_db' | 'supabase';
}

export interface IDatabaseService {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T>;
  getHealth(): Promise<DbHealthResult>;
}
