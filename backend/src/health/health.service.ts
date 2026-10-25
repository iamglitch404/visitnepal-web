import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class HealthService {
  constructor(private readonly db: DatabaseService) {}

  async getHealth() {
    const dbHealth = await this.db.getHealth();
    const isHealthy = dbHealth.status === 'healthy' || process.env.NODE_ENV !== 'production';

    return {
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
  }

  async getDbHealth() {
    return this.db.getHealth();
  }
}
