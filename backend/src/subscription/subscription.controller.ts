import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';

/**
 * Upgrade Subscription DTO
 */
class UpgradeSubscriptionDto {
  @IsEnum(['monthly', 'yearly', 'lifetime'])
  plan: 'monthly' | 'yearly' | 'lifetime';

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

/**
 * Subscription Controller
 * Handles subscription management
 */
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  /**
   * Get subscription status
   * GET /subscription/status
   * Protected route - requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@Request() req) {
    return this.subscriptionService.getSubscriptionStatus(req.user.id);
  }

  /**
   * Upgrade to premium
   * POST /subscription/upgrade
   * Protected route - requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Post('upgrade')
  async upgrade(@Request() req, @Body() upgradeDto: UpgradeSubscriptionDto) {
    const expiresAt = upgradeDto.expiresAt ? new Date(upgradeDto.expiresAt) : undefined;
    return this.subscriptionService.upgradeToPremium(req.user.id, upgradeDto.plan, expiresAt);
  }

  /**
   * Downgrade to free
   * POST /subscription/downgrade
   * Protected route - requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Post('downgrade')
  async downgrade(@Request() req) {
    return this.subscriptionService.downgradeToFree(req.user.id);
  }
}


