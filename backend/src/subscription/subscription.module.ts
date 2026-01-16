import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionCron } from './subscription.cron';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Subscription Module
 * Handles subscription management
 */
@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionCron],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}


