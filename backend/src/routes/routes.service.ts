import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RoutesRepository } from './routes.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Route } from '@prisma/client';

/**
 * Routes Service
 * Business logic for routes
 */
@Injectable()
export class RoutesService {
  constructor(
    private readonly routesRepository: RoutesRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get all routes
   */
  async getAllRoutes(): Promise<Route[]> {
    return this.routesRepository.findAll();
  }

  /**
   * Get route by ID with stops
   */
  async getRouteById(id: string): Promise<Route & { routeStops: any[] }> {
    const route = await this.routesRepository.findByIdWithStops(id);
    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }
    return route;
  }

  /**
   * Save a planned route for a user
   */
  async saveRoute(
    userId: string,
    routeData: {
      startStopId: string;
      endStopId: string;
      routeIds: string[];
      etaMinutes: number;
      stepsJson: string;
      preference?: string;
      walkingDistanceM?: number;
      transfersCount?: number;
      savedName?: string;
    },
  ) {
    return this.prisma.plannedRoute.create({
      data: {
        ...routeData,
        userId,
        isSaved: true,
      },
      include: {
        startStop: true,
        endStop: true,
      },
    });
  }

  /**
   * Get user's saved routes
   */
  async getSavedRoutes(userId: string) {
    return this.prisma.plannedRoute.findMany({
      where: {
        userId,
        isSaved: true,
      },
      include: {
        startStop: true,
        endStop: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Delete a saved route
   */
  async deleteSavedRoute(userId: string, routeId: string) {
    const route = await this.prisma.plannedRoute.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    if (route.userId !== userId) {
      throw new UnauthorizedException('You can only delete your own routes');
    }

    return this.prisma.plannedRoute.delete({
      where: { id: routeId },
    });
  }

  /**
   * Mark route as completed
   */
  async completeRoute(
    userId: string,
    routeId: string,
    actualDurationMin: number,
  ) {
    const route = await this.prisma.plannedRoute.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    if (route.userId !== userId) {
      throw new UnauthorizedException('You can only complete your own routes');
    }

    return this.prisma.plannedRoute.update({
      where: { id: routeId },
      data: {
        completedAt: new Date(),
        actualDurationMin,
      },
    });
  }

  /**
   * Get user's route history
   */
  async getRouteHistory(userId: string, limit: number = 10) {
    return this.prisma.plannedRoute.findMany({
      where: {
        userId,
        completedAt: { not: null },
      },
      include: {
        startStop: true,
        endStop: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: limit,
    });
  }
}
