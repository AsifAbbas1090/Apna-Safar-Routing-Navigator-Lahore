import { Module } from '@nestjs/common';
import { ApiUsageService } from './api-usage.service';
import { ApiUsageRepository } from './api-usage.repository';
import { ApiUsageController } from './api-usage.controller';
import { ApiUsageCron } from './api-usage.cron';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * API Usage Module
 * Handles Google Maps API usage tracking and limits
 */
@Module({
  imports: [PrismaModule],
  controllers: [ApiUsageController],
  providers: [ApiUsageService, ApiUsageRepository, ApiUsageCron],
  exports: [ApiUsageService, ApiUsageRepository],
})
export class ApiUsageModule {}

