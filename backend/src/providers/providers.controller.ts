import { Controller, Get, Put, Query, Body, UseGuards } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser } from '../middleware/auth';

@Controller(['api/providers', 'api/v1/providers'])
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Public()
  @Get()
  async findAll(@Query() query: any) {
    return this.providersService.findAll(query);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.providersService.updateMe(user.id, body);
  }
}
