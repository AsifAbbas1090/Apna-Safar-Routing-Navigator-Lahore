import { Injectable, ForbiddenException } from '@nestjs/common';
import { ApiUsageRepository } from './api-usage.repository';
import { PrismaService } from '../prisma/prisma.service';

/**
 * API Usage Service
 * Manages Google Maps API usage tracking and limits
 */
@Injectable()
export class ApiUsageService {
  // Free tier limits per month (Google Maps free tier)
  private readonly FREE_TIER_LIMITS = {
    dynamicMapsCount: 10000,
    placesAutocompleteCount: 10000,
    directionsCount: 10000,
    geocodingCount: 10000,
    staticMapsCount: 10000,
  };

  // Premium tier limits (much higher or unlimited)
  private readonly PREMIUM_TIER_LIMITS = {
    dynamicMapsCount: 1000000, // 1M
    placesAutocompleteCount: 1000000,
    directionsCount: 1000000,
    geocodingCount: 1000000,
    staticMapsCount: 1000000,
  };

  constructor(
    private readonly apiUsageRepository: ApiUsageRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Check if user can make API call
   */
  async canMakeApiCall(
    userId: string,
    apiType: 'dynamicMapsCount' | 'placesAutocompleteCount' | 'directionsCount' | 'geocodingCount' | 'staticMapsCount',
  ): Promise<{ allowed: boolean; message?: string; currentUsage?: number; limit?: number }> {
    // Guest users are always allowed (no tracking)
    if (userId === 'guest') {
      return { allowed: true };
    }

    // Check if user is premium
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Premium users have higher limits
    const isPremium = this.isUserPremium(user);
    const limits = isPremium ? this.PREMIUM_TIER_LIMITS : this.FREE_TIER_LIMITS;
    const limit = limits[apiType];

    // Check current usage
    const usage = await this.apiUsageRepository.getUsage(userId);
    
    // Reset if new month
    if (usage && this.shouldReset(usage)) {
      await this.apiUsageRepository.resetMonthlyCounters(userId);
      return { allowed: true, currentUsage: 0, limit };
    }

    const currentUsage = usage?.[apiType] || 0;

    if (currentUsage >= limit) {
      return {
        allowed: false,
        message: isPremium
          ? 'API usage limit reached. Please contact support.'
          : 'API usage limit reached. Upgrade to premium to continue.',
        currentUsage,
        limit,
      };
    }

    return { allowed: true, currentUsage, limit };
  }

  /**
   * Track API usage (increment counter)
   */
  async trackApiUsage(
    userId: string,
    apiType: 'dynamicMapsCount' | 'placesAutocompleteCount' | 'directionsCount' | 'geocodingCount' | 'staticMapsCount',
  ): Promise<void> {
    // Skip tracking for guest users
    if (userId === 'guest') {
      return;
    }

    // Check if reset needed
    const usage = await this.apiUsageRepository.getUsage(userId);
    if (usage && this.shouldReset(usage)) {
      await this.apiUsageRepository.resetMonthlyCounters(userId);
    }

    await this.apiUsageRepository.increment(userId, apiType);
  }

  /**
   * Get usage statistics for user
   */
  async getUserUsage(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const usage = await this.apiUsageRepository.getUsage(userId);
    const isPremium = this.isUserPremium(user);
    const limits = isPremium ? this.PREMIUM_TIER_LIMITS : this.FREE_TIER_LIMITS;

    return {
      isPremium,
      usage: usage
        ? {
            dynamicMaps: {
              current: usage.dynamicMapsCount,
              limit: limits.dynamicMapsCount,
              percentage: Math.round((usage.dynamicMapsCount / limits.dynamicMapsCount) * 100),
            },
            placesAutocomplete: {
              current: usage.placesAutocompleteCount,
              limit: limits.placesAutocompleteCount,
              percentage: Math.round((usage.placesAutocompleteCount / limits.placesAutocompleteCount) * 100),
            },
            directions: {
              current: usage.directionsCount,
              limit: limits.directionsCount,
              percentage: Math.round((usage.directionsCount / limits.directionsCount) * 100),
            },
            geocoding: {
              current: usage.geocodingCount,
              limit: limits.geocodingCount,
              percentage: Math.round((usage.geocodingCount / limits.geocodingCount) * 100),
            },
            staticMaps: {
              current: usage.staticMapsCount,
              limit: limits.staticMapsCount,
              percentage: Math.round((usage.staticMapsCount / limits.staticMapsCount) * 100),
            },
            lastResetAt: usage.lastResetAt,
          }
        : null,
    };
  }

  /**
   * Check if user is premium
   */
  private isUserPremium(user: { isPremium: boolean; premiumExpiresAt: Date | null }): boolean {
    if (!user.isPremium) return false;
    
    if (user.premiumExpiresAt) {
      return new Date(user.premiumExpiresAt) > new Date();
    }
    
    return true; // Premium without expiry (lifetime)
  }

  /**
   * Check if monthly reset is needed
   */
  private shouldReset(usage: { resetMonth: number; lastResetAt: Date }): boolean {
    const currentMonth = new Date().getMonth() + 1;
    return usage.resetMonth !== currentMonth;
  }

  /**
   * Reset all users' monthly counters (called by cron)
   */
  async resetAllMonthlyCounters(): Promise<number> {
    return this.apiUsageRepository.resetAllMonthlyCounters();
  }
}


