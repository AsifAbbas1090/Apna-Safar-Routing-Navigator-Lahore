import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Dashboard Controller
 * Provides user statistics and analytics
 */
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get user dashboard statistics
   * GET /dashboard/stats
   * Protected route - requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Request() req) {
    return this.dashboardService.getUserStats(req.user.id);
  }
}


