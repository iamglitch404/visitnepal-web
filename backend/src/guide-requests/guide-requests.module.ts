import { Module } from '@nestjs/common';
import { GuideRequestsController } from './guide-requests.controller';
import { GuideRequestsService } from './guide-requests.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GuideRequestsController],
  providers: [GuideRequestsService],
  exports: [GuideRequestsService],
})
export class GuideRequestsModule {}
