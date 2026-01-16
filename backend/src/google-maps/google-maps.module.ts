import { Module } from '@nestjs/common';
import { GoogleMapsService } from './google-maps.service';
import { GoogleMapsController } from './google-maps.controller';
import { ApiUsageModule } from '../api-usage/api-usage.module';

/**
 * Google Maps Module
 * Handles Google Maps API integration
 */
@Module({
  imports: [ApiUsageModule],
  controllers: [GoogleMapsController],
  providers: [GoogleMapsService],
  exports: [GoogleMapsService],
})
export class GoogleMapsModule {}


