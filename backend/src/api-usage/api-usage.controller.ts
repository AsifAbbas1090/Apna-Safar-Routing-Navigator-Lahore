import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiUsageService } from './api-usage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * API Usage Controller
 * Provides API usage statistics
 */
@Controller('api-usage')
export class ApiUsageController {
  constructor(private readonly apiUsageService: ApiUsageService) {}

  /**
   * Get user's API usage statistics
   * GET /api-usage
   * Protected route - requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsage(@Request() req) {
    return this.apiUsageService.getUserUsage(req.user.id);
  }
}


