import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { GuideRequestsService } from './guide-requests.service';
import { Public } from '../common/decorators/public.decorator';

@Controller(['api/guide_requests', 'api/v1/guide_requests'])
export class GuideRequestsController {
  constructor(@Inject(GuideRequestsService) private readonly guideRequestsService: GuideRequestsService) {}

  @Public()
  @Get()
  async findAll() {
    return this.guideRequestsService.findAll();
  }

  @Public()
  @Post('confirm')
  async confirm(@Body('id') id: string) {
    return this.guideRequestsService.confirm(id);
  }

  @Public()
  @Post('delete')
  async delete(@Body('id') id: string) {
    return this.guideRequestsService.delete(id);
  }
}
