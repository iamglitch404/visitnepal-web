import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser } from '../middleware/auth';

@Controller(['api/businesses', 'api/v1/businesses'])
@UseGuards(JwtAuthGuard)
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get('me')
  async getMe(@CurrentUser() user: AuthUser) {
    return this.businessesService.getMe(user);
  }

  @Put('me')
  async updateMe(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.businessesService.updateMe(user, body);
  }

  @Get('analytics')
  async getAnalytics(@CurrentUser() user: AuthUser) {
    return this.businessesService.getAnalytics(user);
  }

  @Post('services')
  @HttpCode(HttpStatus.CREATED)
  async addService(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.businessesService.addService(user, body);
  }

  // Hotel rooms & availability
  @Get('hotel/rooms')
  async getHotelRooms(@CurrentUser() user: AuthUser) {
    return this.businessesService.getHotelRooms(user);
  }

  @Post('hotel/rooms')
  @HttpCode(HttpStatus.CREATED)
  async addHotelRoom(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.businessesService.addHotelRoom(user, body);
  }

  @Get('hotel/availability')
  async getHotelAvailability(@CurrentUser() user: AuthUser) {
    return this.businessesService.getHotelAvailability(user);
  }

  @Post('hotel/availability')
  @HttpCode(HttpStatus.OK)
  async updateHotelAvailability(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.businessesService.updateHotelAvailability(user, body);
  }

  // Trekking
  @Get('trekking/packages')
  async getTrekkingPackages(@CurrentUser() user: AuthUser) {
    return this.businessesService.getTrekkingPackages(user);
  }

  @Post('trekking/packages')
  @HttpCode(HttpStatus.CREATED)
  async addTrekkingPackage(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.businessesService.addTrekkingPackage(user, body);
  }

  // Adventure
  @Get('adventure/activities')
  async getAdventureActivities(@CurrentUser() user: AuthUser) {
    return this.businessesService.getAdventureActivities(user);
  }

  @Post('adventure/activities')
  @HttpCode(HttpStatus.CREATED)
  async addAdventureActivity(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.businessesService.addAdventureActivity(user, body);
  }

  @Put('adventure/activities/:id/weather')
  async updateActivityWeather(@Param('id') id: string, @Body() body: any) {
    return this.businessesService.updateActivityWeather(id, body);
  }

  // Transport
  @Get('transport/fleet')
  async getTransportFleet(@CurrentUser() user: AuthUser) {
    return this.businessesService.getTransportFleet(user);
  }

  @Post('transport/fleet')
  @HttpCode(HttpStatus.CREATED)
  async addTransportVehicle(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.businessesService.addTransportVehicle(user, body);
  }

  @Put('transport/fleet/:id/status')
  async updateVehicleStatus(@Param('id') id: string, @Body() body: any) {
    return this.businessesService.updateVehicleStatus(id, body);
  }

  @Get('transport/routes')
  async getTransportRoutes(@CurrentUser() user: AuthUser) {
    return this.businessesService.getTransportRoutes(user);
  }

  @Post('transport/routes')
  @HttpCode(HttpStatus.CREATED)
  async addTransportRoute(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.businessesService.addTransportRoute(user, body);
  }

  // Homestay
  @Get('homestay/profile')
  async getHomestayProfile(@CurrentUser() user: AuthUser) {
    return this.businessesService.getHomestayProfile(user);
  }

  @Put('homestay/profile')
  async updateHomestayProfile(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.businessesService.updateHomestayProfile(user, body);
  }

  // Tours
  @Get('tours/packages')
  async getTourPackages(@CurrentUser() user: AuthUser) {
    return this.businessesService.getTourPackages(user);
  }

  @Post('tours/packages')
  @HttpCode(HttpStatus.CREATED)
  async addTourPackage(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.businessesService.addTourPackage(user, body);
  }

  // Attractions
  @Get('attractions/tickets')
  async getAttractionTickets(@CurrentUser() user: AuthUser) {
    return this.businessesService.getAttractionTickets(user);
  }

  @Post('attractions/tickets')
  @HttpCode(HttpStatus.CREATED)
  async addAttractionTicket(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.businessesService.addAttractionTicket(user, body);
  }

  @Put('attractions/notice')
  async updateAttractionNotice(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.businessesService.updateAttractionNotice(user, body);
  }

  // Guide
  @Get('guide/profile')
  async getGuideProfile(@CurrentUser() user: AuthUser) {
    return this.businessesService.getGuideProfile(user);
  }

  @Get('guide/assignments')
  async getGuideAssignments(@CurrentUser() user: AuthUser) {
    return this.businessesService.getGuideAssignments(user);
  }

  // Staff
  @Get('staff')
  async getStaff(@CurrentUser() user: AuthUser) {
    return this.businessesService.getStaff(user);
  }

  @Post('staff')
  @HttpCode(HttpStatus.CREATED)
  async addStaff(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.businessesService.addStaff(user, body);
  }

  @Delete('staff/:id')
  async removeStaff(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.businessesService.removeStaff(id, user);
  }

  // Schedules
  @Get('schedules')
  async getSchedules(@CurrentUser() user: AuthUser) {
    return this.businessesService.getSchedules(user);
  }

  @Post('schedules')
  @HttpCode(HttpStatus.CREATED)
  async addSchedule(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.businessesService.addSchedule(user, body);
  }

  @Delete('schedules/:id')
  async removeSchedule(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.businessesService.removeSchedule(id, user);
  }

  // Transactions & payouts
  @Get('transactions')
  async getTransactions(@CurrentUser() user: AuthUser) {
    return this.businessesService.getTransactions(user);
  }

  @Get('payouts')
  async getPayouts(@CurrentUser() user: AuthUser) {
    return this.businessesService.getPayouts(user);
  }

  @Post('payouts')
  @HttpCode(HttpStatus.CREATED)
  async requestPayout(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.businessesService.requestPayout(user, body);
  }
}
