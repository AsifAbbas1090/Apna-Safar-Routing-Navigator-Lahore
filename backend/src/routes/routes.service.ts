import { Injectable } from '@nestjs/common';
import { RoutesRepository } from './routes.repository';
import { Route, TransportType } from '@prisma/client';

/**
 * Routes Service
 * Business logic for routes operations
 */
@Injectable()
export class RoutesService {
  constructor(private readonly routesRepository: RoutesRepository) {}

  /**
   * Get all routes
   */
  async getAllRoutes(): Promise<Route[]> {
    return this.routesRepository.findAll();
  }

  /**
   * Get route by ID with stops
   */
  async getRouteById(id: string) {
    return this.routesRepository.findByIdWithStops(id);
  }

  /**
   * Get routes by transport type
   */
  async getRoutesByType(type: TransportType): Promise<Route[]> {
    return this.routesRepository.findByTransportType(type);
  }

  /**
   * Get routes passing through a stop
   */
  async getRoutesByStop(stopId: string): Promise<Route[]> {
    return this.routesRepository.findRoutesByStop(stopId);
  }
}

