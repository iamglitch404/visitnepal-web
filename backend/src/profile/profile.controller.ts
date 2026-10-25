import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser } from '../middleware/auth';

@Controller(['api/profile', 'api/v1/profile'])
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@CurrentUser() user: AuthUser) {
    return this.profileService.getProfile(user);
  }

  @Put()
  async updateProfile(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.profileService.updateProfile(user, body);
  }
}
