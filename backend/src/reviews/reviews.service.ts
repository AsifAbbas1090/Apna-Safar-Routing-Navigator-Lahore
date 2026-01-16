import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new review
   */
  async createReview(userId: string, createReviewDto: CreateReviewDto) {
    const { rating, title, comment, serviceType } = createReviewDto;

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    return this.prisma.review.create({
      data: {
        userId,
        rating,
        title,
        comment,
        serviceType: serviceType || 'General',
        isApproved: true, // Auto-approve for now
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: false, // Don't expose email
          },
        },
      },
    });
  }

  /**
   * Get all approved reviews
   */
  async getReviews(serviceType?: string, limit = 10, offset = 0) {
    const where: any = {
      isApproved: true,
    };

    if (serviceType) {
      where.serviceType = serviceType;
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' }, // Featured first
          { createdAt: 'desc' }, // Newest first
        ],
        take: limit,
        skip: offset,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get overall rating statistics
   */
  async getRatingStats(serviceType?: string) {
    const where: any = {
      isApproved: true,
    };

    if (serviceType) {
      where.serviceType = serviceType;
    }

    const reviews = await this.prisma.review.findMany({
      where,
      select: {
        rating: true,
      },
    });

    if (reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;

    const distribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal
      total,
      distribution,
    };
  }

  /**
   * Get featured reviews (for homepage)
   */
  async getFeaturedReviews(limit = 3) {
    return this.prisma.review.findMany({
      where: {
        isApproved: true,
        isFeatured: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Update a review (user can update their own)
   */
  async updateReview(reviewId: string, userId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new BadRequestException('You can only update your own reviews');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: updateReviewDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Delete a review (user can delete their own)
   */
  async deleteReview(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    return { message: 'Review deleted successfully' };
  }
}

