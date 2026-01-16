import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserApiUsage } from '@prisma/client';

/**
 * API Usage Repository
 * Handles database operations for API usage tracking
 */
@Injectable()
export class ApiUsageRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create API usage record for user
   */
  async getOrCreate(userId: string): Promise<UserApiUsage> {
    let usage = await this.prisma.userApiUsage.findUnique({
      where: { userId },
    });

    if (!usage) {
      const currentMonth = new Date().getMonth() + 1;
      usage = await this.prisma.userApiUsage.create({
        data: {
          userId,
          resetMonth: currentMonth,
          lastResetAt: new Date(),
        },
      });
    }

    return usage;
  }

  /**
   * Increment API usage counter
   */
  async increment(
    userId: string,
    apiType: 'dynamicMapsCount' | 'placesAutocompleteCount' | 'directionsCount' | 'geocodingCount' | 'staticMapsCount',
  ): Promise<UserApiUsage> {
    const usage = await this.getOrCreate(userId);
    
    return this.prisma.userApiUsage.update({
      where: { userId },
      data: {
        [apiType]: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Get current usage for user
   */
  async getUsage(userId: string): Promise<UserApiUsage | null> {
    return this.prisma.userApiUsage.findUnique({
      where: { userId },
    });
  }

  /**
   * Reset monthly counters (called by cron job)
   */
  async resetMonthlyCounters(userId: string): Promise<UserApiUsage> {
    const currentMonth = new Date().getMonth() + 1;
    
    return this.prisma.userApiUsage.update({
      where: { userId },
      data: {
        dynamicMapsCount: 0,
        placesAutocompleteCount: 0,
        directionsCount: 0,
        geocodingCount: 0,
        staticMapsCount: 0,
        lastResetAt: new Date(),
        resetMonth: currentMonth,
      },
    });
  }

  /**
   * Reset all users' counters for new month (cron job)
   */
  async resetAllMonthlyCounters(): Promise<number> {
    const currentMonth = new Date().getMonth() + 1;
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;

    const result = await this.prisma.userApiUsage.updateMany({
      where: {
        resetMonth: { not: currentMonth },
      },
      data: {
        dynamicMapsCount: 0,
        placesAutocompleteCount: 0,
        directionsCount: 0,
        geocodingCount: 0,
        staticMapsCount: 0,
        lastResetAt: new Date(),
        resetMonth: currentMonth,
      },
    });

    return result.count;
  }

  /**
   * Check if user has exceeded free tier limit
   */
  async hasExceededLimit(
    userId: string,
    apiType: 'dynamicMapsCount' | 'placesAutocompleteCount' | 'directionsCount' | 'geocodingCount' | 'staticMapsCount',
    limit: number,
  ): Promise<boolean> {
    const usage = await this.getUsage(userId);
    if (!usage) return false;

    const currentCount = usage[apiType];
    return currentCount >= limit;
  }
}


