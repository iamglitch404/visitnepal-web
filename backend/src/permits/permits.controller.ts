import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PermitsService } from './permits.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthUser } from '../middleware/auth';

@Controller(['api/permits', 'api/v1/permits'])
export class PermitsController {
  constructor(private readonly permitsService: PermitsService) {}

  @Public()
  @Get('authorities')
  async getAuthorities() {
    return this.permitsService.getAuthorities();
  }

  @Public()
  @Get('types')
  async getTypes() {
    return this.permitsService.getTypes();
  }

  @Public()
  @Get('types/:id/requirements')
  async getRequirements(@Param('id') id: string) {
    return this.permitsService.getRequirements(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@CurrentUser() user: AuthUser, @Query() query: any) {
    return this.permitsService.findAll(user, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async submit(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.permitsService.submit(user, body);
  }

  @Get(':id/digital-permit')
  @UseGuards(JwtAuthGuard)
  async getDigitalPermit(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.permitsService.getDigitalPermit(id, user);
  }

  @Public()
  @Get('verify/:refCode')
  async verifyRefCode(@Param('refCode') refCode: string) {
    return this.permitsService.verifyRefCode(refCode);
  }

  @Put(':id/resubmit')
  @UseGuards(JwtAuthGuard)
  async resubmit(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: any
  ) {
    return this.permitsService.resubmit(id, user, body);
  }

  @Put(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'verification_officer', 'permit_officer')
  async review(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: any
  ) {
    return this.permitsService.review(id, user, body);
  }

  @Get(':id/audit-history')
  @UseGuards(JwtAuthGuard)
  async getAuditHistory(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.permitsService.getAuditHistory(id, user);
  }
}
