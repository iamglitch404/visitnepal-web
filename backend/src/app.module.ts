import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// Middleware
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { AuditLoggerMiddleware } from './common/middleware/audit-logger.middleware';

// Global Filters, Interceptors, Guards
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

// Domain Modules
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { DestinationsModule } from './destinations/destinations.module';
import { HotelsModule } from './hotels/hotels.module';
import { ActivitiesModule } from './activities/activities.module';
import { TransportModule } from './transport/transport.module';
import { ProvidersModule } from './providers/providers.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { PermitsModule } from './permits/permits.module';
import { BusinessesModule } from './businesses/businesses.module';
import { AdminModule } from './admin/admin.module';
import { VerificationModule } from './verification/verification.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CommunityModule } from './community/community.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { TripsModule } from './trips/trips.module';
import { UserSchedulesModule } from './user-schedules/user-schedules.module';
import { RealtimeModule } from './realtime/realtime.module';
import { HealthModule } from './health/health.module';
import { GuideRequestsModule } from './guide-requests/guide-requests.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 20,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 120,
      },
    ]),
    DatabaseModule,
    AuthModule,
    DestinationsModule,
    HotelsModule,
    ActivitiesModule,
    TransportModule,
    ProvidersModule,
    BookingsModule,
    PaymentsModule,
    PermitsModule,
    BusinessesModule,
    AdminModule,
    VerificationModule,
    ChatModule,
    NotificationsModule,
    CommunityModule,
    ReviewsModule,
    FavoritesModule,
    TripsModule,
    UserSchedulesModule,
    RealtimeModule,
    HealthModule,
    GuideRequestsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, AuditLoggerMiddleware)
      .forRoutes('*');
  }
}
