import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiUsageService } from './api-usage.service';
import { Logger } from '@nestjs/common';

/**
 * API Usage Cron Jobs
 * Handles monthly reset of API usage counters
 */
@Injectable()
export class ApiUsageCron {
  private readonly logger = new Logger(ApiUsageCron.name);

  constructor(private readonly apiUsageService: ApiUsageService) {}

  /**
   * Reset all users' monthly API usage counters
   * Runs on the 1st day of each month at midnight
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async resetMonthlyCounters() {
    this.logger.log('Starting monthly API usage counter reset...');
    
    try {
      const resetCount = await this.apiUsageService.resetAllMonthlyCounters();
      this.logger.log(`Successfully reset API usage counters for ${resetCount} users`);
    } catch (error) {
      this.logger.error('Error resetting monthly API usage counters:', error);
    }
  }

  /**
   * Also run daily check to catch any missed resets
   * Runs daily at 2 AM
   */
  @Cron('0 2 * * *')
  async dailyResetCheck() {
    this.logger.log('Running daily API usage reset check...');
    
    try {
      const resetCount = await this.apiUsageService.resetAllMonthlyCounters();
      if (resetCount > 0) {
        this.logger.log(`Reset API usage counters for ${resetCount} users (missed monthly reset)`);
      }
    } catch (error) {
      this.logger.error('Error in daily reset check:', error);
    }
  }
}


