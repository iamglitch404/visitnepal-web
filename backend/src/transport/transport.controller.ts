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
import { TransportService } from './transport.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller(['api/transport', 'api/v1/transport'])
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Public()
  @Get()
  async findAll(@Query() query: any) {
    return this.transportService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('transport_provider', 'business_owner', 'admin', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any) {
    return this.transportService.create(body);
  }
}
