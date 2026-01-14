import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Route, RouteStop, TransportType, Prisma } from '@prisma/client';

/**
 * Routes Repository
 * Handles all database operations for routes and route stops
 */
@Injectable()
export class RoutesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find route by ID with stops
   */
  async findByIdWithStops(id: string): Promise<Route & { routeStops: (RouteStop & { stop: any })[] } | null> {
    return this.prisma.route.findUnique({
      where: { id },
      include: {
        routeStops: {
          include: {
            stop: true,
          },
          orderBy: {
            stopOrder: 'asc',
          },
        },
      },
    });
  }

  /**
   * Find all routes
   */
  async findAll(where?: Prisma.RouteWhereInput): Promise<Route[]> {
    return this.prisma.route.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find routes by transport type
   */
  async findByTransportType(type: TransportType): Promise<Route[]> {
    return this.prisma.route.findMany({
      where: { transportType: type },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get route stops in order
   */
  async getRouteStops(routeId: string): Promise<(RouteStop & { stop: any })[]> {
    return this.prisma.routeStop.findMany({
      where: { routeId },
      include: {
        stop: true,
      },
      orderBy: {
        stopOrder: 'asc',
      },
    });
  }

  /**
   * Find routes that pass through a specific stop
   */
  async findRoutesByStop(stopId: string): Promise<Route[]> {
    const routeStops = await this.prisma.routeStop.findMany({
      where: { stopId },
      include: {
        route: true,
      },
    });
    return routeStops.map((rs) => rs.route);
  }
}

