import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { DestinationsService } from './destinations.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller(['api/destinations', 'api/v1/destinations'])
export class DestinationsController {
  constructor(@Inject(DestinationsService) private readonly destinationsService: DestinationsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: any) {
    return this.destinationsService.findAll(query);
  }

  @Public()
  @Get('places/list')
  async getPlaces() {
    try {
      const fs = require('fs/promises');
      const path = require('path');
      const data = await fs.readFile(path.join(__dirname, '../data/places.json'), 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read places.json', e);
      return [];
    }
  }

  @Public()
  @Get('categories/list')
  async getCategories() {
    try {
      const fs = require('fs/promises');
      const path = require('path');
      const data = await fs.readFile(path.join(__dirname, '../data/categories.json'), 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read categories.json', e);
      return [];
    }
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.destinationsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any) {
    return this.destinationsService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.destinationsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async delete(@Param('id') id: string) {
    return this.destinationsService.delete(id);
  }
}
