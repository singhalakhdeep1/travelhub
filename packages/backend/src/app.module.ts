import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SearchModule } from './search/search.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CacheModule } from './cache/cache.module';
import { QueueModule } from './queue/queue.module';
import { AISearchModule } from './ai-search/ai-search.module';
import { ReviewSummaryModule } from './review-summary/review-summary.module';
import { PricingModule } from './pricing/pricing.module';
import { CoHostModule } from './co-host/co-host.module';
import { TourModule } from './tour/tour.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    SearchModule,
    NotificationsModule,
    AnalyticsModule,
    CacheModule,
    QueueModule,
    AISearchModule,
    ReviewSummaryModule,
    PricingModule,
    CoHostModule,
    TourModule,
  ],
})
export class AppModule {}
