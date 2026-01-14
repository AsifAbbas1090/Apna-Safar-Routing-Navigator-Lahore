import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Stop, StopType, Prisma } from '@prisma/client';

/**
 * Stops Repository
 * Handles all database operations for stops
 * Follows Repository Pattern - no business logic here
 * Uses PostGIS for efficient geospatial queries
 */
@Injectable()
export class StopsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find stop by ID
   */
  async findById(id: string): Promise<Stop | null> {
    return this.prisma.stop.findUnique({
      where: { id },
    });
  }

  /**
   * Find all stops
   */
  async findAll(where?: Prisma.StopWhereInput): Promise<Stop[]> {
    return this.prisma.stop.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find nearest stops to a coordinate
   * Uses PostGIS ST_DWithin for efficient geo queries
   * Falls back to Haversine if PostGIS is not available
   * 
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param radiusMeters - Search radius in meters (default: 500m)
   * @param limit - Maximum number of results (default: 10)
   * @returns Array of stops with distance_m field
   */
  async findNearest(
    latitude: number,
    longitude: number,
    radiusMeters: number = 500,
    limit: number = 10,
  ): Promise<(Stop & { distance_m: number })[]> {
    try {
      // PostGIS query using geography(Point,4326) column
      // ST_DWithin checks if point is within radius
      // ST_Distance calculates actual distance
      const rows = await this.prisma.$queryRaw<
        (Stop & { distance_m: number })[]
      >`
        SELECT
          s.*,
          ST_Distance(
            s.location,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
          ) AS distance_m
        FROM stops s
        WHERE s.location IS NOT NULL
          AND ST_DWithin(
            s.location,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusMeters}
          )
        ORDER BY distance_m
        LIMIT ${limit}
      `;

      return rows;
    } catch (error) {
      // Fallback: Simple distance calculation if PostGIS is not available
      console.warn('PostGIS not available, using fallback distance calculation', error);
      const allStops = await this.findAll();

      const stopsWithDistance = allStops
        .map((stop) => {
          const distance = this.calculateDistance(
            latitude,
            longitude,
            stop.latitude,
            stop.longitude,
          );
          return { stop, distance };
        })
        .filter((item) => item.distance <= radiusMeters)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit)
        .map((item) => ({
          ...item.stop,
          distance_m: item.distance,
        }));

      return stopsWithDistance;
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * Used as fallback when PostGIS is not available
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find stops by type
   */
  async findByType(type: StopType): Promise<Stop[]> {
    return this.prisma.stop.findMany({
      where: { type },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create a new stop
   * Location column will be auto-populated by database trigger if PostGIS is enabled
   */
  async create(data: Prisma.StopCreateInput): Promise<Stop> {
    return this.prisma.stop.create({
      data,
    });
  }

  /**
   * Update a stop
   */
  async update(id: string, data: Prisma.StopUpdateInput): Promise<Stop> {
    return this.prisma.stop.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a stop
   */
  async delete(id: string): Promise<Stop> {
    return this.prisma.stop.delete({
      where: { id },
    });
  }
}
