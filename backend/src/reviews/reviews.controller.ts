import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/reviews.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * Create a new review
   * POST /reviews
   * Requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createReview(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.createReview(req.user.id, createReviewDto);
  }

  /**
   * Get all reviews
   * GET /reviews
   * Public endpoint
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getReviews(
    @Query('serviceType') serviceType?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.reviewsService.getReviews(
      serviceType,
      limit ? parseInt(limit, 10) : 10,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  /**
   * Get rating statistics
   * GET /reviews/stats
   * Public endpoint
   */
  @Get('stats')
  async getRatingStats(@Query('serviceType') serviceType?: string) {
    return this.reviewsService.getRatingStats(serviceType);
  }

  /**
   * Get featured reviews
   * GET /reviews/featured
   * Public endpoint
   */
  @Get('featured')
  async getFeaturedReviews(@Query('limit') limit?: string) {
    return this.reviewsService.getFeaturedReviews(limit ? parseInt(limit, 10) : 3);
  }

  /**
   * Update a review
   * PUT /reviews/:id
   * Requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateReview(
    @Param('id') id: string,
    @Request() req,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(id, req.user.id, updateReviewDto);
  }

  /**
   * Delete a review
   * DELETE /reviews/:id
   * Requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteReview(@Param('id') id: string, @Request() req) {
    return this.reviewsService.deleteReview(id, req.user.id);
  }
}

