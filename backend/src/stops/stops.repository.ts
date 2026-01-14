import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Stop, StopType, Prisma } from '@prisma/client';

/**
 * Stops Repository
 * Handles all database operations for stops
 * Follows Repository Pattern - no business logic here
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
   * Uses PostGIS for efficient geo queries
   * Note: Requires PostGIS extension in database
   * 
   * Fallback: If PostGIS is not available, uses simple distance calculation
   */
  async findNearest(
    latitude: number,
    longitude: number,
    radiusMeters: number = 1000,
    limit: number = 10,
  ): Promise<Stop[]> {
    try {
      // Using raw SQL for PostGIS ST_DWithin function
      // Note: This requires PostGIS extension to be enabled
      return await this.prisma.$queryRaw<Stop[]>`
        SELECT * FROM stops
        WHERE ST_DWithin(
          ST_MakePoint(longitude, latitude)::geography,
          ST_MakePoint(${longitude}, ${latitude})::geography,
          ${radiusMeters}
        )
        ORDER BY ST_Distance(
          ST_MakePoint(longitude, latitude)::geography,
          ST_MakePoint(${longitude}, ${latitude})::geography
        )
        LIMIT ${limit}
      `;
    } catch (error) {
      // Fallback: Simple distance calculation if PostGIS is not available
      console.warn('PostGIS not available, using fallback distance calculation');
      const allStops = await this.findAll();
      
      // Calculate distance for each stop and filter
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
        .map((item) => item.stop);

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

