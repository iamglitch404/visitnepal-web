import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller(['api/activities', 'api/v1/activities'])
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Public()
  @Get()
  async findAll(@Query() query: any) {
    return this.activitiesService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('activity_provider', 'business_owner', 'admin', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any) {
    return this.activitiesService.create(body);
  }
}
