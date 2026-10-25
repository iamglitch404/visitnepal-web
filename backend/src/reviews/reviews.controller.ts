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
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser } from '../middleware/auth';

@Controller(['api/reviews', 'api/v1/reviews'])
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: any) {
    return this.reviewsService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.reviewsService.create(user, body);
  }

  @Post(':id/response')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async respond(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: any
  ) {
    return this.reviewsService.respond(id, user, body);
  }
}
