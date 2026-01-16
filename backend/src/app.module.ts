import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { StopsModule } from './stops/stops.module';
import { RoutesModule } from './routes/routes.module';
import { RoutingModule } from './routing/routing.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ApiUsageModule } from './api-usage/api-usage.module';
import { GoogleMapsModule } from './google-maps/google-maps.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { NavigationModule } from './navigation/navigation.module';
import { ScheduleModule } from '@nestjs/schedule';

/**
 * Root Application Module
 * Imports all feature modules and configuration
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(), // For cron jobs
    PrismaModule,
    AuthModule,
    StopsModule,
    RoutesModule,
    RoutingModule,
    DashboardModule,
    ApiUsageModule,
    GoogleMapsModule,
    SubscriptionModule,
    NavigationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
