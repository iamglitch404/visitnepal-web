import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from './health.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  async getHealth(@Res({ passthrough: true }) res: Response) {
    const health = await this.healthService.getHealth();
    if (health.status === 'degraded' && process.env.NODE_ENV === 'production') {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    } else {
      res.status(HttpStatus.OK);
    }
    return health;
  }

  @Public()
  @Get('db')
  async getDbHealth(@Res({ passthrough: true }) res: Response) {
    const dbHealth = await this.healthService.getDbHealth();
    if (dbHealth.status !== 'healthy' && process.env.NODE_ENV === 'production') {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    } else {
      res.status(HttpStatus.OK);
    }
    return dbHealth;
  }
}
