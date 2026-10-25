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
import { FavoritesService } from './favorites.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser } from '../middleware/auth';

@Controller(['api/favorites', 'api/v1/favorites'])
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async findAll(@CurrentUser() user: AuthUser, @Query() query: any) {
    return this.favoritesService.findAll(user, query);
  }

  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  async toggle(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.favoritesService.toggle(user, body);
  }
}
