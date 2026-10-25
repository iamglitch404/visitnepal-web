import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser } from '../middleware/auth';

@Controller(['api/payments', 'api/v1/payments'])
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Get('gateways')
  getGateways() {
    return this.paymentsService.getGateways();
  }

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createIntent(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.paymentsService.createIntent(user, body);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verify(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.paymentsService.verify(user, body);
  }

  @Public()
  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  async webhook(@Param('provider') provider: string, @Body() body: any) {
    return this.paymentsService.handleWebhook(provider, body);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refund(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: any
  ) {
    return this.paymentsService.refund(id, user, body);
  }
}
