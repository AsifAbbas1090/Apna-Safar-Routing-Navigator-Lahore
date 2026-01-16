import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionService } from './subscription.service';
import { Logger } from '@nestjs/common';

/**
 * Subscription Cron Jobs
 * Handles automatic downgrading of expired premium users
 */
@Injectable()
export class SubscriptionCron {
  private readonly logger = new Logger(SubscriptionCron.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  /**
   * Check and downgrade expired premium users
   * Runs daily at 3 AM
   */
  @Cron('0 3 * * *')
  async checkExpiredSubscriptions() {
    this.logger.log('Checking for expired premium subscriptions...');
    
    try {
      const downgradedCount = await this.subscriptionService.checkAndDowngradeExpired();
      if (downgradedCount > 0) {
        this.logger.log(`Downgraded ${downgradedCount} expired premium users to free tier`);
      } else {
        this.logger.log('No expired subscriptions found');
      }
    } catch (error) {
      this.logger.error('Error checking expired subscriptions:', error);
    }
  }
}


