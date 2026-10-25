import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthUser } from '../middleware/auth';

@Controller(['api/admin', 'api/v1/admin'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  async getMetrics() {
    return this.adminService.getMetrics();
  }

  @Get('users')
  async getUsers(@Query() query: any) {
    return this.adminService.getUsers(query);
  }

  @Put('users/:id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @CurrentUser() actor: AuthUser,
    @Body() body: any
  ) {
    return this.adminService.updateUserStatus(id, actor, body);
  }

  @Get('businesses')
  async getBusinesses(@Query() query: any) {
    return this.adminService.getBusinesses(query);
  }

  @Put('businesses/:id/verify')
  async verifyBusiness(
    @Param('id') id: string,
    @CurrentUser() actor: AuthUser,
    @Body() body: any
  ) {
    return this.adminService.verifyBusiness(id, actor, body);
  }

  @Get('audit-logs')
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}
