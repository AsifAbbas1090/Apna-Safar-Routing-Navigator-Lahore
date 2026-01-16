import { Injectable } from '@nestjs/common';
import { StopsRepository } from './stops.repository';
import { Stop, StopType } from '@prisma/client';

/**
 * Stops Service
 * Business logic for stops operations
 * No direct database access - uses repository
 */
@Injectable()
export class StopsService {
  constructor(private readonly stopsRepository: StopsRepository) {}

  /**
   * Get all stops
   */
  async getAllStops(): Promise<Stop[]> {
    return this.stopsRepository.findAll();
  }

  /**
   * Get stop by ID
   */
  async getStopById(id: string): Promise<Stop | null> {
    return this.stopsRepository.findById(id);
  }

  /**
   * Find nearest stops to a location
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param radiusMeters - Search radius in meters (default: 1000m = 1km)
   * @param limit - Maximum number of results (default: 10)
   */
  async findNearestStops(
    latitude: number,
    longitude: number,
    radiusMeters: number = 1000,
    limit: number = 10,
  ): Promise<Stop[]> {
    return this.stopsRepository.findNearest(latitude, longitude, radiusMeters, limit);
  }

  /**
   * Find stops by transport type
   */
  async getStopsByType(type: StopType): Promise<Stop[]> {
    return this.stopsRepository.findByType(type);
  }
}


