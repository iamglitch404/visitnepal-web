import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthUser } from '../middleware/auth';

@Controller(['api/hotels', 'api/v1/hotels'])
export class HotelsController {
  constructor(@Inject(HotelsService) private readonly hotelsService: HotelsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: any) {
    return this.hotelsService.findAll(query);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.hotelsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('hotel', 'business_owner', 'admin', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.hotelsService.create(user, body);
  }

  @Post(':id/rooms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('hotel', 'business_owner', 'admin', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  async addRoom(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: any
  ) {
    return this.hotelsService.addRoom(id, user, body);
  }
}
