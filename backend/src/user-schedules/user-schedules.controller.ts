import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserSchedulesService } from './user-schedules.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser } from '../middleware/auth';

@Controller(['api/user-schedules', 'api/v1/user-schedules'])
@UseGuards(JwtAuthGuard)
export class UserSchedulesController {
  constructor(private readonly userSchedulesService: UserSchedulesService) {}

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    return this.userSchedulesService.findAll(user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.userSchedulesService.create(user, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.userSchedulesService.delete(id, user);
  }
}
