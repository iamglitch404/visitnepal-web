import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser } from '../middleware/auth';

@Controller(['api/posts', 'api/v1/posts'])
export class CommunityController {
  constructor(@Inject(CommunityService) private readonly communityService: CommunityService) {}

  @Public()
  @Get()
  async findAll() {
    return this.communityService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.communityService.create(user, body);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async like(@Param('id') id: string) {
    return this.communityService.like(id);
  }
}
