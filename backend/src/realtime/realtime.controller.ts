import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser } from '../middleware/auth';

@Controller(['api/realtime', 'api/v1/realtime'])
@UseGuards(JwtAuthGuard)
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Get('resync')
  async resync(@CurrentUser() user: AuthUser, @Query('since') since?: string) {
    return this.realtimeService.resync(user, since);
  }

  @Get('metrics')
  async getMetrics(@CurrentUser() user: AuthUser) {
    return this.realtimeService.getMetrics(user);
  }
}
