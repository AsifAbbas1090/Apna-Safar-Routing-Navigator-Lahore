import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Subscription Service
 * Handles user subscription management
 */
@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upgrade user to premium
   */
  async upgradeToPremium(
    userId: string,
    plan: 'monthly' | 'yearly' | 'lifetime',
    expiresAt?: Date,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate expiry date based on plan
    let expiryDate: Date | null = null;
    if (plan === 'monthly') {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (plan === 'yearly') {
      expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else if (plan === 'lifetime') {
      expiryDate = null; // No expiry
    }

    if (expiresAt) {
      expiryDate = expiresAt;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        premiumExpiresAt: expiryDate,
        subscriptionPlan: plan,
      },
    });
  }

  /**
   * Downgrade user to free
   */
  async downgradeToFree(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: false,
        premiumExpiresAt: null,
        subscriptionPlan: 'free',
      },
    });
  }

  /**
   * Check and downgrade expired premium users (called by cron)
   */
  async checkAndDowngradeExpired() {
    const now = new Date();
    const expiredUsers = await this.prisma.user.findMany({
      where: {
        isPremium: true,
        premiumExpiresAt: {
          not: null,
          lte: now,
        },
      },
    });

    let downgradedCount = 0;
    for (const user of expiredUsers) {
      await this.downgradeToFree(user.id);
      downgradedCount++;
    }

    return downgradedCount;
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPremium = user.isPremium && (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date());

    return {
      isPremium,
      plan: user.subscriptionPlan || 'free',
      expiresAt: user.premiumExpiresAt,
      daysRemaining: user.premiumExpiresAt
        ? Math.max(0, Math.ceil((new Date(user.premiumExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
        : null,
    };
  }
}


