import { Module } from '@nestjs/common';
import { RoutingService } from './routing.service';
import { RoutingController } from './routing.controller';
import { StopsModule } from '../stops/stops.module';
import { RoutesModule } from '../routes/routes.module';
import { PrismaModule } from '../prisma/prisma.module';
import { NavigationModule } from '../navigation/navigation.module';
import { GoogleMapsModule } from '../google-maps/google-maps.module';

/**
 * Routing Module
 * Handles route planning and pathfinding
 */
@Module({
  imports: [StopsModule, RoutesModule, PrismaModule, NavigationModule, GoogleMapsModule],
  controllers: [RoutingController],
  providers: [RoutingService],
  exports: [RoutingService],
})
export class RoutingModule {}

