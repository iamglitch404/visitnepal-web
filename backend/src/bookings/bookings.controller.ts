import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BookingsService } from './bookings.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser } from '../middleware/auth';

@Controller(['api/bookings', 'api/v1/bookings'])
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    return this.bookingsService.findAll(user);
  }

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() body: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.bookingsService.create(user, body);
    if (result.isExisting) {
      res.status(HttpStatus.OK);
    } else {
      res.status(HttpStatus.CREATED);
    }
    return result.booking;
  }

  @Post(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body('reason') reason?: string
  ) {
    return this.bookingsService.cancel(id, user, reason);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body('status') status: string
  ) {
    return this.bookingsService.updateStatus(id, user, status);
  }
}
